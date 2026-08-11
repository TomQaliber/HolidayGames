type NoteFrequency = number;

const NOTE_FREQUENCIES: Record<string, NoteFrequency> = {
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  C6: 1046.50,
};

const MELODY_PATTERN = [
  { note: "C5", duration: 0.25 },
  { note: "E5", duration: 0.25 },
  { note: "G5", duration: 0.25 },
  { note: "E5", duration: 0.25 },
  { note: "F5", duration: 0.25 },
  { note: "A5", duration: 0.25 },
  { note: "G5", duration: 0.5 },
  { note: "E5", duration: 0.25 },
  { note: "D5", duration: 0.25 },
  { note: "C5", duration: 0.25 },
  { note: "E5", duration: 0.25 },
  { note: "G5", duration: 0.5 },
  { note: "C6", duration: 0.25 },
  { note: "B5", duration: 0.25 },
  { note: "A5", duration: 0.25 },
  { note: "G5", duration: 0.25 },
  { note: "F5", duration: 0.25 },
  { note: "E5", duration: 0.25 },
  { note: "D5", duration: 0.5 },
  { note: "G4", duration: 0.25 },
  { note: "A4", duration: 0.25 },
  { note: "B4", duration: 0.25 },
  { note: "C5", duration: 0.75 },
];

const BASS_PATTERN = [
  { note: "C4", duration: 1 },
  { note: "G4", duration: 1 },
  { note: "F4", duration: 1 },
  { note: "G4", duration: 1 },
];

const ANNOUNCEMENT_MELODY = [
  { note: "G5", duration: 0.15 },
  { note: "C6", duration: 0.15 },
  { note: "E5", duration: 0.15 },
  { note: "G5", duration: 0.3 },
];

export class SummerMusicPlayer {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private loopTimeout: ReturnType<typeof setTimeout> | null = null;
  private announcementTimeout: ReturnType<typeof setTimeout> | null = null;
  private volume = 0.3;

  initialize(): boolean {
    if (typeof window === "undefined") return false;
    
    try {
      this.audioContext = new AudioContext();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.volume;
      return true;
    } catch {
      console.error("Web Audio API not supported");
      return false;
    }
  }

  private playNote(
    frequency: number,
    startTime: number,
    duration: number,
    type: OscillatorType = "sine",
    gainValue = 0.15
  ): void {
    if (!this.audioContext || !this.masterGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(gainValue, startTime + 0.02);
    gainNode.gain.setValueAtTime(gainValue, startTime + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  private playMelodyLoop(): void {
    if (!this.audioContext || !this.isPlaying) return;

    const now = this.audioContext.currentTime;
    const tempo = 140;
    const beatDuration = 60 / tempo;

    let melodyTime = now;
    for (const { note, duration } of MELODY_PATTERN) {
      const freq = NOTE_FREQUENCIES[note];
      if (freq) {
        this.playNote(freq, melodyTime, duration * beatDuration, "sine", 0.12);
      }
      melodyTime += duration * beatDuration;
    }

    let bassTime = now;
    for (const { note, duration } of BASS_PATTERN) {
      const freq = NOTE_FREQUENCIES[note];
      if (freq) {
        this.playNote(freq * 0.5, bassTime, duration * beatDuration, "triangle", 0.08);
      }
      bassTime += duration * beatDuration;
    }

    const loopDuration = MELODY_PATTERN.reduce((sum, n) => sum + n.duration, 0) * beatDuration;
    
    this.loopTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.playMelodyLoop();
      }
    }, loopDuration * 1000);
  }

  private playAnnouncement(): void {
    if (!this.audioContext || !this.masterGain) return;

    const now = this.audioContext.currentTime;
    let time = now;

    for (const { note, duration } of ANNOUNCEMENT_MELODY) {
      const freq = NOTE_FREQUENCIES[note];
      if (freq) {
        this.playNote(freq, time, duration, "square", 0.08);
        this.playNote(freq * 1.5, time, duration, "sine", 0.05);
      }
      time += duration;
    }
  }

  private scheduleAnnouncements(): void {
    if (!this.isPlaying) return;

    const minDelay = 45000;
    const maxDelay = 90000;
    const delay = minDelay + Math.random() * (maxDelay - minDelay);

    this.announcementTimeout = setTimeout(() => {
      if (this.isPlaying) {
        this.playAnnouncement();
        this.scheduleAnnouncements();
      }
    }, delay);
  }

  start(): void {
    if (this.isPlaying) return;
    
    if (!this.audioContext) {
      if (!this.initialize()) return;
    }

    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume();
    }

    this.isPlaying = true;
    this.playMelodyLoop();
    this.scheduleAnnouncements();
  }

  stop(): void {
    this.isPlaying = false;
    
    if (this.loopTimeout) {
      clearTimeout(this.loopTimeout);
      this.loopTimeout = null;
    }
    
    if (this.announcementTimeout) {
      clearTimeout(this.announcementTimeout);
      this.announcementTimeout = null;
    }
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

  toggle(): void {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
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
