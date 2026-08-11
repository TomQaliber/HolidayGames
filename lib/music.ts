// Funky summer groove - 120 BPM feel
// Pattern: 16 steps per bar, 4 bars total
const LEAD_PATTERN = [
  // Bar 1 - Funky riff
  { step: 0, note: 587, dur: 0.1 },   // D5
  { step: 2, note: 659, dur: 0.1 },   // E5
  { step: 3, note: 698, dur: 0.15 },  // F5
  { step: 6, note: 784, dur: 0.2 },   // G5
  { step: 10, note: 659, dur: 0.1 },  // E5
  { step: 12, note: 587, dur: 0.15 }, // D5
  { step: 14, note: 523, dur: 0.1 },  // C5
  // Bar 2
  { step: 16, note: 587, dur: 0.1 },
  { step: 18, note: 659, dur: 0.1 },
  { step: 19, note: 698, dur: 0.15 },
  { step: 22, note: 880, dur: 0.25 }, // A5 - high point
  { step: 26, note: 784, dur: 0.1 },
  { step: 28, note: 698, dur: 0.15 },
  // Bar 3 - variation
  { step: 32, note: 784, dur: 0.1 },
  { step: 34, note: 880, dur: 0.1 },
  { step: 35, note: 784, dur: 0.15 },
  { step: 38, note: 659, dur: 0.2 },
  { step: 42, note: 587, dur: 0.1 },
  { step: 44, note: 523, dur: 0.15 },
  // Bar 4 - resolve
  { step: 48, note: 587, dur: 0.15 },
  { step: 51, note: 659, dur: 0.1 },
  { step: 54, note: 698, dur: 0.2 },
  { step: 58, note: 587, dur: 0.3 },
];

// Funky bass line - syncopated
const BASS_PATTERN = [
  { step: 0, note: 147 },   // D3
  { step: 3, note: 147 },
  { step: 6, note: 165 },   // E3
  { step: 8, note: 147 },
  { step: 11, note: 131 },  // C3
  { step: 14, note: 147 },
  { step: 16, note: 147 },
  { step: 19, note: 147 },
  { step: 22, note: 175 },  // F3
  { step: 24, note: 165 },
  { step: 27, note: 147 },
  { step: 30, note: 131 },
  { step: 32, note: 196 },  // G3
  { step: 35, note: 196 },
  { step: 38, note: 175 },
  { step: 40, note: 165 },
  { step: 43, note: 147 },
  { step: 46, note: 131 },
  { step: 48, note: 147 },
  { step: 51, note: 147 },
  { step: 54, note: 165 },
  { step: 56, note: 175 },
  { step: 59, note: 147 },
  { step: 62, note: 147 },
];

// Hi-hat pattern for rhythm
const HIHAT_STEPS = [0,2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32,34,36,38,40,42,44,46,48,50,52,54,56,58,60,62];

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

  private synth(freq: number, dur: number, type: OscillatorType, vol: number): void {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    
    osc.type = type;
    osc.frequency.value = freq;
    
    gain.gain.setValueAtTime(vol * this.vol, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + dur + 0.05);
  }

  private hihat(): void {
    if (!this.ctx) return;
    
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
    }
    
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    
    source.buffer = buffer;
    filter.type = "highpass";
    filter.frequency.value = 7000;
    gain.gain.value = 0.15 * this.vol;
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    
    source.start();
  }

  private tick(): void {
    if (!this.playing || !this.ctx) return;
    
    const s = this.step % TOTAL_STEPS;
    
    // Lead synth
    const lead = LEAD_PATTERN.find(n => n.step === s);
    if (lead) {
      this.synth(lead.note, lead.dur, "sawtooth", 0.25);
      this.synth(lead.note * 1.002, lead.dur, "sawtooth", 0.15); // slight detune for thickness
    }
    
    // Bass
    const bass = BASS_PATTERN.find(n => n.step === s);
    if (bass) {
      this.synth(bass.note, 0.15, "square", 0.35);
    }
    
    // Hi-hat
    if (HIHAT_STEPS.includes(s)) {
      this.hihat();
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
