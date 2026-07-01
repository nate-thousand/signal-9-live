import type { Signal9PresetTrackId } from '../audio/transmissionTracks.js';

/**
 * Video-to-ASCII control profiles for ascii-visual-engine source + post pipeline.
 * Tuned per UI theme — paired with glyph presets in visualPresets.ts.
 */
export interface Signal9VideoAsciiProfile {
  asciiIntensity: number;
  threshold: number;
  contrast: number;
  brightness: number;
  glitchAmount: number;
  feedback: number;
  scanlineAmount: number;
  speed: number;
  trailAmount: number;
  /** sourceEdge — edge emphasis for static / interference themes */
  sourceEdge?: number;
  /** Video source contrast multiplier (engine default 1.0) */
  sourceContrast?: number;
  /** Video source blend strength (engine default 1.0) */
  sourceBlend?: number;
}

/** Broadcast — clean violet CRT transmission */
export const SIGNAL_9_VIDEO_BROADCAST: Signal9VideoAsciiProfile = {
  asciiIntensity: 0.42,
  threshold: 0.45,
  contrast: 0.5,
  brightness: 0.58,
  glitchAmount: 0.04,
  feedback: 0.22,
  scanlineAmount: 0.25,
  speed: 0.3,
  trailAmount: 0.28,
  sourceEdge: 0.35,
  sourceContrast: 1,
  sourceBlend: 1,
};

/** Interference — cyan static corruption, aggressive glitch */
export const SIGNAL_9_VIDEO_INTERFERENCE: Signal9VideoAsciiProfile = {
  asciiIntensity: 0.72,
  threshold: 0.58,
  contrast: 0.58,
  brightness: 0.74,
  glitchAmount: 0.72,
  feedback: 0.38,
  scanlineAmount: 0.62,
  speed: 0.72,
  trailAmount: 0.05,
  sourceEdge: 0.48,
  sourceContrast: 1.05,
  sourceBlend: 0.95,
};

/** Jammer — fuchsia feedback bursts, broken particle field */
export const SIGNAL_9_VIDEO_JAMMER: Signal9VideoAsciiProfile = {
  asciiIntensity: 0.68,
  threshold: 0.5,
  contrast: 0.54,
  brightness: 0.66,
  glitchAmount: 0.52,
  feedback: 0.55,
  scanlineAmount: 0.4,
  speed: 0.8,
  trailAmount: 0.1,
  sourceEdge: 0.42,
  sourceContrast: 1.08,
  sourceBlend: 0.88,
};

/** Uplink — emerald high-contrast data geometry */
export const SIGNAL_9_VIDEO_UPLINK: Signal9VideoAsciiProfile = {
  asciiIntensity: 0.55,
  threshold: 0.4,
  contrast: 0.82,
  brightness: 0.88,
  glitchAmount: 0.1,
  feedback: 0.3,
  scanlineAmount: 0.22,
  speed: 0.54,
  trailAmount: 0.38,
  sourceEdge: 0.38,
  sourceContrast: 1.12,
  sourceBlend: 0.92,
};

/** Blackout — slate void, crushed visibility */
export const SIGNAL_9_VIDEO_BLACKOUT: Signal9VideoAsciiProfile = {
  asciiIntensity: 0.78,
  threshold: 0.68,
  contrast: 0.32,
  brightness: 0.22,
  glitchAmount: 0.55,
  feedback: 0.2,
  scanlineAmount: 0.45,
  speed: 0.58,
  trailAmount: 0.02,
  sourceEdge: 0.5,
  sourceContrast: 0.92,
  sourceBlend: 0.78,
};

export const SIGNAL_9_VIDEO_PROFILE_MAP: Record<
  Signal9PresetTrackId | 'blackout',
  Signal9VideoAsciiProfile
> = {
  broadcast: SIGNAL_9_VIDEO_BROADCAST,
  interference: SIGNAL_9_VIDEO_INTERFERENCE,
  jammer: SIGNAL_9_VIDEO_JAMMER,
  uplink: SIGNAL_9_VIDEO_UPLINK,
  blackout: SIGNAL_9_VIDEO_BLACKOUT,
};

export const SIGNAL_9_VIDEO_SLIDER_CONTROLS = [
  /** Transmission Resolution — stepped density via mapAsciiScaleSliderToDensity */
  { id: 'asciiIntensity', label: 'ASCII Scale', engine: 'density' as const, normalized: false },
  /** Signal Decode Threshold — linear 25%–75% engine band */
  { id: 'threshold', label: 'Threshold', engine: 'postThreshold' as const, normalized: true },
  /** Signal Gain */
  { id: 'contrast', label: 'Contrast', engine: 'sourceContrast' as const, normalized: false },
  /** Transmission Power */
  { id: 'brightness', label: 'Brightness', engine: 'strength' as const, normalized: false },
  /** Interference */
  { id: 'glitch', label: 'Glitch', engine: 'glitchAmount' as const, normalized: true },
  /** Echo Memory */
  { id: 'feedback', label: 'Feedback', engine: 'postFeedback' as const, normalized: true },
  /** Broadcast Stability */
  { id: 'scanlineAmount', label: 'Scanlines', engine: 'postScanline' as const, normalized: true },
] as const;
