import { useCallback, useEffect, useRef, useState } from 'react';
import { getSocket, rememberSession } from './setup';
import { ActionType, GameState, RoleName, Variant } from './types';
const initial: GameState = { room: null, myId: null, myCards: [], mustReveal: null, exchangeOptions: null, inspection: null, draftRoles: [] };
export function useGameEngine() {
  const [state, setState] = useState(initial);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const s = getSocket(); socketRef.current = s;
    const clearBusy = () => { setBusy(false); if (timer.current) clearTimeout(timer.current); };
    const onState = (next: GameState) => { setState(next); clearBusy(); setError(null); };
    const onConnect = () => setConnected(true);
    const onDisconnect = () => { setConnected(false); clearBusy(); };
    const onError = (message: string) => { setError(message); clearBusy(); };
    const onSession = ({ token }: { token: string }) => { rememberSession(token); s.auth = { sessionToken: token }; };
    const onLeft = () => { rememberSession(''); s.auth = {}; setState(initial); clearBusy(); };
    const onExpired = () => { onLeft(); setError('La salle a expiré ou le serveur a redémarré. Créez ou rejoignez une salle.'); };
    s.on('gameState', onState); s.on('session', onSession); s.on('leftRoom', onLeft);
    s.on('sessionExpired', onExpired);
    s.on('connect', onConnect); s.on('disconnect', onDisconnect); s.on('errorMessage', onError);
    s.on('connect_error', onDisconnect); setConnected(s.connected);
    if (s.connected) s.emit('sync'); else s.connect();
    return () => {
      s.off('gameState', onState); s.off('session', onSession); s.off('leftRoom', onLeft);
      s.off('sessionExpired', onExpired);
      s.off('connect', onConnect); s.off('disconnect', onDisconnect); s.off('errorMessage', onError); s.off('connect_error', onDisconnect);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  const emit = useCallback((event: string, payload: object = {}) => {
    const s = socketRef.current;
    if (!s?.connected) { setError('Connexion perdue. Reconnexion en cours…'); return; }
    setError(null); setBusy(true); s.emit(event, payload);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { setBusy(false); setError('Le serveur ne répond pas. Réessayez.'); }, 8000);
  }, []);
  return {
    ...state, connected, busy, error, roomCode: state.room?.code ?? null,
    createRoom: (username: string) => emit('createRoom', { username }),
    joinRoom: (roomCode: string, username: string) => emit('joinRoom', { roomCode, username }),
    setReady: () => emit('setReady'), setVariant: (variant: Variant) => emit('setVariant', { variant }),
    startGame: () => emit('startGame'), draftRole: (role: RoleName) => emit('draftRole', { role }),
    act: (type: ActionType, targetId?: string, targetRole?: RoleName) => emit('act', { type, targetId, targetRole }),
    pass: () => emit('pass'), challenge: () => emit('challenge'), block: (role: RoleName) => emit('block', { role }),
    reveal: (index: number) => emit('reveal', { index }), exchange: (indices: number[]) => emit('exchange', { indices }),
    inspectChoose: (index: number) => emit('inspectChoose', { index }), inspectDecide: (replace: boolean) => emit('inspectDecide', { replace }),
    rematch: () => emit('rematch'), leave: () => emit('leaveRoom'),
    removeDisconnected: (id: string) => emit('removeDisconnected', { id }),
    reconnect: () => socketRef.current?.connect(), clearError: () => setError(null),
  };
}
