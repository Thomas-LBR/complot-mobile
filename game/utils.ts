import { GameRoom, PendingAction, PublicPlayer } from "./types";

export function currentPlayer(room: GameRoom): PublicPlayer | null {
  return room.players[room.currentPlayerIndex] ?? null;
}

export function alivePlayers(room: GameRoom): PublicPlayer[] {
  return room.players.filter((p) => p.alive);
}

export function isMyTurn(room: GameRoom, myId: string): boolean {
  if (room.phase !== "playing" || room.pendingAction) return false;
  const cur = currentPlayer(room);
  return !!cur && cur.id === myId && cur.alive;
}

export function mustCoup(room: GameRoom, myId: string): boolean {
  const me = room.players.find((p) => p.id === myId);
  return !!me && me.coins >= 10;
}

/** Label court pour afficher l'action en cours dans le bandeau */
export function pendingLabel(pa: PendingAction, players: PublicPlayer[]): string {
  const actor  = players.find((p) => p.id === pa.actorId);
  const target = pa.targetId ? players.find((p) => p.id === pa.targetId) : null;
  const actionNames: Record<string, string> = {
    duchess:     "👑 Duchesse +3",
    foreign_aid: "💰 Aide étrangère +2",
    steal:       "⚓ Vol (Capitaine)",
    assassinate: "⚔ Assassinat",
    coup:        "💥 Coup d'État",
    exchange:    "☮ Échange (Ambassadeur)",
  };
  const aName = actionNames[pa.type] ?? pa.type;
  return `${actor?.username ?? "?"} — ${aName}${target ? ` → ${target.username}` : ""}`;
}

export function stageLabel(pa: PendingAction): string {
  switch (pa.stage) {
    case "challengeAction": return "Contester l'action ?";
    case "blockWindow":     return "Bloquer l'action ?";
    case "challengeBlock":  return "Contester le blocage ?";
    case "awaitingReveal":  return "En attente de révélation…";
    default:                return "";
  }
}

/** Dérive une couleur hex depuis un username (pour l'avatar) */
export function colorFromUsername(username: string, offset = 0): string {
  const code = (username.charCodeAt(0) + offset) % 360;
  return `hsl(${code}, 55%, 38%)`;
}

/** Initiales d'un username */
export function initials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}