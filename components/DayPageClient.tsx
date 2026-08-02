"use client";

import { useCallback, useEffect, useState } from "react";
import type { DayChallenge, Player, ResultEntry } from "@/lib/types";
import ChallengeCard from "@/components/ChallengeCard";
import ScorekeeperForm from "@/components/ScorekeeperForm";
import ResultsBoard from "@/components/ResultsBoard";
import DayNav from "@/components/DayNav";
import {
  getStorageMode,
  loadLocalPlayers,
  loadLocalResults,
} from "@/lib/client-store";

interface DayPageClientProps {
  challenge: DayChallenge;
  players: Player[];
  initialResults: ResultEntry[];
  showNav?: boolean;
}

export default function DayPageClient({
  challenge,
  players: serverPlayers,
  initialResults,
  showNav = true,
}: DayPageClientProps) {
  const [players, setPlayers] = useState<Player[]>(serverPlayers);
  const [results, setResults] = useState<ResultEntry[]>(initialResults);
  const [storageMode, setStorageMode] = useState<"redis" | "local">("redis");

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const mode = await getStorageMode();
      if (cancelled) return;
      setStorageMode(mode);

      if (mode === "local") {
        const localPlayers = loadLocalPlayers();
        if (localPlayers) setPlayers(localPlayers);

        const localResults = loadLocalResults(challenge.date);
        if (localResults.length > 0) {
          const list = localPlayers ?? serverPlayers;
          const ordered = list
            .map((player) => localResults.find((r) => r.playerId === player.id))
            .filter((r): r is ResultEntry => r !== undefined);
          setResults(ordered);
        }
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [challenge.date, serverPlayers]);

  const refreshResults = useCallback(async () => {
    const mode = await getStorageMode();
    setStorageMode(mode);

    const localPlayers = loadLocalPlayers() ?? players;
    if (loadLocalPlayers()) {
      setPlayers(localPlayers);
    }

    if (mode === "local") {
      const localResults = loadLocalResults(challenge.date);
      const ordered = localPlayers
        .map((player) => localResults.find((r) => r.playerId === player.id))
        .filter((r): r is ResultEntry => r !== undefined);
      setResults(ordered);
      return;
    }

    const res = await fetch(`/api/results?date=${challenge.date}`);
    if (res.ok) {
      const data = await res.json();
      if (data.storage === "local") {
        setStorageMode("local");
        const localResults = loadLocalResults(challenge.date);
        const ordered = localPlayers
          .map((player) => localResults.find((r) => r.playerId === player.id))
          .filter((r): r is ResultEntry => r !== undefined);
        setResults(ordered);
        return;
      }
      setResults(data.results ?? []);
    }
  }, [challenge.date, players]);

  return (
    <>
      <ChallengeCard challenge={challenge} />
      <ScorekeeperForm
        challenge={challenge}
        players={players}
        existingResults={results}
        storageMode={storageMode}
        onSaved={refreshResults}
      />
      <ResultsBoard players={players} results={results} challenge={challenge} />
      {showNav && <DayNav currentDay={challenge.day} />}
    </>
  );
}
