import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import DayPageClient from "@/components/DayPageClient";
import { getDayByNumber } from "@/lib/holiday";
import { getResultsForDate } from "@/lib/results";
import { getPlayers } from "@/lib/players";

export const dynamic = "force-dynamic";

interface DayPageProps {
  params: Promise<{ n: string }>;
}

export default async function DayPage({ params }: DayPageProps) {
  const { n } = await params;
  const dayNumber = parseInt(n, 10);

  if (isNaN(dayNumber)) {
    notFound();
  }

  const challenge = getDayByNumber(dayNumber);
  if (!challenge) {
    notFound();
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
