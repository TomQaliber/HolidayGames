"use client";

import { useState } from "react";
import type { DayChallenge, Player, ResultEntry } from "@/lib/types";
import { parseTimeInput } from "@/lib/holiday";
import ResultInput from "@/components/ResultInput";
import PlayerGroupSections from "@/components/PlayerGroupSections";

interface ScorekeeperFormProps {
  challenge: DayChallenge;
  players: Player[];
  existingResults: ResultEntry[];
  onSaved: () => void;
}

type PlayerValues = Record<
  string,
  { value: string; timeMinutes: string; timeSeconds: string }
>;

function buildInitialValues(
  players: Player[],
  existingResults: ResultEntry[],
  resultType: DayChallenge["resultType"]
): PlayerValues {
  const values: PlayerValues = {};

  for (const player of players) {
    const existing = existingResults.find((r) => r.playerId === player.id);
    if (existing && resultType === "time" && typeof existing.value === "number") {
      const mins = Math.floor(existing.value / 60);
      const secs = existing.value % 60;
      values[player.id] = {
        value: "",
        timeMinutes: String(mins),
        timeSeconds: String(secs),
      };
    } else if (existing) {
      values[player.id] = {
        value: String(existing.value),
        timeMinutes: "",
        timeSeconds: "",
      };
    } else {
      values[player.id] = { value: "", timeMinutes: "", timeSeconds: "" };
    }
  }

  return values;
}

export default function ScorekeeperForm({
  challenge,
  players,
  existingResults,
  onSaved,
}: ScorekeeperFormProps) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<PlayerValues>(() =>
    buildInitialValues(players, existingResults, challenge.resultType)
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updatePlayer(
    playerId: string,
    patch: Partial<PlayerValues[string]>
  ) {
    setValues((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], ...patch },
    }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const entries: { playerId: string; value: string | number }[] = [];

    for (const player of players) {
      const v = values[player.id];
      if (challenge.resultType === "time") {
        const seconds = parseTimeInput(v.timeMinutes, v.timeSeconds);
        if (seconds !== null) {
          entries.push({ playerId: player.id, value: seconds });
        }
      } else if (v.value.trim() !== "") {
        const num =
          challenge.resultType === "count" || challenge.resultType === "score"
            ? parseFloat(v.value)
            : v.value.trim();
        entries.push({ playerId: player.id, value: num });
      }
    }

    if (entries.length === 0) {
      setError("Enter at least one result before saving.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: challenge.date, entries }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not save results.");
        return;
      }

      setMessage(`Saved ${entries.length} result${entries.length === 1 ? "" : "s"}!`);
      setOpen(false);
      onSaved();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-festival w-full px-6 py-3 text-lg"
        >
          {"Enter today's results"}
        </button>
        {message && (
          <p className="mt-3 text-center font-display font-semibold text-turquoise">{message}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="mt-6">
      <div className="card-festival-alt p-5">
        <h2 className="font-display text-xl font-bold text-navy">Scorekeeper</h2>
        <p className="mt-1 text-sm text-navy/70">
          Enter a result for each player who played today.
        </p>

        <div className="mt-4 space-y-5">
          <PlayerGroupSections
            players={players}
            renderPlayer={(player) => (
              <div key={player.id} className="flex items-start gap-3">
                <span className="mt-2 text-2xl" aria-hidden>
                  {player.emoji}
                </span>
                <div className="flex-1">
                  <p className="font-display font-semibold text-navy">{player.name}</p>
                  <div className="mt-1">
                    <ResultInput
                      resultType={challenge.resultType}
                      resultLabel={challenge.resultLabel}
                      value={values[player.id]?.value ?? ""}
                      onChange={(v) => updatePlayer(player.id, { value: v })}
                      timeMinutes={values[player.id]?.timeMinutes ?? ""}
                      timeSeconds={values[player.id]?.timeSeconds ?? ""}
                      onTimeMinutesChange={(v) => updatePlayer(player.id, { timeMinutes: v })}
                      onTimeSecondsChange={(v) => updatePlayer(player.id, { timeSeconds: v })}
                    />
                  </div>
                </div>
              </div>
            )}
          />
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-coral/20 px-4 py-2 text-center text-sm font-semibold text-coral">
            {error}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 mt-4 flex gap-3 bg-cream/95 py-4 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="btn-festival-secondary flex-1 px-4 py-3"
        >
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-festival flex-1 px-4 py-3">
          {saving ? "Saving..." : "Save all"}
        </button>
      </div>
    </form>
  );
}
