import type { Player, PlayerGroup } from "@/lib/types";
import { GROUP_LABELS } from "@/lib/player-utils";

const GROUP_ORDER: PlayerGroup[] = ["child", "adult"];

interface PlayerGroupSectionsProps {
  players: Player[];
  renderPlayer: (player: Player) => React.ReactNode;
}

export default function PlayerGroupSections({
  players,
  renderPlayer,
}: PlayerGroupSectionsProps) {
  const grouped = GROUP_ORDER.map((group) => ({
    group,
    players: players.filter((p) => p.group === group),
  })).filter((section) => section.players.length > 0);

  if (grouped.length <= 1) {
    return <>{players.map(renderPlayer)}</>;
  }

  return (
    <>
      {grouped.map(({ group, players: groupPlayers }) => (
        <div key={group} className="space-y-3">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-orange">
            {GROUP_LABELS[group]}
          </h3>
          {groupPlayers.map(renderPlayer)}
        </div>
      ))}
    </>
  );
}
