import SiteHeader from "@/components/SiteHeader";
import PinGate from "@/components/PinGate";

interface UnlockPageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function UnlockPage({ searchParams }: UnlockPageProps) {
  const { from } = await searchParams;
  const redirectTo = from && from.startsWith("/") ? from : "/today";

  return (
    <main className="px-4 pb-8">
      <SiteHeader />
      <div className="card-festival mx-auto mt-8 max-w-sm p-6 text-center">
        <p className="font-display text-lg text-navy">
          Welcome! Enter the family PIN to join the fun.
        </p>
        <div className="mt-6">
          <PinGate redirectTo={redirectTo} />
        </div>
      </div>
    </main>
  );
}
