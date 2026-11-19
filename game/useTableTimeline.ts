import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { collectEvents, emptyCursor } from './timelinePolicy';
import { GameRoom, TableEvent } from './types';

export const eventDuration = (e: TableEvent) => e.kind === 'challenge' || e.kind === 'verdict' ? 1600 : e.kind === 'announce' ? 1100 : e.kind === 'attack' || e.kind === 'coins' || e.kind === 'cards' ? 1200 : 900;
// This is presentation state only. Commands and rules always use the engine snapshot.
export function useTableTimeline(room: GameRoom | null, connected: boolean) {
  const latest = useRef(room); latest.current = room;
  const cursor = useRef(emptyCursor());
  const [queue, setQueue] = useState<TableEvent[]>([]);
  const [shown, setShown] = useState<{ players: GameRoom['players']; currentPlayerIndex: number } | null>(null);
  const [foreground, setForeground] = useState(AppState.currentState !== 'background' && AppState.currentState !== 'inactive');
  useEffect(() => { const sub = AppState.addEventListener('change', state => setForeground(state === 'active')); return () => sub.remove(); }, []);
  const events = room?.visualEvents;
  const key = room ? `${room.code}:${room.round}` : '';
  useEffect(() => {
    const r = latest.current;
    const { cursor: next, reset, fresh } = collectEvents(cursor.current, key, events, connected, foreground);
    if (reset) { setQueue([]); setShown(r ? { players: r.players, currentPlayerIndex: r.currentPlayerIndex } : null); }
    else if (fresh.length) setQueue(q => q.length + fresh.length > 16 ? fresh.slice(-1) : [...q, ...fresh]);
    cursor.current = next;
  }, [events, key, connected, foreground]);
  const current = queue[0];
  const complete = useCallback((id: number) => {
    setQueue(q => q[0]?.id === id ? q.slice(1) : q);
  }, []);
  useEffect(() => {
    if (!current) return;
    const timer = setTimeout(() => {
      setShown({ players: current.players, currentPlayerIndex: current.currentPlayerIndex });
      complete(current.id);
    }, eventDuration(current));
    return () => clearTimeout(timer);
  }, [current, complete]);
  // Include not-yet-ingested events so forced choice sheets never flash over an impact.
  const unseen = (events?.at(-1)?.id || 0) > cursor.current.id && cursor.current.key === key;
  const busy = queue.length > 0 || unseen;
  return { current, busy, players: busy && shown ? shown.players : room?.players || [], currentPlayerIndex: busy && shown ? shown.currentPlayerIndex : room?.currentPlayerIndex || 0 };
}
export type TableTimeline = ReturnType<typeof useTableTimeline>;
