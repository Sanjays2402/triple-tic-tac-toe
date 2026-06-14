import type { Player } from "./engine";

/** A selectable neon color theme for a player's mark. */
export interface NeonColor {
  id: string;
  name: string;
  /** Main color used for marks, glows and accents. */
  base: string;
  /** Lighter shade used for soft highlights (e.g. confetti). */
  soft: string;
}

/** Color options players can pick from. */
export const PALETTE: NeonColor[] = [
  { id: "cyan", name: "Cyan", base: "#22d3ee", soft: "#67e8f9" },
  { id: "pink", name: "Pink", base: "#fb5fa0", soft: "#fda4d0" },
  { id: "violet", name: "Violet", base: "#a78bfa", soft: "#c4b5fd" },
  { id: "emerald", name: "Emerald", base: "#34d399", soft: "#6ee7b7" },
  { id: "amber", name: "Amber", base: "#fbbf24", soft: "#fcd34d" },
  { id: "rose", name: "Rose", base: "#fb7185", soft: "#fda4af" },
  { id: "blue", name: "Blue", base: "#60a5fa", soft: "#93c5fd" },
  { id: "lime", name: "Lime", base: "#a3e635", soft: "#bef264" },
  { id: "orange", name: "Orange", base: "#fb923c", soft: "#fdba74" },
];

/** Default color id for each player. */
export const DEFAULT_COLOR: Record<Player, string> = {
  X: "cyan",
  O: "pink",
};

const FALLBACK: Record<Player, NeonColor> = {
  X: PALETTE[0],
  O: PALETTE[1],
};

/** Resolve a color id to its definition, falling back to the player default. */
export function getColor(id: string, player: Player): NeonColor {
  return PALETTE.find((c) => c.id === id) ?? FALLBACK[player];
}
