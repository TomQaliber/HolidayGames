"use client";

import { useCallback, useState } from "react";
import type { DayChallenge, Player, ResultEntry } from "@/lib/types";
import ChallengeCard from "@/components/ChallengeCard";
import ScorekeeperForm from "@/components/ScorekeeperForm";
import ResultsBoard from "@/components/ResultsBoard";
import DayNav from "@/components/DayNav";

interface DayPageClientProps {
  challenge: DayChallenge;
  players: Player[];
  initialResults: ResultEntry[];
  showNav?: boolean;
}

export default function DayPageClient({
  challenge,
  players,
  initialResults,
  showNav = true,
}: DayPageClientProps) {
  const [results, setResults] = useState<ResultEntry[]>(initialResults);

  const refreshResults = useCallback(async () => {
    const res = await fetch(`/api/results?date=${challenge.date}`);
    if (res.ok) {
      const data = await res.json();
      setResults(data.results ?? []);
    }
  }, [challenge.date]);

  return (
    <>
      <ChallengeCard challenge={challenge} />
      <ScorekeeperForm
        challenge={challenge}
        players={players}
        existingResults={results}
        onSaved={refreshResults}
      />
      <ResultsBoard players={players} results={results} challenge={challenge} />
      {showNav && <DayNav currentDay={challenge.day} />}
    </>
  );
}
