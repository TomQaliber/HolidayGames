import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import PlayerSetup from "@/components/PlayerSetup";
import { getPlayers } from "@/lib/players";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const players = await getPlayers();

  return (
    <main className="px-4 pb-8">
      <SiteHeader />
      <p className="mt-2 text-center text-sm text-navy/70">
        Add your family, pick an emoji, and say if they&apos;re a kid or grown-up.
      </p>
      <PlayerSetup initialPlayers={players} />
      <div className="mt-6 text-center">
        <Link
          href="/today"
          className="font-display text-sm font-semibold text-hot-pink underline"
        >
          Back to today&apos;s challenge
        </Link>
      </div>
    </main>
  );
}
