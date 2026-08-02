import { getKv } from "@/lib/kv";
import type { ResultEntry } from "@/lib/types";

export type SaveResultsResult =
  | { ok: true }
  | { ok: false; error: "REDIS_UNAVAILABLE" };

function resultKey(date: string, playerId: string): string {
  return `results:${date}:${playerId}`;
}

export async function getResultsForDate(date: string): Promise<ResultEntry[]> {
  const kv = getKv();

  if (!kv) {
    console.error("Redis not configured");
    return [];
  }

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

export async function saveResultsBatch(
  date: string,
  entries: { playerId: string; value: string | number; resultType: ResultEntry["resultType"] }[]
): Promise<SaveResultsResult> {
  const kv = getKv();

  if (!kv) {
    return { ok: false, error: "REDIS_UNAVAILABLE" };
  }

  try {
    const submittedAt = new Date().toISOString();
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
    return { ok: true };
  } catch (error) {
    console.error("Failed to save results to Redis:", error);
    return { ok: false, error: "REDIS_UNAVAILABLE" };
  }
}
