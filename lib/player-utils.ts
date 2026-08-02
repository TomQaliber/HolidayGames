import type { Player, PlayerGroup } from "@/lib/types";

export const GROUP_LABELS: Record<PlayerGroup, string> = {
  child: "Kids",
  adult: "Grown-ups",
};

export function createPlayerId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 20);
  const suffix = Date.now().toString(36).slice(-4);
  return slug ? `${slug}-${suffix}` : `player-${suffix}`;
}

export function groupPlayers(players: Player[]): Record<PlayerGroup, Player[]> {
  return {
    child: players.filter((p) => p.group === "child"),
    adult: players.filter((p) => p.group === "adult"),
  };
}
