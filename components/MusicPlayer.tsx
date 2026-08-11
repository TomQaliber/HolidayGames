"use client";

import { useEffect, useState, useCallback } from "react";
import { getMusicPlayer } from "@/lib/music";

const STORAGE_KEY = "hg_music_prefs";

interface MusicPrefs {
  enabled: boolean;
  volume: number;
}

function loadPrefs(): MusicPrefs {
  if (typeof window === "undefined") return { enabled: false, volume: 0.6 };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as MusicPrefs;
      return {
        enabled: Boolean(parsed.enabled),
        volume: typeof parsed.volume === "number" ? parsed.volume : 0.6,
      };
    }
  } catch {
    // ignore
  }
  return { enabled: false, volume: 0.6 };
}

function savePrefs(prefs: MusicPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const prefs = loadPrefs();
    setVolume(prefs.volume);
    
    const player = getMusicPlayer();
    player.setVolume(prefs.volume);
    
    const playing = player.getIsPlaying();
    setIsPlaying(playing);

    if (prefs.enabled) {
      setHasInteracted(true);
    }
  }, []);

  const handleToggle = useCallback(async () => {
    const player = getMusicPlayer();
    
    if (!hasInteracted) {
      await player.initialize();
      setHasInteracted(true);
    }

    await player.toggle();
    const nowPlaying = player.getIsPlaying();
    setIsPlaying(nowPlaying);
    savePrefs({ enabled: nowPlaying, volume });
  }, [hasInteracted, volume]);

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    const player = getMusicPlayer();
    player.setVolume(newVolume);
    savePrefs({ enabled: isPlaying, volume: newVolume });
  }, [isPlaying]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div
        className={`bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-hot-pink/30 transition-all duration-300 ${
          isExpanded ? "p-4 w-48" : "p-2"
        }`}
      >
        {isExpanded && (
          <div className="mb-3">
            <label className="block text-xs font-semibold text-navy/70 mb-2">
              Volume
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-sun/50 rounded-lg appearance-none cursor-pointer accent-hot-pink"
            />
          </div>
        )}
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggle}
            className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
              isPlaying
                ? "bg-hot-pink text-white"
                : "bg-sun text-navy hover:bg-hot-pink hover:text-white"
            }`}
            aria-label={isPlaying ? "Muziek pauzeren" : "Muziek afspelen"}
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-navy/10 text-navy hover:bg-navy/20 transition-colors"
            aria-label={isExpanded ? "Minder opties" : "Meer opties"}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>

        {isExpanded && (
          <p className="mt-2 text-xs text-center text-navy/60">
            {isPlaying ? "🎵 Zomerse vibes" : "Druk op play!"}
          </p>
        )}
      </div>
    </div>
  );
}
