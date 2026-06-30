/**
 * Signal 9 transmission decoder — slider → engine mapping curves.
 * Ranges tuned for stable ASCII (25%–75% decode band) and live-drag performance.
 */

/** Signal Decode Threshold engine floor/ceiling (never below 25% or above 75%). */
export const THRESHOLD_ENGINE_MIN = 0.25;
export const THRESHOLD_ENGINE_MAX = 0.75;
const THRESHOLD_SPAN = THRESHOLD_ENGINE_MAX - THRESHOLD_ENGINE_MIN;

/** Post-effect controls (feedback, scanlines) — same practical band. */
export const EFFECT_ENGINE_MIN = 0.25;
export const EFFECT_ENGINE_MAX = 0.75;
const EFFECT_SPAN = EFFECT_ENGINE_MAX - EFFECT_ENGINE_MIN;

/** @deprecated Use THRESHOLD_ENGINE_MIN — kept for legacy imports */
export const TRANSMISSION_ENGINE_MIN = THRESHOLD_ENGINE_MIN;
/** @deprecated Use THRESHOLD_ENGINE_MAX — kept for legacy imports */
export const TRANSMISSION_ENGINE_MAX = THRESHOLD_ENGINE_MAX;

export type TransmissionControlId =
  | 'asciiIntensity'
  | 'threshold'
  | 'contrast'
  | 'brightness'
  | 'glitch'
  | 'feedback'
  | 'scanlineAmount';

/** Lore-facing control definitions (internal — labels stay as-is in UI). */
export const TRANSMISSION_CONTROL_LORE: Record<
  TransmissionControlId,
  { loreName: string; description: string }
> = {
  asciiIntensity: {
    loreName: 'Transmission Resolution',
    description: 'Glyph size and decoding density of the broadcast grid.',
  },
  threshold: {
    loreName: 'Signal Decode Threshold',
    description: 'Decode sensitivity within 25%–75% — dense to sparse, no extreme churn.',
  },
  contrast: {
    loreName: 'Signal Gain',
    description: 'Amplifies broadcast intensity and source contrast.',
  },
  brightness: {
    loreName: 'Transmission Power',
    description: 'Signal energy fed into the ASCII renderer.',
  },
  glitch: {
    loreName: 'Interference',
    description: 'Injects corruption into the decoded broadcast.',
  },
  feedback: {
    loreName: 'Echo Memory',
    description: 'Recursive ghost images from previous frames.',
  },
  scanlineAmount: {
    loreName: 'Broadcast Stability',
    description: 'Analog scanline visibility and CRT persistence.',
  },
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Linear UI → effect band (25%–75%). */
export function mapLinearEffectSlider(sliderValue: number): number {
  const t = clamp01(sliderValue);
  return EFFECT_ENGINE_MIN + t * EFFECT_SPAN;
}

/** @deprecated Use mapLinearEffectSlider */
export function mapLinearTransmissionSlider(sliderValue: number): number {
  return mapLinearEffectSlider(sliderValue);
}

/**
 * Signal Decode Threshold — linear 25%–75%.
 * Low: readable dense decode. High: cleaner sparse edges. No 0/100 extremes.
 */
export function mapThresholdSlider(sliderValue: number): number {
  const t = clamp01(sliderValue);
  return THRESHOLD_ENGINE_MIN + t * THRESHOLD_SPAN;
}

/** Source edge emphasis — narrower band to limit sampling churn. */
export function mapThresholdToSourceEdge(sliderValue: number): number {
  const t = clamp01(sliderValue);
  return 0.2 + t * 0.35;
}

/** Signal Gain — linear contrast multiplier (moderate range). */
export function mapContrastSlider(sliderValue: number): number {
  const t = mapLinearEffectSlider(sliderValue);
  return 0.65 + t * 0.9;
}

/** Transmission Power — linear brightness multiplier. */
export function mapBrightnessSlider(sliderValue: number): number {
  const t = mapLinearEffectSlider(sliderValue);
  return 0.55 + t * 0.75;
}

/**
 * Interference — capped within effect band; slow until 40%, then ramps.
 */
export function mapGlitchSlider(sliderValue: number): number {
  const t = clamp01(sliderValue);
  let raw: number;
  if (t <= 0.4) raw = (t / 0.4) * 0.12;
  else if (t <= 0.6) raw = 0.12 + ((t - 0.4) / 0.2) * 0.18;
  else raw = 0.3 + ((t - 0.6) / 0.4) * 0.35;
  return Math.min(EFFECT_ENGINE_MAX, EFFECT_ENGINE_MIN + raw * EFFECT_SPAN);
}

/** Echo Memory — quadratic within 25%–75% (less frame blending at low values). */
export function mapFeedbackSlider(sliderValue: number): number {
  const t = clamp01(sliderValue);
  const curved = t * t;
  return EFFECT_ENGINE_MIN + curved * EFFECT_SPAN;
}

/** Broadcast Stability — smoothstep within effect band. */
export function mapScanlineSlider(sliderValue: number): number {
  const t = clamp01(sliderValue);
  const eased = t * t * (3 - 2 * t);
  return EFFECT_ENGINE_MIN + eased * EFFECT_SPAN;
}

export function mapControlSliderToEngine(
  controlId: TransmissionControlId,
  sliderValue: number,
): number {
  switch (controlId) {
    case 'threshold':
      return mapThresholdSlider(sliderValue);
    case 'contrast':
      return mapContrastSlider(sliderValue);
    case 'brightness':
      return mapBrightnessSlider(sliderValue);
    case 'glitch':
      return mapGlitchSlider(sliderValue);
    case 'feedback':
      return mapFeedbackSlider(sliderValue);
    case 'scanlineAmount':
      return mapScanlineSlider(sliderValue);
    default:
      return sliderValue;
  }
}
