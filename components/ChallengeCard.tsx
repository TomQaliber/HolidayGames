import type { DayChallenge } from "@/lib/types";
import { formatDisplayDate } from "@/lib/holiday";

interface ChallengeCardProps {
  challenge: DayChallenge;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  return (
    <article className="card-festival p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="rounded-full bg-sun px-3 py-1 font-display text-sm font-semibold text-navy">
          Day {challenge.day}
        </span>
        <span className="text-sm text-navy/70">{formatDisplayDate(challenge.date)}</span>
      </div>

      <h1 className="font-display text-2xl font-bold leading-tight text-navy">
        {challenge.title}
      </h1>

      <p className="mt-1 font-display text-sm font-medium text-orange">
        ~{challenge.durationMinutes} min
      </p>

      <p className="mt-4 text-base leading-relaxed text-navy/90">{challenge.description}</p>

      {challenge.tips && challenge.tips.length > 0 && (
        <div className="mt-4 rounded-xl bg-sun/30 p-4">
          <p className="font-display text-sm font-semibold text-navy">Tips</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-navy/80">
            {challenge.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
