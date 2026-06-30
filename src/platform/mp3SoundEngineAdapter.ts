import type {
  AudioFeaturesSnapshot,
  PlatformEventBus,
  Preset,
  SoundEngineAdapter,
  SoundEngineStatus,
} from '@plantasonic/platform-types';

import {
  SIGNAL_9_AUDIO_REACTIVE,
  scaleAudioReactiveFeature,
} from '../config/audioReactiveConfig.js';
import { SIGNAL_9_TRANSMISSION_AUDIO_PATH } from '../audio/transmissionTracks.js';

export interface CreateMp3SoundEngineAdapterOptions {
  eventBus: PlatformEventBus;
  source?: string;
  audioSrc?: string;
}

export interface Signal9Mp3SoundAdapter extends SoundEngineAdapter {
  loadTrack(src: string, autoplay?: boolean): Promise<void>;
  getCurrentTrack(): string;
  getPlaybackSnapshot(): {
    currentTime: number;
    duration: number;
    volume: number;
    playing: boolean;
  };
  setVolume(volume: number): void;
}

interface AnalyzerState {
  previousLevel: number;
  previousRms: number;
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function analyzeBins(
  frequencyData: Uint8Array,
  timeData: Uint8Array,
  state: AnalyzerState,
): AudioFeaturesSnapshot {
  const binCount = frequencyData.length;
  const bassEnd = Math.max(1, Math.floor(binCount * 0.08));
  const midsEnd = Math.max(bassEnd + 1, Math.floor(binCount * 0.45));

  let bassSum = 0;
  let midsSum = 0;
  let highsSum = 0;
  for (let i = 0; i < bassEnd; i++) bassSum += frequencyData[i] ?? 0;
  for (let i = bassEnd; i < midsEnd; i++) midsSum += frequencyData[i] ?? 0;
  for (let i = midsEnd; i < binCount; i++) highsSum += frequencyData[i] ?? 0;

  const bass = scaleAudioReactiveFeature(
    clamp01((bassSum / bassEnd / 255) * SIGNAL_9_AUDIO_REACTIVE.analyzerGain),
  );
  const mids = scaleAudioReactiveFeature(
    clamp01((midsSum / (midsEnd - bassEnd) / 255) * SIGNAL_9_AUDIO_REACTIVE.analyzerGain),
  );
  const highs = scaleAudioReactiveFeature(
    clamp01((highsSum / (binCount - midsEnd) / 255) * SIGNAL_9_AUDIO_REACTIVE.analyzerGain),
  );

  let sumSquares = 0;
  for (let i = 0; i < timeData.length; i++) {
    const normalized = ((timeData[i] ?? 128) - 128) / 128;
    sumSquares += normalized * normalized;
  }
  const rms = Math.sqrt(sumSquares / Math.max(1, timeData.length));
  const rawAmplitude = clamp01(rms * 2.6);
  const amplitude = scaleAudioReactiveFeature(rawAmplitude);
  const transient = scaleAudioReactiveFeature(
    clamp01(
      Math.max(
        Math.abs(rawAmplitude - state.previousLevel),
        Math.abs(rms - state.previousRms),
      ) * 8.5,
    ),
  );

  state.previousLevel = rawAmplitude;
  state.previousRms = rms;

  return {
    amplitude,
    bass,
    mids,
    highs,
    transient,
    timestamp: Date.now(),
  };
}

/**
 * Platform sound adapter that plays an MP3 and exposes analysis to the Audio Reactive Bridge.
 * No plantasia-sound-engine synth is started.
 */
export function createMp3SoundEngineAdapter(
  options: CreateMp3SoundEngineAdapterOptions,
): Signal9Mp3SoundAdapter {
  const { eventBus, source = 'signal-9-mp3-sound', audioSrc = SIGNAL_9_TRANSMISSION_AUDIO_PATH } =
    options;

  let currentAudioSrc = audioSrc;
  let audio: HTMLAudioElement | null = null;
  let audioContext: AudioContext | null = null;
  let analyser: AnalyserNode | null = null;
  let mediaSource: MediaElementAudioSourceNode | null = null;
  let audioReady = false;
  let playing = false;
  let currentVolume = 1;
  let currentPresetId: string | null = 'transmission';
  let lastError: string | null = null;
  const parameterSnapshot: Record<string, number> = {
    growth: 0.5,
    bloom: 0.5,
    roots: 0.5,
    mold: 0.5,
    bacteria: 0.5,
    tempo: 84,
  };
  const analyzerState: AnalyzerState = { previousLevel: 0, previousRms: 0 };

  const emit = (type: string, payload?: unknown): void => {
    eventBus.emit({
      type,
      timestamp: new Date().toISOString(),
      source,
      payload,
    });
  };

  const reportError = (operation: string, error: unknown): void => {
    const message = error instanceof Error ? error.message : String(error);
    lastError = message;
    emit('sound:error', { operation, message });
    console.warn(`[signal-9:mp3-sound] ${operation}:`, message);
  };

  const disconnectMedia = (): void => {
    if (!mediaSource) return;
    try {
      mediaSource.disconnect();
    } catch {
      // already disconnected
    }
    mediaSource = null;
  };

  const createMediaElement = (): void => {
    if (!audioContext || !analyser) return;

    audio = new Audio(currentAudioSrc);
    audio.preload = 'auto';
    audio.loop = true;
    audio.crossOrigin = 'anonymous';
    audio.volume = currentVolume;
    mediaSource = audioContext.createMediaElementSource(audio);
    mediaSource.connect(analyser);
  };

  const ensureAudioGraph = async (): Promise<void> => {
    if (!audioContext) {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.65;
      analyser.connect(audioContext.destination);
    }

    if (!audio) {
      createMediaElement();
      audioReady = true;
      emit('sound:init', { engineName: 'signal-9-mp3-transmission', src: currentAudioSrc });
    }
  };

  const adapter: Signal9Mp3SoundAdapter = {
    id: 'sound',
    engineName: 'signal-9-mp3-transmission',

    get isReady(): boolean {
      return audioReady;
    },

    async init(): Promise<void> {
      try {
        await ensureAudioGraph();
      } catch (error) {
        reportError('init', error);
        throw error;
      }
    },

    async initialize(): Promise<void> {
      await adapter.init();
    },

    async start(): Promise<void> {
      try {
        await ensureAudioGraph();
        if (audioContext?.state === 'suspended') {
          await audioContext.resume();
        }
        await audio!.play();
        playing = true;
        emit('sound:start', { presetId: currentPresetId, source: 'mp3' });
      } catch (error) {
        playing = false;
        reportError('start', error);
        throw error;
      }
    },

    async stop(): Promise<void> {
      if (!audio) return;
      try {
        audio.pause();
        playing = false;
        emit('sound:stop', { presetId: currentPresetId });
      } catch (error) {
        reportError('stop', error);
      }
    },

    async playPreset(preset: Preset | string): Promise<void> {
      const presetId = typeof preset === 'string' ? preset : preset.id;
      currentPresetId = presetId;
      emit('sound:preset-change', { presetId, source: 'mp3-metadata' });
    },

    getCurrentTrack(): string {
      return currentAudioSrc;
    },

    getPlaybackSnapshot() {
      return {
        currentTime: audio?.currentTime ?? 0,
        duration: Number.isFinite(audio?.duration) ? (audio?.duration ?? 0) : 0,
        volume: audio?.volume ?? 1,
        playing,
      };
    },

    setVolume(volume: number): void {
      const nextVolume = clamp01(volume);
      currentVolume = nextVolume;
      if (audio) {
        audio.volume = nextVolume;
      }
      emit('sound:parameter-change', { name: 'volume', value: nextVolume });
    },

    async loadTrack(src: string, autoplay = false): Promise<void> {
      const wasPlaying = playing;
      try {
        if (audio) {
          audio.pause();
          audio.removeAttribute('src');
          audio.load();
          disconnectMedia();
          audio = null;
        }

        currentAudioSrc = src;

        if (!audioContext) {
          audioContext = new AudioContext();
          analyser = audioContext.createAnalyser();
          analyser.fftSize = 2048;
          analyser.smoothingTimeConstant = 0.65;
          analyser.connect(audioContext.destination);
        }

        createMediaElement();
        audioReady = true;
        emit('sound:track-change', { src });

        if (wasPlaying || autoplay) {
          await adapter.start();
        }
      } catch (error) {
        reportError('loadTrack', error);
        throw error;
      }
    },

    async updateParameter(name: string, value: number): Promise<void> {
      parameterSnapshot[name] = value;
      emit('sound:parameter-change', { name, value });
    },

    getStatus(): SoundEngineStatus {
      return {
        initialized: audioReady,
        audioReady,
        playing,
        engineState: playing ? 'mp3-playing' : audioReady ? 'mp3-ready' : 'idle',
        currentSpecies: null,
        currentPresetId,
        level: adapter.getAudioFeatures().amplitude,
        lastError,
      };
    },

    getAudioFeatures(): AudioFeaturesSnapshot {
      if (!analyser || !playing) {
        return {
          amplitude: 0,
          bass: 0,
          mids: 0,
          highs: 0,
          transient: 0,
          timestamp: Date.now(),
        };
      }

      const freq = new Uint8Array(analyser.frequencyBinCount);
      const time = new Uint8Array(analyser.fftSize);
      analyser.getByteFrequencyData(freq);
      analyser.getByteTimeDomainData(time);
      return analyzeBins(freq, time, analyzerState);
    },

    getParameterSnapshot(): Readonly<Record<string, number>> {
      return { ...parameterSnapshot };
    },

    noteOn(): void {
      // MP3 transmission — no MIDI performance layer
    },

    noteOff(): void {
      // MP3 transmission — no MIDI performance layer
    },

    async dispose(): Promise<void> {
      try {
        await adapter.stop();
        disconnectMedia();
        analyser?.disconnect();
        void audioContext?.close();
      } catch (error) {
        reportError('dispose', error);
      } finally {
        audio = null;
        audioContext = null;
        analyser = null;
        mediaSource = null;
        audioReady = false;
        playing = false;
      }
    },
  };

  return adapter;
}
