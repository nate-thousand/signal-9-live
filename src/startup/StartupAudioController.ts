import { SIGNAL_9_TRANSMISSION_AUDIO_PATH } from '../audio/transmissionAudio.js';

export const STARTUP_AUDIO_PATH = SIGNAL_9_TRANSMISSION_AUDIO_PATH;

export interface StartupAudioOptions {
  src?: string;
  volume?: number;
}

/**
 * Startup audio controller — single MP3 with fade in/out and skip.
 * Source is replaceable for future asset swaps.
 */
export class StartupAudioController {
  private readonly audio: HTMLAudioElement;
  private fadeTimer: ReturnType<typeof setInterval> | null = null;
  private unlocked = false;

  constructor(options: StartupAudioOptions = {}) {
    this.audio = new Audio(options.src ?? STARTUP_AUDIO_PATH);
    this.audio.preload = 'auto';
    this.audio.loop = true;
    this.audio.volume = 0;
    if (options.volume !== undefined) {
      this.audio.volume = options.volume;
    }
  }

  get isPlaying(): boolean {
    return !this.audio.paused;
  }

  get source(): string {
    return this.audio.src;
  }

  /** Swap the MP3 without recreating the controller */
  setSource(src: string): void {
    const wasPlaying = this.isPlaying;
    const volume = this.audio.volume;
    this.stopFade();
    this.audio.pause();
    this.audio.src = src;
    this.audio.load();
    this.audio.volume = volume;
    if (wasPlaying) {
      void this.audio.play().catch(() => undefined);
    }
  }

  /** Call after user gesture to satisfy autoplay policies */
  async unlock(): Promise<void> {
    if (this.unlocked) return;
    this.unlocked = true;
    try {
      await this.audio.play();
      this.audio.pause();
      this.audio.currentTime = 0;
    } catch {
      // Browser may still block until explicit play()
    }
  }

  async playFadeIn(durationMs = 1800, targetVolume = 0.55): Promise<void> {
    await this.unlock();
    this.stopFade();

    try {
      if (this.audio.paused) {
        await this.audio.play();
      }
    } catch {
      return;
    }

    const startVolume = this.audio.volume;
    const start = performance.now();

    return new Promise((resolve) => {
      this.fadeTimer = setInterval(() => {
        const elapsed = performance.now() - start;
        const t = Math.min(1, elapsed / durationMs);
        this.audio.volume = startVolume + (targetVolume - startVolume) * t;
        if (t >= 1) {
          this.stopFade();
          resolve();
        }
      }, 16);
    });
  }

  async fadeOut(durationMs = 900): Promise<void> {
    if (this.audio.paused && this.audio.volume === 0) return;

    this.stopFade();
    const startVolume = this.audio.volume;
    const start = performance.now();

    return new Promise((resolve) => {
      this.fadeTimer = setInterval(() => {
        const elapsed = performance.now() - start;
        const t = Math.min(1, elapsed / durationMs);
        this.audio.volume = Math.max(0, startVolume * (1 - t));
        if (t >= 1) {
          this.audio.pause();
          this.audio.currentTime = 0;
          this.audio.volume = 0;
          this.stopFade();
          resolve();
        }
      }, 16);
    });
  }

  skip(): void {
    this.stopFade();
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.volume = 0;
  }

  dispose(): void {
    this.skip();
    this.audio.removeAttribute('src');
    this.audio.load();
  }

  private stopFade(): void {
    if (this.fadeTimer !== null) {
      clearInterval(this.fadeTimer);
      this.fadeTimer = null;
    }
  }
}
