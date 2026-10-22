export type RoleName = 'Duchesse' | 'Assassin' | 'Capitaine' | 'Comtesse' | 'Ambassadeur' | 'Inquisiteur';
export type Variant = 'Ambassadeur' | 'Inquisiteur';
export interface CardState { role: RoleName; revealed: boolean }
export interface PublicPlayer {
  id: string; username: string; coins: number; alive: boolean; influenceCount: number;
  revealedInfluences: CardState[]; connected: boolean; ready: boolean; drafted: boolean;
  wins: number; eliminatedAt: number | null;
}
export type ActionType = 'income' | 'foreign_aid' | 'duchess' | 'steal' | 'assassinate' | 'coup' | 'exchange' | 'inspect';
export interface PendingAction {
  id: string; type: ActionType; actorId: string; targetId: string | null;
  claimedRole: RoleName | null; stage: 'challengeAction' | 'challengeBlock' | 'blockWindow' | 'awaitingReveal' | 'exchange' | 'inspectChoose' | 'inspectDecision';
  targetRole: RoleName | null;
  blockedBy: string | null; blockRole: RoleName | null; awaitingId: string | null;
  eligibleIds: string[]; respondedIds: string[];
}
export interface GameRoom {
  code: string; host: string; phase: 'waiting' | 'drafting' | 'playing' | 'finished';
  variant: Variant; currentPlayerIndex: number; turn: number; round: number; deckCount: number;
  pendingAction: PendingAction | null; players: PublicPlayer[]; paused: boolean;
  winnerId: string | null; history: { id: number; turn: number; text: string }[];
}
export interface MustRevealPayload { reason: 'challenge_lost' | 'challenge_failed' | 'assassinated' | 'coup'; targetRole: RoleName | null }
export interface ExchangeOptions { currentCards: CardState[]; drawnCards: CardState[] }
export interface GameState {
  room: GameRoom | null; myId: string | null; myCards: CardState[];
  mustReveal: MustRevealPayload | null; exchangeOptions: ExchangeOptions | null;
  inspection: { role: RoleName; targetName: string } | null; draftRoles: RoleName[];
}
