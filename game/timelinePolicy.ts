import type { TableEvent } from './types';
export interface TimelineCursor { key: string; id: number; reconnecting: boolean; disconnectedEvents?: TableEvent[] }
export const emptyCursor = (): TimelineCursor => ({ key: '', id: 0, reconnecting: false });
export function collectEvents(previous: TimelineCursor, key: string, events: TableEvent[] | undefined, connected: boolean, foreground: boolean) {
  const entries = events || [], fresh = entries.filter(e => e.id > previous.id);
  const reconnecting = !connected || previous.reconnecting;
  const disconnectedEvents = !connected ? events : previous.disconnectedEvents;
  const reset = previous.key !== key || reconnecting || !foreground || fresh.length > 12 || !!(fresh[0] && fresh[0].id > previous.id + 1);
  const cursor: TimelineCursor = { key, id: entries.at(-1)?.id || 0,
    reconnecting: reconnecting && (!connected || events === disconnectedEvents), disconnectedEvents };
  return { cursor, reset, fresh: reset ? [] : fresh };
}
