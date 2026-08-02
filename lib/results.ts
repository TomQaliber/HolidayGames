import { promises as fs } from "fs";
import path from "path";
import { getKv } from "@/lib/kv";
import type { ResultEntry } from "@/lib/types";

const LOCAL_STORE_PATH = path.join(process.cwd(), ".data", "results.json");

function canUseLocalFiles(): boolean {
  return !process.env.VERCEL;
}

function resultKey(date: string, playerId: string): string {
  return `results:${date}:${playerId}`;
}

async function readLocalStore(): Promise<Record<string, ResultEntry>> {
  if (!canUseLocalFiles()) return {};
  try {
    const raw = await fs.readFile(LOCAL_STORE_PATH, "utf-8");
    return JSON.parse(raw) as Record<string, ResultEntry>;
  } catch {
    return {};
  }
}

async function writeLocalStore(store: Record<string, ResultEntry>): Promise<void> {
  if (!canUseLocalFiles()) return;
  try {
    await fs.mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
    await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(store, null, 2));
  } catch (error) {
    console.error("Failed to write local results store:", error);
  }
}

export async function getResultsForDate(date: string): Promise<ResultEntry[]> {
  const kv = getKv();

  if (kv) {
    try {
      const keys = await kv.keys(`results:${date}:*`);
      if (keys.length === 0) return [];

      const entries = await Promise.all(
        keys.map(async (key) => {
          const entry = await kv.get<ResultEntry>(key);
          return entry;
        })
      );

      return entries.filter((e): e is ResultEntry => e !== null);
    } catch (error) {
      console.error("Failed to load results from Redis:", error);
      return [];
    }
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
  const kv = getKv();

  if (kv) {
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

  if (!canUseLocalFiles()) {
    throw new Error(
      "Saving results needs Redis on Vercel. Add Upstash Redis in the Vercel dashboard."
    );
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
