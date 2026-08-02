"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PinGateProps {
  redirectTo?: string;
}

export default function PinGate({ redirectTo = "/today" }: PinGateProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (!res.ok) {
        setError("Wrong PIN — try again!");
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label htmlFor="pin" className="font-display text-lg font-semibold text-navy">
        Family PIN
      </label>
      <input
        id="pin"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        placeholder="Enter PIN"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="input-festival text-center text-2xl tracking-widest"
        maxLength={8}
      />
      {error && (
        <p className="rounded-xl bg-coral/20 px-4 py-2 text-center text-sm font-semibold text-coral">
          {error}
        </p>
      )}
      <button type="submit" disabled={loading || !pin} className="btn-festival px-6 py-3 text-lg">
        {loading ? "Unlocking..." : "Let's play!"}
      </button>
    </form>
  );
}
