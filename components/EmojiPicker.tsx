"use client";

import { PICKER_EMOJIS } from "@/lib/emojis";

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

export default function EmojiPicker({ value, onChange }: EmojiPickerProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-navy/70">Pick an emoji</p>
      <div className="grid grid-cols-8 gap-1">
        {PICKER_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            className={`flex h-10 w-full items-center justify-center rounded-lg border-2 text-xl transition-transform active:scale-95 ${
              value === emoji
                ? "border-hot-pink bg-sun scale-110"
                : "border-navy/20 bg-white"
            }`}
            aria-label={`Select ${emoji}`}
            aria-pressed={value === emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
      <label className="mt-3 block text-sm font-semibold text-navy/70">
        Or type your own
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={4}
          placeholder="🎪"
          className="input-festival mt-1 text-center text-2xl"
        />
      </label>
    </div>
  );
}
