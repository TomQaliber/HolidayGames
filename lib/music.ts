// Deep house / chill summer groove - 115 BPM
// No lead melody, just deep bass and rhythm

// Deep bass line - sub frequencies
const BASS_PATTERN = [
  { step: 0, note: 55, dur: 0.3 },    // A1 - deep sub
  { step: 4, note: 55, dur: 0.15 },
  { step: 7, note: 62, dur: 0.2 },    // B1
  { step: 10, note: 55, dur: 0.15 },
  { step: 14, note: 49, dur: 0.25 },  // G1
  { step: 16, note: 55, dur: 0.3 },
  { step: 20, note: 55, dur: 0.15 },
  { step: 23, note: 65, dur: 0.2 },   // C2
  { step: 26, note: 55, dur: 0.15 },
  { step: 30, note: 49, dur: 0.25 },
  // Bar 2
  { step: 32, note: 49, dur: 0.3 },   // G1
  { step: 36, note: 49, dur: 0.15 },
  { step: 39, note: 55, dur: 0.2 },
  { step: 42, note: 62, dur: 0.15 },
  { step: 46, note: 55, dur: 0.25 },
  { step: 48, note: 44, dur: 0.3 },   // F1
  { step: 52, note: 49, dur: 0.15 },
  { step: 55, note: 55, dur: 0.2 },
  { step: 58, note: 49, dur: 0.15 },
  { step: 62, note: 55, dur: 0.25 },
];

// Kick drum pattern
const KICK_STEPS = [0, 8, 16, 24, 32, 40, 48, 56];

// Hi-hat pattern - offbeat for groove
const HIHAT_STEPS = [4, 12, 20, 28, 36, 44, 52, 60];

// Soft chord stabs (not high pitched, mid-range)
const CHORD_PATTERN = [
  { step: 6, notes: [220, 277, 330] },  // Am chord (A3, C#4, E4)
  { step: 22, notes: [196, 247, 294] }, // G chord
  { step: 38, notes: [175, 220, 262] }, // F chord  
  { step: 54, notes: [196, 247, 294] }, // G chord
];

const TOTAL_STEPS = 64;

export class SummerMusicPlayer {
  private ctx: AudioContext | null = null;
  private playing = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private vol = 0.6;

  async initialize(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AC();
      await this.ctx.resume();
      return true;
    } catch (e) {
      console.error("Audio init failed:", e);
      return false;
    }
  }

  private bass(freq: number, dur: number): void {
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    // Main sub bass - sine wave for deep low end
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = "sine";
    sub.frequency.value = freq;
    subGain.gain.setValueAtTime(0.5 * this.vol, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + dur);
    sub.connect(subGain);
    subGain.connect(this.ctx.destination);
    sub.start(now);
    sub.stop(now + dur + 0.05);
    
    // Harmonic layer - adds presence
    const harm = this.ctx.createOscillator();
    const harmGain = this.ctx.createGain();
    harm.type = "triangle";
    harm.frequency.value = freq * 2;
    harmGain.gain.setValueAtTime(0.15 * this.vol, now);
    harmGain.gain.exponentialRampToValueAtTime(0.01, now + dur * 0.7);
    harm.connect(harmGain);
    harmGain.connect(this.ctx.destination);
    harm.start(now);
    harm.stop(now + dur + 0.05);
  }

  private kick(): void {
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    
    gain.gain.setValueAtTime(0.7 * this.vol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.35);
  }

  private hihat(): void {
    if (!this.ctx) return;
    
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }
    
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.value = 8000;
    gain.gain.value = 0.12 * this.vol;
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    source.start();
  }

  private chord(notes: number[]): void {
    if (!this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    for (const freq of notes) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "sine";
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.08 * this.vol, now);
      gain.gain.setValueAtTime(0.08 * this.vol, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.55);
    }
  }

  private tick(): void {
    if (!this.playing || !this.ctx) return;
    
    const s = this.step % TOTAL_STEPS;
    
    // Deep bass
    const bassNote = BASS_PATTERN.find(n => n.step === s);
    if (bassNote) {
      this.bass(bassNote.note, bassNote.dur);
    }
    
    // Kick drum
    if (KICK_STEPS.includes(s)) {
      this.kick();
    }
    
    // Hi-hat (offbeat)
    if (HIHAT_STEPS.includes(s)) {
      this.hihat();
    }
    
    // Soft chord stabs
    const chordHit = CHORD_PATTERN.find(c => c.step === s);
    if (chordHit) {
      this.chord(chordHit.notes);
    }
    
    this.step++;
  }

  async start(): Promise<void> {
    if (this.playing) return;
    
    if (!this.ctx) {
      const ok = await this.initialize();
      if (!ok) return;
    }
    
    if (this.ctx?.state === "suspended") {
      await this.ctx.resume();
    }

    this.playing = true;
    this.step = 0;
    
    // 120 BPM = 500ms per beat, 16 steps per bar = ~125ms per step
    this.timer = setInterval(() => this.tick(), 125);
  }

  stop(): void {
    this.playing = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  setVolume(v: number): void {
    this.vol = Math.max(0, Math.min(1, v));
  }

  getVolume(): number {
    return this.vol;
  }

  getIsPlaying(): boolean {
    return this.playing;
  }

  async toggle(): Promise<void> {
    if (this.playing) {
      this.stop();
    } else {
      await this.start();
    }
  }

  dispose(): void {
    this.stop();
    this.ctx?.close();
    this.ctx = null;
  }
}

let musicPlayerInstance: SummerMusicPlayer | null = null;

export function getMusicPlayer(): SummerMusicPlayer {
  if (!musicPlayerInstance) {
    musicPlayerInstance = new SummerMusicPlayer();
  }
  return musicPlayerInstance;
}
