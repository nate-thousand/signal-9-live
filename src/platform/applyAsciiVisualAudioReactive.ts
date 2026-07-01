import type { VisualEngineAdapter } from '@plantasonic/platform-types';

import {
  mapSourceBlendReactive,
  mapSourceContrastReactive,
  mapSourceEdgeReactive,
} from '../config/audioReactiveConfig.js';

import { getActiveVisualBaseProfile } from './activeVisualProfile.js';
import type { AudioReactiveState } from './audioReactiveState.js';
import { applyTransmissionControlSync } from './transmissionControlState.js';

let peakHold = 0;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function mix(base: number, influence: number, amount: number): number {
  return clamp01(base + influence * amount);
}

/**
 * Drive ASCII Visual Engine controls from broadcast audio reactive bands.
 * Modulates the active baseline profile (mixtape or carrier preset).
 */
export function applyAsciiVisualAudioReactive(
  visual: VisualEngineAdapter,
  state: AudioReactiveState,
): void {
  const BASE = getActiveVisualBaseProfile();
  const energy = state.isPlaying ? 1 : 0.12;
  const bass = state.bass * energy;
  const mid = state.mid * energy;
  const treble = state.treble * energy;
  const rms = state.rms * energy;
  const amplitude = state.amplitude * energy;
  const transient = state.transient * energy;

  peakHold = state.isPlaying
    ? Math.max(state.peak, peakHold * 0.82)
    : peakHold * 0.9;
  const peakBurst = clamp01((peakHold - 0.62) * 2.4);

  // Bass — heavy interference, echo pulses
  applyTransmissionControlSync('glitch', mix(BASE.glitchAmount, bass, 0.62 + peakBurst * 0.35));
  applyTransmissionControlSync('feedback', mix(BASE.feedback, bass, 0.48));

  // Mid — density drift, motion speed, trail shimmer
  applyTransmissionControlSync('asciiIntensity', mix(BASE.asciiIntensity, mid, 0.32));
  visual.setControlSync('speed', clamp01(BASE.speed + mid * 0.58 + rms * 0.22));
  visual.setControlSync('trailAmount', clamp01(BASE.trailAmount + mid * 0.26 - treble * 0.08));

  // Treble — static scanlines, decode shimmer (post threshold only — not sourceContrast)
  applyTransmissionControlSync('scanlineAmount', mix(BASE.scanlineAmount, treble, 0.52));
  applyTransmissionControlSync('threshold', mix(BASE.threshold, treble, 0.14));

  // RMS — transmission power
  applyTransmissionControlSync('brightness', mix(BASE.brightness, rms, 0.36));

  // Peak — short glitch events layered on interference
  if (peakBurst > 0.05) {
    visual.setControlSync(
      'glitchAmount',
      clamp01(BASE.glitchAmount + bass * 0.55 + peakBurst * 0.75),
    );
  }

  // Video source sampling layer — direct engine controls (not transmission contrast slider)
  const sourceContrastBase = BASE.sourceContrast ?? 1;
  const sourceEdgeBase = BASE.sourceEdge ?? 0.35;
  const sourceBlendBase = BASE.sourceBlend ?? 1;

  visual.setControlSync(
    'sourceContrast',
    mapSourceContrastReactive(sourceContrastBase, amplitude, rms, transient),
  );
  visual.setControlSync(
    'sourceEdge',
    mapSourceEdgeReactive(sourceEdgeBase, bass, peakBurst),
  );
  visual.setControlSync(
    'sourceBlend',
    mapSourceBlendReactive(sourceBlendBase, mid, treble),
  );

  void visual.setBassGlyphScale(clamp01(bass * 0.92 + peakBurst * 0.35));
}

export function resetAsciiVisualAudioReactive(): void {
  peakHold = 0;
}
