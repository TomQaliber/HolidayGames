import { promises as fs } from "fs";
import path from "path";
import holidayData from "@/data/holiday.json";
import { getKv } from "@/lib/kv";
import type { HolidayConfig, Player } from "@/lib/types";

const PLAYERS_KV_KEY = "players:list";
const LOCAL_STORE_PATH = path.join(process.cwd(), ".data", "players.json");

function getDefaultPlayers(): Player[] {
  const config = holidayData as HolidayConfig;
  return config.players.map((player) => ({
    ...player,
    group: player.group ?? "adult",
  }));
}

async function readLocalStore(): Promise<Player[] | null> {
  try {
    const raw = await fs.readFile(LOCAL_STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Player[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function writeLocalStore(players: Player[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
    await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(players, null, 2));
  } catch {
    // Vercel serverless filesystem is read-only — ignore persist failures.
  }
}

export async function getPlayers(): Promise<Player[]> {
  const kv = getKv();

  if (kv) {
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

  const local = await readLocalStore();
  if (local && local.length > 0) {
    return local.map(normalizePlayer);
  }

  const defaults = getDefaultPlayers();
  await writeLocalStore(defaults);
  return defaults;
}

export async function savePlayers(players: Player[]): Promise<Player[]> {
  const normalized = players.map(normalizePlayer);
  const kv = getKv();

  if (kv) {
    await kv.set(PLAYERS_KV_KEY, normalized);
    return normalized;
  }

  await writeLocalStore(normalized);
  return normalized;
}

function normalizePlayer(player: Player): Player {
  return {
    id: player.id.trim(),
    name: player.name.trim(),
    emoji: player.emoji.trim() || "🎪",
    group: player.group === "child" ? "child" : "adult",
  };
}
