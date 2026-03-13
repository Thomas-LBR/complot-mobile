import { RoleName } from "./types";

export interface RoleInfo {
  bg: string;
  border: string;
  glow: string;
  symbol: string;
  color: string;
  desc: string;
  blockDesc?: string;
}

export const ROLES: Record<RoleName, RoleInfo> = {
  Duchesse:    { bg: "#1e1200", border: "#d4a020", glow: "#ffe066", symbol: "♛", color: "#e8b830", desc: "Prend 3 pièces au trésor",       blockDesc: "Bloque l'Aide Étrangère" },
  Assassin:    { bg: "#180600", border: "#c01818", glow: "#ff5533", symbol: "⚔", color: "#e03020", desc: "Assassine pour 3 pièces" },
  Capitaine:   { bg: "#000e20", border: "#1a55cc", glow: "#66aaff", symbol: "⚓", color: "#2a6eee", desc: "Vole 2 pièces à un joueur",       blockDesc: "Bloque le Vol" },
  Comtesse:    { bg: "#160016", border: "#9922bb", glow: "#ee66ff", symbol: "♥", color: "#cc33ee", desc: "Bloque l'Assassin",               blockDesc: "Bloque l'Assassinat" },
  Ambassadeur: { bg: "#001610", border: "#18884a", glow: "#44ffaa", symbol: "☮", color: "#22cc66", desc: "Échange 2 cartes",                blockDesc: "Bloque le Vol" },
};

export const ALL_ROLES: RoleName[] = ["Duchesse", "Assassin", "Capitaine", "Comtesse", "Ambassadeur"];

// Qui peut bloquer quoi (miroir serveur)
export const BLOCKS: Record<string, RoleName[]> = {
  steal:       ["Capitaine", "Ambassadeur"],
  assassinate: ["Comtesse"],
  foreign_aid: ["Duchesse"],
  duchess:     [],
  coup:        [],
  exchange:    [],
};