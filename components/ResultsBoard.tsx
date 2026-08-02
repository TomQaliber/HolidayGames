import type { DayChallenge, Player, ResultEntry } from "@/lib/types";
import { formatResultValue } from "@/lib/holiday";
import { GROUP_LABELS, groupPlayers } from "@/lib/player-utils";
import PlayerGroupSections from "@/components/PlayerGroupSections";

interface ResultsBoardProps {
  players: Player[];
  results: ResultEntry[];
  challenge: DayChallenge;
}

function PlayerResultRow({
  player,
  result,
  challenge,
}: {
  player: Player;
  result?: ResultEntry;
  challenge: DayChallenge;
}) {
  return (
    <div className="card-festival flex items-center gap-3 px-4 py-3">
      <span className="text-2xl" aria-hidden>
        {player.emoji}
      </span>
      <div className="flex-1">
        <p className="font-display font-semibold text-navy">{player.name}</p>
        {result ? (
          <p className="text-base text-navy/80">
            {formatResultValue(result.value, challenge.resultType, challenge.resultUnit)}
          </p>
        ) : (
          <p className="text-sm italic text-navy/40">Not played yet</p>
        )}
      </div>
    </div>
  );
}

export default function ResultsBoard({ players, results, challenge }: ResultsBoardProps) {
  const resultMap = new Map(results.map((r) => [r.playerId, r]));
  const playedCount = players.filter((p) => resultMap.has(p.id)).length;
  const groups = groupPlayers(players);

  const participationParts = (["child", "adult"] as const)
    .map((group) => {
      const groupPlayersList = groups[group];
      if (groupPlayersList.length === 0) return null;
      const played = groupPlayersList.filter((p) => resultMap.has(p.id)).length;
      return `${played} of ${groupPlayersList.length} ${GROUP_LABELS[group].toLowerCase()}`;
    })
    .filter(Boolean);

  return (
    <section className="mt-8">
      <div className="mb-4 text-center">
        <h2 className="font-display text-xl font-bold text-navy">Today&apos;s results</h2>
        <p className="mt-1 text-sm text-navy/70">
          {playedCount === 0
            ? "No results yet — go play!"
            : participationParts.length > 1
              ? participationParts.join(" · ")
              : `${playedCount} of ${players.length} played today!`}
        </p>
      </div>

      <div className="space-y-5">
        <PlayerGroupSections
          players={players}
          renderPlayer={(player) => (
            <PlayerResultRow
              key={player.id}
              player={player}
              result={resultMap.get(player.id)}
              challenge={challenge}
            />
          )}
        />
      </div>
    </section>
  );
}
