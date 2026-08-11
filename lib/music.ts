type NoteFrequency = number;

const NOTE_FREQUENCIES: Record<string, NoteFrequency> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50,
};

const MELODY_PATTERN = [
  "C5", "E5", "G5", "E5", "F5", "A5", "G5", "G5",
  "E5", "D5", "C5", "E5", "G5", "G5", "C6", "B5",
  "A5", "G5", "F5", "E5", "D5", "D5", "G4", "A4",
  "B4", "C5", "C5", "C5", "REST", "REST", "REST", "REST",
];

const BASS_NOTES = ["C3", "C3", "G3", "G3", "F3", "F3", "G3", "G3"];

export class SummerMusicPlayer {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private stepIndex = 0;
  private volume = 0.5;

  async initialize(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    
    try {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume;
      
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }
      
      console.log("Audio initialized, state:", this.audioContext.state);
      return true;
    } catch (err) {
      console.error("Web Audio API error:", err);
      return false;
    }
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = "sine", gain = 0.3): void {
    if (!this.audioContext || !this.masterGain) return;

    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    osc.type = type;
    osc.frequency.value = frequency;
    
    gainNode.gain.value = gain;

    osc.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start();
    
    gainNode.gain.setValueAtTime(gain, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration * 0.9);
    
    osc.stop(this.audioContext.currentTime + duration);
  }

  private playStep(): void {
    if (!this.audioContext || !this.isPlaying) return;

    const melodyNote = MELODY_PATTERN[this.stepIndex % MELODY_PATTERN.length];
    const bassNote = BASS_NOTES[Math.floor(this.stepIndex / 2) % BASS_NOTES.length];

    if (melodyNote !== "REST") {
      const freq = NOTE_FREQUENCIES[melodyNote];
      if (freq) {
        this.playTone(freq, 0.2, "sine", 0.25);
        this.playTone(freq * 2, 0.2, "sine", 0.08);
      }
    }

    if (this.stepIndex % 2 === 0) {
      const bassFreq = NOTE_FREQUENCIES[bassNote];
      if (bassFreq) {
        this.playTone(bassFreq * 0.5, 0.3, "triangle", 0.2);
      }
    }

    this.stepIndex++;
  }

  async start(): Promise<void> {
    if (this.isPlaying) return;
    
    if (!this.audioContext) {
      const initialized = await this.initialize();
      if (!initialized) {
        console.error("Failed to initialize audio");
        return;
      }
    }

    if (this.audioContext?.state === "suspended") {
      await this.audioContext.resume();
      console.log("Audio resumed, state:", this.audioContext.state);
    }

    this.isPlaying = true;
    this.stepIndex = 0;
    
    this.playStep();
    
    this.intervalId = setInterval(() => {
      if (this.isPlaying) {
        this.playStep();
      }
    }, 180);
    
    console.log("Music started");
  }

  stop(): void {
    this.isPlaying = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    console.log("Music stopped");
  }

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.masterGain) {
      this.masterGain.gain.value = this.volume;
    }
  }

  getVolume(): number {
    return this.volume;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  async toggle(): Promise<void> {
    if (this.isPlaying) {
      this.stop();
    } else {
      await this.start();
    }
  }

  dispose(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.masterGain = null;
  }
}

let musicPlayerInstance: SummerMusicPlayer | null = null;

export function getMusicPlayer(): SummerMusicPlayer {
  if (!musicPlayerInstance) {
    musicPlayerInstance = new SummerMusicPlayer();
  }
  return musicPlayerInstance;
}
