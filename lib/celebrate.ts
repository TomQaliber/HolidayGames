import confetti from "canvas-confetti";

const FESTIVAL_COLORS = ["#FF6B6B", "#FFE566", "#4ECDC4", "#FF2D6F", "#FF9F43", "#FFF8E7"];

function fireBurst(originX: number) {
  confetti({
    particleCount: 55,
    spread: 70,
    startVelocity: 38,
    origin: { x: originX, y: 0.7 },
    colors: FESTIVAL_COLORS,
    disableForReducedMotion: true,
  });
}

/** One confetti burst per saved entry, staggered across the screen. */
export function celebrateEntries(count: number) {
  const bursts = Math.max(1, Math.min(count, 8));

  for (let i = 0; i < bursts; i++) {
    const originX = 0.15 + (0.7 * (i + 0.5)) / bursts;
    window.setTimeout(() => fireBurst(originX), i * 180);
  }

  // Finale splash from the center
  window.setTimeout(() => {
    confetti({
      particleCount: 90,
      spread: 100,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.55 },
      colors: FESTIVAL_COLORS,
      disableForReducedMotion: true,
    });
  }, bursts * 180);
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
}

function playTone(
  ctx: AudioContext,
  frequency: number,
  start: number,
  duration: number,
  type: OscillatorType = "triangle",
  gainValue = 0.12
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(gainValue, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration);
}

/** Short synthesized cheer / fanfare (no audio file needed). */
export async function playCheerSound(entryCount = 1) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6

  // Opening fanfare
  notes.forEach((freq, i) => {
    playTone(ctx, freq, now + i * 0.09, 0.28, "triangle", 0.1);
  });

  // Extra sparkle chirps — one per entry (capped)
  const chirps = Math.max(1, Math.min(entryCount, 6));
  for (let i = 0; i < chirps; i++) {
    const t = now + 0.4 + i * 0.12;
    playTone(ctx, 880 + i * 60, t, 0.15, "sine", 0.07);
    playTone(ctx, 1320 + i * 40, t + 0.04, 0.12, "sine", 0.05);
  }

  // Soft noise whoosh as "crowd" texture
  const bufferSize = ctx.sampleRate * 0.6;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 1200;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, now + 0.15);
  noiseGain.gain.linearRampToValueAtTime(0.045, now + 0.25);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(now + 0.15);
  noise.stop(now + 0.8);
}

export function celebrateResults(entryCount: number) {
  celebrateEntries(entryCount);
  void playCheerSound(entryCount);
}
