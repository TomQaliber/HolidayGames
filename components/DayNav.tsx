import Link from "next/link";
import { getHolidayConfig } from "@/lib/holiday";

interface DayNavProps {
  currentDay: number;
}

export default function DayNav({ currentDay }: DayNavProps) {
  const config = getHolidayConfig();
  const days = config.days;

  return (
    <nav className="mt-8 border-t-2 border-navy/10 pt-6" aria-label="Other days">
      <h2 className="font-display text-lg font-bold text-navy">All days</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {days.map((day) => (
          <li key={day.day}>
            <Link
              href={day.day === currentDay ? "/today" : `/day/${day.day}`}
              className={`inline-block rounded-full border-2 border-navy px-4 py-2 font-display text-sm font-semibold ${
                day.day === currentDay
                  ? "bg-hot-pink text-white"
                  : "bg-white text-navy"
              }`}
            >
              Day {day.day}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
