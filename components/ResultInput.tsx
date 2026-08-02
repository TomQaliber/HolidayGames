"use client";

import type { DayChallenge } from "@/lib/types";

interface ResultInputProps {
  resultType: DayChallenge["resultType"];
  resultLabel: string;
  value: string;
  onChange: (value: string) => void;
  timeMinutes?: string;
  timeSeconds?: string;
  onTimeMinutesChange?: (v: string) => void;
  onTimeSecondsChange?: (v: string) => void;
}

export default function ResultInput({
  resultType,
  resultLabel,
  value,
  onChange,
  timeMinutes = "",
  timeSeconds = "",
  onTimeMinutesChange,
  onTimeSecondsChange,
}: ResultInputProps) {
  if (resultType === "time") {
    return (
      <div>
        <span className="mb-1 block text-sm font-semibold text-navy/70">{resultLabel}</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="0"
            aria-label="Minutes"
            value={timeMinutes}
            onChange={(e) => onTimeMinutesChange?.(e.target.value)}
            className="input-festival w-20 text-center"
          />
          <span className="font-display font-semibold">min</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={59}
            placeholder="00"
            aria-label="Seconds"
            value={timeSeconds}
            onChange={(e) => onTimeSecondsChange?.(e.target.value)}
            className="input-festival w-20 text-center"
          />
          <span className="font-display font-semibold">sec</span>
        </div>
      </div>
    );
  }

  if (resultType === "text") {
    return (
      <div>
        <label className="mb-1 block text-sm font-semibold text-navy/70">{resultLabel}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type answer..."
          className="input-festival"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-navy/70">{resultLabel}</label>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        className="input-festival"
      />
    </div>
  );
}
