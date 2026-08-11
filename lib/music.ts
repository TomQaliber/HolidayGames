const NOTES = [523.25, 659.25, 783.99, 659.25, 698.46, 880.00, 783.99, 783.99,
                659.25, 587.33, 523.25, 659.25, 783.99, 783.99, 1046.50, 987.77,
                880.00, 783.99, 698.46, 659.25, 587.33, 587.33, 392.00, 440.00,
                493.88, 523.25, 523.25, 523.25, 0, 0, 0, 0];

const BASS = [130.81, 130.81, 196.00, 196.00, 174.61, 174.61, 196.00, 196.00];

export class SummerMusicPlayer {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;
  private playing = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private vol = 0.7;

  async initialize(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AC();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = this.vol;
      this.gain.connect(this.ctx.destination);
      
      await this.ctx.resume();
      console.log("Audio ready:", this.ctx.state);
      return true;
    } catch (e) {
      console.error("Audio init failed:", e);
      return false;
    }
  }

  private beep(freq: number, dur: number, volume: number): void {
    if (!this.ctx || !this.gain || freq === 0) return;
    
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    
    o.frequency.value = freq;
    o.type = "sine";
    g.gain.value = volume;
    
    o.connect(g);
    g.connect(this.gain);
    
    o.start();
    o.stop(this.ctx.currentTime + dur);
  }

  private tick(): void {
    if (!this.playing || !this.ctx) return;
    
    const note = NOTES[this.step % NOTES.length];
    if (note > 0) {
      this.beep(note, 0.15, 0.4);
    }
    
    if (this.step % 4 === 0) {
      const bass = BASS[Math.floor(this.step / 4) % BASS.length];
      this.beep(bass, 0.3, 0.3);
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
    
    console.log("Starting music loop...");
    
    this.tick();
    this.timer = setInterval(() => this.tick(), 180);
  }

  stop(): void {
    this.playing = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    console.log("Music stopped");
  }

  setVolume(v: number): void {
    this.vol = Math.max(0, Math.min(1, v));
    if (this.gain) this.gain.gain.value = this.vol;
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
    this.gain = null;
  }
}

let musicPlayerInstance: SummerMusicPlayer | null = null;

export function getMusicPlayer(): SummerMusicPlayer {
  if (!musicPlayerInstance) {
    musicPlayerInstance = new SummerMusicPlayer();
  }
  return musicPlayerInstance;
}
