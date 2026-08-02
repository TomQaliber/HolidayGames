import { NextResponse } from "next/server";
import { getDayByDate } from "@/lib/holiday";
import { getResultsForDate, saveResultsBatch } from "@/lib/results";
import { getPlayers } from "@/lib/players";
import type { BatchResultPayload } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "date is required" }, { status: 400 });
  }

  const results = await getResultsForDate(date);
  const players = await getPlayers();

  const ordered = players
    .map((player) => results.find((r) => r.playerId === player.id))
    .filter((r): r is NonNullable<typeof r> => r !== undefined);

  return NextResponse.json({ results: ordered });
}

export async function POST(request: Request) {
  const body = (await request.json()) as BatchResultPayload;
  const { date, entries } = body;

  if (!date || !entries?.length) {
    return NextResponse.json({ error: "date and entries are required" }, { status: 400 });
  }

  const day = getDayByDate(date);
  if (!day) {
    return NextResponse.json({ error: "No challenge for this date" }, { status: 404 });
  }

  const players = await getPlayers();
  const validPlayerIds = new Set(players.map((p) => p.id));
  const validEntries = entries.filter(
    (e) =>
      validPlayerIds.has(e.playerId) &&
      e.value !== "" &&
      e.value !== null &&
      e.value !== undefined
  );

  if (validEntries.length === 0) {
    return NextResponse.json({ error: "No valid entries to save" }, { status: 400 });
  }

  const result = await saveResultsBatch(
    date,
    validEntries.map((e) => ({
      playerId: e.playerId,
      value: e.value,
      resultType: day.resultType,
    }))
  );

  if (!result.ok) {
    return NextResponse.json(
      { error: "Failed to save results. Please try again." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, saved: validEntries.length });
}
