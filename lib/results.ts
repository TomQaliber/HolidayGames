import { kv } from "@vercel/kv";
import { promises as fs } from "fs";
import path from "path";
import type { ResultEntry } from "@/lib/types";

const LOCAL_STORE_PATH = path.join(process.cwd(), ".data", "results.json");

function hasKvConfig(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function resultKey(date: string, playerId: string): string {
  return `results:${date}:${playerId}`;
}

async function readLocalStore(): Promise<Record<string, ResultEntry>> {
  try {
    const raw = await fs.readFile(LOCAL_STORE_PATH, "utf-8");
    return JSON.parse(raw) as Record<string, ResultEntry>;
  } catch {
    return {};
  }
}

async function writeLocalStore(store: Record<string, ResultEntry>): Promise<void> {
  await fs.mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
  await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(store, null, 2));
}

export async function getResultsForDate(date: string): Promise<ResultEntry[]> {
  if (hasKvConfig()) {
    const keys = await kv.keys(`results:${date}:*`);
    if (keys.length === 0) return [];

    const entries = await Promise.all(
      keys.map(async (key) => {
        const entry = await kv.get<ResultEntry>(key);
        return entry;
      })
    );

    return entries.filter((e): e is ResultEntry => e !== null);
  }

  const store = await readLocalStore();
  return Object.entries(store)
    .filter(([key]) => key.startsWith(`results:${date}:`))
    .map(([, entry]) => entry);
}

export async function saveResultsBatch(
  date: string,
  entries: { playerId: string; value: string | number; resultType: ResultEntry["resultType"] }[]
): Promise<void> {
  const submittedAt = new Date().toISOString();

  if (hasKvConfig()) {
    await Promise.all(
      entries.map((entry) =>
        kv.set(resultKey(date, entry.playerId), {
          playerId: entry.playerId,
          value: entry.value,
          resultType: entry.resultType,
          submittedAt,
        } satisfies ResultEntry)
      )
    );
    return;
  }

  const store = await readLocalStore();
  for (const entry of entries) {
    store[resultKey(date, entry.playerId)] = {
      playerId: entry.playerId,
      value: entry.value,
      resultType: entry.resultType,
      submittedAt,
    };
  }
  await writeLocalStore(store);
}
