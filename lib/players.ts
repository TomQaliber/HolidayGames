import { kv } from "@vercel/kv";
import { promises as fs } from "fs";
import path from "path";
import holidayData from "@/data/holiday.json";
import type { HolidayConfig, Player } from "@/lib/types";

const PLAYERS_KV_KEY = "players:list";
const LOCAL_STORE_PATH = path.join(process.cwd(), ".data", "players.json");

function hasKvConfig(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

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
  await fs.mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
  await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(players, null, 2));
}

export async function getPlayers(): Promise<Player[]> {
  if (hasKvConfig()) {
    const stored = await kv.get<Player[]>(PLAYERS_KV_KEY);
    if (stored && stored.length > 0) {
      return stored.map(normalizePlayer);
    }
    const defaults = getDefaultPlayers();
    await kv.set(PLAYERS_KV_KEY, defaults);
    return defaults;
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

  if (hasKvConfig()) {
    await kv.set(PLAYERS_KV_KEY, normalized);
  } else {
    await writeLocalStore(normalized);
  }

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
