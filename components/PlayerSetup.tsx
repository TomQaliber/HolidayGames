"use client";

import { useState } from "react";
import type { Player, PlayerGroup } from "@/lib/types";
import { createPlayerId } from "@/lib/player-utils";
import EmojiPicker from "@/components/EmojiPicker";

interface PlayerSetupProps {
  initialPlayers: Player[];
}

export default function PlayerSetup({ initialPlayers }: PlayerSetupProps) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🎪");
  const [group, setGroup] = useState<PlayerGroup>("adult");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function resetForm() {
    setName("");
    setEmoji("🎪");
    setGroup("adult");
    setEditingId(null);
  }

  function handleAddOrUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter a name.");
      return;
    }

    const trimmedEmoji = emoji.trim() || "🎪";

    if (editingId) {
      setPlayers((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, name: trimmedName, emoji: trimmedEmoji, group }
            : p
        )
      );
      resetForm();
      return;
    }

    setPlayers((prev) => [
      ...prev,
      {
        id: createPlayerId(trimmedName),
        name: trimmedName,
        emoji: trimmedEmoji,
        group,
      },
    ]);
    resetForm();
  }

  function handleEdit(player: Player) {
    setEditingId(player.id);
    setName(player.name);
    setEmoji(player.emoji);
    setGroup(player.group);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRemove(id: string) {
    if (players.length <= 1) {
      setError("You need at least one player.");
      return;
    }
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) resetForm();
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/players", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ players }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not save players.");
        return;
      }

      setMessage("Players saved!");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const kids = players.filter((p) => p.group === "child");
  const adults = players.filter((p) => p.group === "adult");

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={handleAddOrUpdate} className="card-festival-alt p-5">
        <h2 className="font-display text-xl font-bold text-navy">
          {editingId ? "Edit player" : "Add a player"}
        </h2>

        <label className="mt-4 block">
          <span className="text-sm font-semibold text-navy/70">Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lily"
            className="input-festival mt-1"
            maxLength={30}
          />
        </label>

        <div className="mt-4">
          <EmojiPicker value={emoji} onChange={setEmoji} />
        </div>

        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-navy/70">Group</legend>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setGroup("child")}
              className={`flex-1 rounded-xl border-2 px-4 py-3 font-display font-semibold ${
                group === "child"
                  ? "border-hot-pink bg-sun text-navy"
                  : "border-navy/20 bg-white text-navy"
              }`}
            >
              Kid
            </button>
            <button
              type="button"
              onClick={() => setGroup("adult")}
              className={`flex-1 rounded-xl border-2 px-4 py-3 font-display font-semibold ${
                group === "adult"
                  ? "border-hot-pink bg-sun text-navy"
                  : "border-navy/20 bg-white text-navy"
              }`}
            >
              Grown-up
            </button>
          </div>
        </fieldset>

        <div className="mt-4 flex gap-3">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="btn-festival-secondary flex-1 px-4 py-3"
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn-festival flex-1 px-4 py-3">
            {editingId ? "Update" : "Add player"}
          </button>
        </div>
      </form>

      <section className="card-festival p-5">
        <h2 className="font-display text-xl font-bold text-navy">Your players</h2>
        <p className="mt-1 text-sm text-navy/70">
          {players.length} player{players.length === 1 ? "" : "s"} — {kids.length} kid
          {kids.length === 1 ? "" : "s"}, {adults.length} grown-up
          {adults.length === 1 ? "" : "s"}
        </p>

        {players.length === 0 ? (
          <p className="mt-4 text-center text-navy/50">No players yet — add someone above!</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {players.map((player) => (
              <li
                key={player.id}
                className="flex items-center gap-3 rounded-xl border-2 border-navy/10 bg-cream/50 px-3 py-3"
              >
                <span className="text-2xl" aria-hidden>
                  {player.emoji}
                </span>
                <div className="flex-1">
                  <p className="font-display font-semibold text-navy">{player.name}</p>
                  <p className="text-xs text-navy/60">
                    {player.group === "child" ? "Kid" : "Grown-up"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleEdit(player)}
                  className="rounded-full border-2 border-navy px-3 py-1 font-display text-sm font-semibold text-navy"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(player.id)}
                  className="rounded-full border-2 border-coral px-3 py-1 font-display text-sm font-semibold text-coral"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && (
        <p className="rounded-xl bg-coral/20 px-4 py-2 text-center text-sm font-semibold text-coral">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl bg-turquoise/20 px-4 py-2 text-center text-sm font-semibold text-navy">
          {message}
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || players.length === 0}
        className="btn-festival w-full px-6 py-3 text-lg"
      >
        {saving ? "Saving..." : "Save all players"}
      </button>
    </div>
  );
}
