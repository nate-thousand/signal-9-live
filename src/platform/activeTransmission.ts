import type { Signal9PresetTrackId } from '../audio/transmissionTracks.js';
import type { Signal9MixtapePreset } from '../config/mixtapePresets.js';
import { getAudioReactiveState, type AudioReactiveState } from './audioReactiveState.js';
import { getSignal9Mp3Adapter } from './signal9SoundIntegration.js';

export type TransmissionPlaybackState =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'ended'
  | 'error';

export type TransmissionKind = 'none' | 'mixtape' | 'preset' | 'ambient';

/** Shared source of truth for the active radio transmission. */
export type ActiveTransmission = {
  kind: TransmissionKind;
  mixtapeId: string;
  title: string;
  artist: string;
  audioSrc: string;
  videoSourceId: string;
  asciiPresetId: string;
  status: string;
  mission: string;
  deckTrackId: string;
  playbackState: TransmissionPlaybackState;
};

export const IDLE_ACTIVE_TRANSMISSION: ActiveTransmission = {
  kind: 'none',
  mixtapeId: '',
  title: '',
  artist: '',
  audioSrc: '',
  videoSourceId: '',
  asciiPresetId: '',
  status: 'STANDBY',
  mission: '',
  deckTrackId: '',
  playbackState: 'idle',
};

type Listener = (transmission: ActiveTransmission) => void;

class ActiveTransmissionStore {
  private transmission: ActiveTransmission = { ...IDLE_ACTIVE_TRANSMISSION };
  private readonly listeners = new Set<Listener>();

  get(): ActiveTransmission {
    return this.transmission;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.transmission);
    return () => this.listeners.delete(listener);
  }

  patch(patch: Partial<ActiveTransmission>): void {
    this.transmission = { ...this.transmission, ...patch };
    this.emit();
  }

  set(transmission: ActiveTransmission): void {
    this.transmission = transmission;
    this.emit();
  }

  reset(): void {
    this.set({ ...IDLE_ACTIVE_TRANSMISSION });
  }

  /** Sync playbackState from the local MP3 adapter snapshot. */
  syncPlaybackFromAdapter(): void {
    const adapter = getSignal9Mp3Adapter();
    if (!adapter) return;

    const snapshot = adapter.getPlaybackSnapshot();
    const hasSource = Boolean(this.transmission.audioSrc);
    let playbackState: TransmissionPlaybackState = 'idle';

    if (!hasSource) {
      playbackState = 'idle';
    } else if (snapshot.playing) {
      playbackState = 'playing';
    } else if (snapshot.duration > 0 && snapshot.currentTime >= snapshot.duration - 0.25) {
      playbackState = 'ended';
    } else if (snapshot.duration > 0 || snapshot.currentTime > 0) {
      playbackState = 'paused';
    } else {
      playbackState = 'paused';
    }

    if (playbackState !== this.transmission.playbackState) {
      this.patch({ playbackState });
    }
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.transmission);
    }
  }
}

export const activeTransmission = new ActiveTransmissionStore();

export function getActiveTransmission(): ActiveTransmission {
  return activeTransmission.get();
}

export function activeTransmissionFromMixtape(
  preset: Signal9MixtapePreset,
  deckTrackId: string,
): ActiveTransmission {
  return {
    kind: 'mixtape',
    mixtapeId: preset.id,
    title: preset.title,
    artist: preset.artist,
    audioSrc: preset.audioSrc,
    videoSourceId: preset.videoSourceId,
    asciiPresetId: preset.asciiPresetId,
    status: preset.status,
    mission: preset.mission,
    deckTrackId,
    playbackState: 'loading',
  };
}

export function activeTransmissionFromPreset(
  presetId: Signal9PresetTrackId,
  deckTrackId: string,
  trackLabel: string,
  audioSrc: string,
  videoSourceId: string,
): ActiveTransmission {
  return {
    kind: 'preset',
    mixtapeId: '',
    title: trackLabel,
    artist: 'Signal 9 Carrier',
    audioSrc,
    videoSourceId,
    asciiPresetId: presetId,
    status: 'CARRIER PRESET',
    mission: '',
    deckTrackId,
    playbackState: 'loading',
  };
}

export function activeTransmissionFromAmbient(
  deckTrackId: string,
  trackLabel: string,
  trackTitle: string,
  audioSrc: string,
): ActiveTransmission {
  return {
    kind: 'ambient',
    mixtapeId: '',
    title: trackTitle,
    artist: trackLabel,
    audioSrc,
    videoSourceId: '',
    asciiPresetId: '',
    status: 'AMBIENT TAPE',
    mission: '',
    deckTrackId,
    playbackState: 'loading',
  };
}

/** Snapshot for future API chat — active tape + playback + audio bands. */
export function getActiveTransmissionContext(): {
  transmission: ActiveTransmission;
  audioReactive: AudioReactiveState;
} {
  activeTransmission.syncPlaybackFromAdapter();
  return {
    transmission: activeTransmission.get(),
    audioReactive: getAudioReactiveState(),
  };
}
