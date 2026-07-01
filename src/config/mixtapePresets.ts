import type { Signal9PresetTrackId } from '../audio/transmissionTracks.js';
import {
  SIGNAL_9_VIDEO_PROFILE_MAP,
  type Signal9VideoAsciiProfile,
} from '../content/videoVisualPresets.js';

export type MixtapeTint =
  | 'signal-purple'
  | 'signal-cyan'
  | 'signal-fuchsia'
  | 'signal-emerald'
  | 'signal-slate';

export type MixtapeFitMode = 'fit' | 'fill' | 'stretch' | 'center';

export type Signal9AsciiPresetId = Signal9PresetTrackId | 'blackout';

/** Optional mixtape-specific reactive baseline overrides on top of asciiPresetId. */
export interface Signal9MixtapeAsciiPreset {
  mode: 'video-reactive';
  fit: MixtapeFitMode | 'cover';
  tint?: MixtapeTint;
  contrast?: number;
  brightness?: number;
  density?: number;
  edge?: number;
  blend?: number;
  glyphRamp?: 'signal9';
  motion?: number;
  glitch?: number;
  threshold?: number;
  feedback?: number;
  scanlineAmount?: number;
  trailAmount?: number;
}

export interface Signal9MixtapePreset {
  id: string;
  title: string;
  artist: string;
  audioSrc: string;
  videoSourceId: string;
  asciiPresetId: Signal9AsciiPresetId;
  status: string;
  mission: string;
  /** Mixtape-specific reactive baseline overrides on top of asciiPresetId. */
  defaultAsciiPreset?: Signal9MixtapeAsciiPreset;
}

/** @deprecated Use Signal9MixtapeAsciiPreset */
export type MixtapeAsciiPreset = Signal9MixtapeAsciiPreset;

/** @deprecated Use Signal9MixtapePreset */
export type MixtapePreset = Signal9MixtapePreset;

export const MIXTAPE_TINT_COLORS: Record<MixtapeTint, string> = {
  'signal-purple': '#8B5CF6',
  'signal-cyan': '#22D3EE',
  'signal-fuchsia': '#C026D3',
  'signal-emerald': '#10B981',
  'signal-slate': '#94A3B8',
};

/** Local MP3 ↔ video source ↔ ASCII profile pairings for Signal 9 Radio mixtapes. */
export const SIGNAL_9_MIXTAPE_PRESETS: Signal9MixtapePreset[] = [
  {
    id: 'boogie-times-2026-mix-1',
    title: 'Boogie Times — Mix 1',
    artist: 'Nate Thousand Fingers',
    audioSrc: '/assets/audio/Boogie%20Times%20-%202026%20-%20Mix%201_PN.mp3',
    videoSourceId: 'blackout-void',
    asciiPresetId: 'broadcast',
    status: 'LOCAL TAPE',
    mission: 'Establish uplink',
    defaultAsciiPreset: {
      mode: 'video-reactive',
      fit: 'cover',
      tint: 'signal-purple',
      contrast: 1.15,
      brightness: 0.9,
      density: 0.75,
      edge: 0.35,
      blend: 0.85,
      glyphRamp: 'signal9',
      motion: 0.65,
      glitch: 0.45,
      threshold: 0.42,
      feedback: 0.28,
      scanlineAmount: 0.32,
      trailAmount: 0.22,
    },
  },
  {
    id: 'dub-mix-02-07-26',
    title: 'Dub Mix — 02.07.26',
    artist: 'Nate Thousand Fingers',
    audioSrc: '/assets/audio/Dub%20Mix%20-%2002.07.26_PN.mp3',
    videoSourceId: 'organic-vs-synthetic-2',
    asciiPresetId: 'jammer',
    status: 'LOCAL TAPE',
    mission: 'Break the corporate chorus',
    defaultAsciiPreset: {
      mode: 'video-reactive',
      fit: 'cover',
      tint: 'signal-fuchsia',
      contrast: 1.08,
      brightness: 0.82,
      density: 0.68,
      edge: 0.42,
      blend: 0.9,
      glyphRamp: 'signal9',
      motion: 0.72,
      glitch: 0.52,
      threshold: 0.48,
      feedback: 0.35,
      scanlineAmount: 0.38,
      trailAmount: 0.12,
    },
  },
];

/** @deprecated Use SIGNAL_9_MIXTAPE_PRESETS */
export const MIXTAPE_PRESETS = SIGNAL_9_MIXTAPE_PRESETS;

export function resolveMixtapeFitMode(fit: Signal9MixtapeAsciiPreset['fit']): MixtapeFitMode {
  return fit === 'cover' ? 'fill' : fit;
}

export function mixtapeAsciiToVideoProfile(
  ascii: Signal9MixtapeAsciiPreset,
  base: Signal9VideoAsciiProfile,
): Signal9VideoAsciiProfile {
  return {
    asciiIntensity: ascii.density ?? base.asciiIntensity,
    threshold: ascii.threshold ?? base.threshold,
    contrast: ascii.contrast !== undefined ? Math.min(1, ascii.contrast / 1.5) : base.contrast,
    brightness: ascii.brightness ?? base.brightness,
    glitchAmount: ascii.glitch ?? base.glitchAmount,
    feedback: ascii.feedback ?? base.feedback,
    scanlineAmount: ascii.scanlineAmount ?? base.scanlineAmount,
    speed: ascii.motion ?? base.speed,
    trailAmount: ascii.trailAmount ?? base.trailAmount,
    sourceEdge: ascii.edge ?? base.sourceEdge,
    sourceContrast: ascii.contrast ?? base.sourceContrast,
    sourceBlend: ascii.blend ?? base.sourceBlend,
  };
}

/** Resolve the ASCII engine baseline for a mixtape preset. */
export function resolveMixtapeVideoProfile(preset: Signal9MixtapePreset): Signal9VideoAsciiProfile {
  const base = SIGNAL_9_VIDEO_PROFILE_MAP[preset.asciiPresetId];
  if (!preset.defaultAsciiPreset) return { ...base };
  return mixtapeAsciiToVideoProfile(preset.defaultAsciiPreset, base);
}

export function getMixtapePresetById(id: string): Signal9MixtapePreset | undefined {
  return SIGNAL_9_MIXTAPE_PRESETS.find((preset) => preset.id === id);
}

export function getMixtapePresetByDeckId(deckId: string): Signal9MixtapePreset | undefined {
  if (!deckId.startsWith('mixtape-')) return undefined;
  return getMixtapePresetById(deckId.slice('mixtape-'.length));
}

export function getMixtapePresetByAudioSrc(audioSrc: string): Signal9MixtapePreset | undefined {
  const normalized = decodeURIComponent(audioSrc);
  return SIGNAL_9_MIXTAPE_PRESETS.find(
    (preset) =>
      preset.audioSrc === audioSrc ||
      decodeURIComponent(preset.audioSrc) === normalized ||
      preset.audioSrc.endsWith(normalized.split('/').pop() ?? ''),
  );
}

export function getMixtapeDeckTrackId(presetId: string): `mixtape-${string}` {
  return `mixtape-${presetId}`;
}
