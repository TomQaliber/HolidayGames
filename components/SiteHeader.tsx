import Link from "next/link";
import { getHolidayConfig } from "@/lib/holiday";

export default function SiteHeader() {
  const config = getHolidayConfig();

  return (
    <header className="sunburst-header px-4 pb-4 pt-6 text-center">
      <p className="font-display text-sm font-medium uppercase tracking-widest text-orange">
        ☀️ Festival of Fun ☀️
      </p>
      <h1 className="font-display text-3xl font-bold text-navy">{config.name}</h1>
      <Link
        href="/setup"
        className="mt-2 inline-block font-display text-sm font-semibold text-hot-pink underline"
      >
        Manage players
      </Link>
    </header>
  );
}
