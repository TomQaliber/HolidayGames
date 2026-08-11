const MELODY = [523, 659, 784, 659, 698, 880, 784, 784, 659, 587, 523, 659];

export class SummerMusicPlayer {
  private ctx: AudioContext | null = null;
  private playing = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private step = 0;
  private vol = 1.0;

  async initialize(): Promise<boolean> {
    console.log("=== INIT START ===");
    
    if (typeof window === "undefined") {
      console.log("No window object");
      return false;
    }
    
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      console.log("AudioContext class:", AC ? "found" : "NOT FOUND");
      
      this.ctx = new AC();
      console.log("Context created, state:", this.ctx.state);
      console.log("Sample rate:", this.ctx.sampleRate);
      console.log("Destination:", this.ctx.destination);
      
      if (this.ctx.state === "suspended") {
        console.log("Resuming suspended context...");
        await this.ctx.resume();
      }
      
      console.log("Final state:", this.ctx.state);
      console.log("=== INIT DONE ===");
      return true;
    } catch (e) {
      console.error("INIT ERROR:", e);
      return false;
    }
  }

  private playNote(freq: number): void {
    if (!this.ctx) {
      console.log("No context in playNote");
      return;
    }
    
    console.log("Playing note:", freq, "Hz");
    
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.value = this.vol;
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      const now = this.ctx.currentTime;
      osc.start(now);
      osc.stop(now + 0.12);
      
      console.log("Note scheduled at:", now);
    } catch (e) {
      console.error("playNote error:", e);
    }
  }

  async start(): Promise<void> {
    console.log("=== START CALLED ===");
    console.log("Already playing?", this.playing);
    
    if (this.playing) return;
    
    if (!this.ctx) {
      console.log("No context, initializing...");
      const ok = await this.initialize();
      console.log("Init result:", ok);
      if (!ok) return;
    }
    
    if (this.ctx?.state === "suspended") {
      console.log("Context suspended, resuming...");
      await this.ctx.resume();
      console.log("After resume:", this.ctx.state);
    }

    this.playing = true;
    this.step = 0;
    
    console.log("Playing first note immediately...");
    this.playNote(440);
    
    console.log("Setting up interval...");
    this.timer = setInterval(() => {
      if (this.playing && this.ctx?.state === "running") {
        const freq = MELODY[this.step % MELODY.length];
        this.playNote(freq);
        this.step++;
      }
    }, 250);
    
    console.log("=== MUSIC STARTED ===");
  }

  stop(): void {
    console.log("=== STOP CALLED ===");
    this.playing = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  setVolume(v: number): void {
    this.vol = Math.max(0, Math.min(1, v));
    console.log("Volume set to:", this.vol);
  }

  getVolume(): number {
    return this.vol;
  }

  getIsPlaying(): boolean {
    return this.playing;
  }

  async toggle(): Promise<void> {
    console.log("=== TOGGLE CALLED, playing:", this.playing);
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
