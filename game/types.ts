export type RoleName = "Duchesse" | "Assassin" | "Capitaine" | "Comtesse" | "Ambassadeur";

export interface CardState {
  role: RoleName;
  revealed: boolean;
}

export interface PublicPlayer {
  id: string;
  username: string;
  coins: number;
  alive: boolean;
  influenceCount: number;
  revealedInfluences: CardState[];
}

export type ActionType = "duchess" | "foreign_aid" | "steal" | "assassinate" | "coup" | "exchange";
export type ActionStage = "challengeAction" | "blockWindow" | "challengeBlock" | "awaitingReveal";
export type RevealReason = "challenge_lost" | "challenge_failed" | "assassinated" | "coup";

export interface PendingAction {
  type: ActionType;
  actorId: string;
  targetId: string | null;
  claimedRole: RoleName | null;
  guessedRole: RoleName | null;
  revealSpecificRole: RoleName | null;
  stage: ActionStage;
  blockedBy: string | null;
  blockRole: RoleName | null;
  challengedBy: string | null;
}

export interface GameRoom {
  host: string;
  phase: "waiting" | "playing" | "finished";
  currentPlayerIndex: number;
  pendingAction: PendingAction | null;
  players: PublicPlayer[];
}

export interface MustRevealPayload {
  roomCode: string;
  reason: RevealReason;
  targetRole: RoleName | null;
}

export interface ExchangeOptions {
  currentCards: CardState[];
  drawnCards: CardState[];
}