import holidayData from "@/data/holiday.json";
import { getKv } from "@/lib/kv";
import type { HolidayConfig, Player } from "@/lib/types";

const PLAYERS_KV_KEY = "players:list";

export type SavePlayersResult =
  | { ok: true; players: Player[] }
  | { ok: false; error: "REDIS_UNAVAILABLE" };

function getDefaultPlayers(): Player[] {
  const config = holidayData as HolidayConfig;
  return config.players.map((player) => ({
    ...player,
    group: player.group ?? "adult",
  }));
}

export async function getPlayers(): Promise<Player[]> {
  const kv = getKv();

  if (!kv) {
    console.error("Redis not configured");
    return getDefaultPlayers();
  }

  try {
    const stored = await kv.get<Player[]>(PLAYERS_KV_KEY);
    if (stored && stored.length > 0) {
      return stored.map(normalizePlayer);
    }
    const defaults = getDefaultPlayers();
    await kv.set(PLAYERS_KV_KEY, defaults);
    return defaults;
  } catch (error) {
    console.error("Failed to load players from Redis:", error);
    return getDefaultPlayers();
  }
}

export async function savePlayers(players: Player[]): Promise<SavePlayersResult> {
  const normalized = players.map(normalizePlayer);
  const kv = getKv();

  if (!kv) {
    return { ok: false, error: "REDIS_UNAVAILABLE" };
  }

  try {
    await kv.set(PLAYERS_KV_KEY, normalized);
    return { ok: true, players: normalized };
  } catch (error) {
    console.error("Failed to save players to Redis:", error);
    return { ok: false, error: "REDIS_UNAVAILABLE" };
  }
}

function normalizePlayer(player: Player): Player {
  return {
    id: player.id.trim(),
    name: player.name.trim(),
    emoji: player.emoji.trim() || "🎪",
    group: player.group === "child" ? "child" : "adult",
  };
}
