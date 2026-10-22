import { GameRoom, PendingAction, PublicPlayer } from './types';
import { actionInfo } from './cards';
export const currentPlayer = (room: GameRoom) => room.players[room.currentPlayerIndex] ?? null;
export const alivePlayers = (room: GameRoom) => room.players.filter(p => p.alive);
export const isMyTurn = (room: GameRoom, id: string | null) => room.phase === 'playing' && !room.pendingAction && !room.paused && currentPlayer(room)?.id === id && !!currentPlayer(room)?.alive;
export const mustCoup = (room: GameRoom, id: string | null) => (room.players.find(p => p.id === id)?.coins ?? 0) >= 10;
export function pendingLabel(a: PendingAction, players: PublicPlayer[]) {
  const name = (id: string | null) => players.find(p => p.id === id)?.username || 'Un joueur';
  if (a.stage === 'challengeBlock') return `${name(a.blockedBy)} contre avec ${a.blockRole}`;
  return `${name(a.actorId)} · ${actionInfo[a.type].name}${a.targetId ? ` → ${name(a.targetId)}` : ''}${a.targetRole ? ` · ${a.targetRole} visé` : ''}`;
}
export const stageLabel = (a: PendingAction) => ({ challengeAction: 'Croyez-vous cette annonce ?', challengeBlock: 'Croyez-vous ce contre ?', blockWindow: 'Une dernière occasion de contrer', awaitingReveal: 'Une influence doit être révélée', exchange: 'Échange de cartes en cours', inspectChoose: 'La cible choisit une carte à montrer', inspectDecision: 'L’Inquisiteur examine la carte' })[a.stage];
export const initials = (name: string) => name.trim().slice(0, 2).toUpperCase();
export const colorFromUsername = (name: string, offset = 0) => ['#375962', '#5A4963', '#63503E', '#3F5B4D', '#445373'][(Array.from(name).reduce((sum, c) => sum + c.charCodeAt(0), offset)) % 5];
