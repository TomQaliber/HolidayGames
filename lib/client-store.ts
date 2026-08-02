import type { Player, ResultEntry, ResultType } from "@/lib/types";

const PLAYERS_KEY = "hg_players";
const RESULTS_PREFIX = "hg_results:";

function canUseBrowserStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadLocalPlayers(): Player[] | null {
  if (!canUseBrowserStorage()) return null;
  try {
    const raw = window.localStorage.getItem(PLAYERS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Player[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function saveLocalPlayers(players: Player[]): void {
  if (!canUseBrowserStorage()) return;
  window.localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
}

export function loadLocalResults(date: string): ResultEntry[] {
  if (!canUseBrowserStorage()) return [];
  try {
    const raw = window.localStorage.getItem(RESULTS_PREFIX + date);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ResultEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalResultsBatch(
  date: string,
  entries: { playerId: string; value: string | number; resultType: ResultType }[]
): ResultEntry[] {
  if (!canUseBrowserStorage()) return [];

  const existing = loadLocalResults(date);
  const byPlayer = new Map(existing.map((r) => [r.playerId, r]));
  const submittedAt = new Date().toISOString();

  for (const entry of entries) {
    byPlayer.set(entry.playerId, {
      playerId: entry.playerId,
      value: entry.value,
      resultType: entry.resultType,
      submittedAt,
    });
  }

  const next = Array.from(byPlayer.values());
  window.localStorage.setItem(RESULTS_PREFIX + date, JSON.stringify(next));
  return next;
}

export async function getStorageMode(): Promise<"redis" | "local"> {
  try {
    const res = await fetch("/api/storage");
    if (!res.ok) return "local";
    const data = (await res.json()) as { mode?: string };
    return data.mode === "redis" ? "redis" : "local";
  } catch {
    return "local";
  }
}
