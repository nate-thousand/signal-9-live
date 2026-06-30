/**
 * Signal 9 audio-reactive tuning — visuals respond across a 10%–100% input range.
 */
export const SIGNAL_9_AUDIO_REACTIVE = {
  /** Features below this level are ignored (noise floor) */
  floor: 0.05,
  /** Full-scale reactive ceiling */
  ceiling: 1,
  /** Minimum bridge sensitivity (10%) */
  minSensitivity: 0.1,
  /** Maximum bridge sensitivity (100%) */
  maxSensitivity: 1,
  /** Multiplier applied to bridge sensitivity after preset bundle load */
  sensitivityGain: 1.65,
  /** Multiplier applied to mapping amounts after preset bundle load */
  mappingGain: 1.75,
  /** MP3 analyzer gain before floor remap */
  analyzerGain: 2.85,
} as const;

/** Beat-driven per-glyph scale pulse fed via setBassGlyphScale */
export const SIGNAL_9_BEAT_SCALE = {
  gain: 2.9,
  /** Gamma < 1 exaggerates mid/high beat energy */
  curve: 0.62,
  bassWeight: 1.55,
  transientWeight: 1.35,
  amplitudeWeight: 0.45,
} as const;

/** Remap analyzer output: 10%–100% → 0–100% reactive range */
export function scaleAudioReactiveFeature(value: number): number {
  const { floor, ceiling } = SIGNAL_9_AUDIO_REACTIVE;
  const clamped = Math.min(ceiling, Math.max(0, value));
  if (clamped <= floor) return 0;
  return Math.min(ceiling, (clamped - floor) / (ceiling - floor));
}

export function boostBridgeSensitivity(sensitivity: number): number {
  const { minSensitivity, maxSensitivity, sensitivityGain } = SIGNAL_9_AUDIO_REACTIVE;
  const boosted = sensitivity * sensitivityGain;
  return Math.min(maxSensitivity, Math.max(minSensitivity, boosted));
}

export function boostMappingAmount(amount: number): number {
  const { mappingGain, ceiling } = SIGNAL_9_AUDIO_REACTIVE;
  return Math.min(ceiling, amount * mappingGain);
}
