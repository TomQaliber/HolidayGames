import { NextResponse } from "next/server";
import { getPlayers, savePlayers } from "@/lib/players";
import type { Player } from "@/lib/types";

export async function GET() {
  const players = await getPlayers();
  return NextResponse.json({ players });
}

export async function PUT(request: Request) {
  const body = await request.json();
  const players = body.players as Player[];

  if (!Array.isArray(players)) {
    return NextResponse.json({ error: "players array is required" }, { status: 400 });
  }

  if (players.length === 0) {
    return NextResponse.json({ error: "At least one player is required" }, { status: 400 });
  }

  const ids = new Set<string>();
  for (const player of players) {
    if (!player.id?.trim() || !player.name?.trim()) {
      return NextResponse.json({ error: "Every player needs a name" }, { status: 400 });
    }
    if (ids.has(player.id)) {
      return NextResponse.json({ error: "Duplicate player ids" }, { status: 400 });
    }
    ids.add(player.id);
  }

  const result = await savePlayers(players);
  if (!result.ok) {
    return NextResponse.json(
      { error: "Failed to save players. Please try again." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: true, players: result.players });
}
