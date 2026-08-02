import SiteHeader from "@/components/SiteHeader";
import DayPageClient from "@/components/DayPageClient";
import { getHolidayConfig, getTodayChallenge, isHolidayActive } from "@/lib/holiday";
import { getResultsForDate } from "@/lib/results";
import { getPlayers } from "@/lib/players";
import Link from "next/link";

export default async function TodayPage() {
  const config = getHolidayConfig();
  const challenge = getTodayChallenge();
  const active = isHolidayActive();

  if (!challenge) {
    return (
      <main className="px-4 pb-8">
        <SiteHeader />
        <div className="card-festival mt-8 p-6 text-center">
          <p className="font-display text-xl font-bold text-navy">
            {active ? "No challenge scheduled for today." : "Holiday games are on a break!"}
          </p>
          <p className="mt-2 text-navy/70">
            {active
              ? "Check back tomorrow or browse past days below."
              : `Games run from ${config.startDate} to ${config.endDate}.`}
          </p>
          <DayNavFallback />
        </div>
      </main>
    );
  }

  const results = await getResultsForDate(challenge.date);
  const players = await getPlayers();

  return (
    <main className="px-4 pb-8">
      <SiteHeader />
      <DayPageClient
        challenge={challenge}
        players={players}
        initialResults={results}
      />
    </main>
  );
}

function DayNavFallback() {
  const config = getHolidayConfig();
  return (
    <nav className="mt-6 flex flex-wrap justify-center gap-2">
      {config.days.map((day) => (
        <Link
          key={day.day}
          href={`/day/${day.day}`}
          className="rounded-full border-2 border-navy bg-white px-4 py-2 font-display text-sm font-semibold text-navy"
        >
          Day {day.day}
        </Link>
      ))}
    </nav>
  );
}
