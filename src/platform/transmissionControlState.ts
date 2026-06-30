import type { VisualEngineAdapter } from '@plantasonic/platform-types';

import type { TransmissionControlId } from '../config/transmissionControls.js';
import {
  mapControlSliderToEngine,
  mapThresholdToSourceEdge,
} from '../config/transmissionControls.js';
import { SIGNAL_9_VIDEO_SLIDER_CONTROLS } from '../content/videoVisualPresets.js';
import type { Signal9VideoAsciiProfile } from '../content/videoVisualPresets.js';
import {
  mapAsciiScaleSliderToDensity,
  quantizeAsciiScaleSlider,
} from './videoAsciiScale.js';
import { getSignal9VisualAdapter } from './signal9VisualIntegration.js';

const sliderValues = new Map<TransmissionControlId, number>();
let lastDensityApplied = 0;

export function getTransmissionSliderValue(id: TransmissionControlId): number | undefined {
  return sliderValues.get(id);
}

export function getTransmissionSliderValues(): ReadonlyMap<TransmissionControlId, number> {
  return sliderValues;
}

export function setTransmissionSliderValue(id: TransmissionControlId, value: number): void {
  sliderValues.set(id, Math.min(1, Math.max(0, value)));
}

export function loadTransmissionProfile(profile: Signal9VideoAsciiProfile): void {
  sliderValues.set('asciiIntensity', profile.asciiIntensity);
  sliderValues.set('threshold', profile.threshold);
  sliderValues.set('contrast', profile.contrast);
  sliderValues.set('brightness', profile.brightness);
  sliderValues.set('glitch', profile.glitchAmount);
  sliderValues.set('feedback', profile.feedback);
  sliderValues.set('scanlineAmount', profile.scanlineAmount);
}

/** Apply one slider to the live engine immediately (sync, no batching). */
export function applyTransmissionControlSync(controlId: string, sliderValue: number): void {
  const visual = getSignal9VisualAdapter();
  if (!visual) return;

  const id = controlId as TransmissionControlId;
  setTransmissionSliderValue(id, sliderValue);

  if (id === 'asciiIntensity') {
    const stepped = quantizeAsciiScaleSlider(sliderValue);
    const density = mapAsciiScaleSliderToDensity(stepped);
    if (Math.abs(density - lastDensityApplied) < 0.04) return;
    lastDensityApplied = density;
    visual.setControlSync('density', density);
    return;
  }

  if (id === 'threshold') {
    const threshold = mapControlSliderToEngine('threshold', sliderValue);
    visual.setControlSync('postThreshold', threshold);
    visual.setControlSync('sourceEdge', mapThresholdToSourceEdge(sliderValue));
    return;
  }

  if (id === 'brightness') {
    visual.setControlSync('strength', mapControlSliderToEngine('brightness', sliderValue));
    return;
  }

  const spec = SIGNAL_9_VIDEO_SLIDER_CONTROLS.find((c) => c.id === controlId);
  if (!spec) return;

  const engineValue = mapControlSliderToEngine(id, sliderValue);

  if (spec.normalized) {
    visual.setControlSync(spec.engine, engineValue);
  } else {
    visual.setControlSync(spec.engine, engineValue);
  }
}

/** Push full profile to engine (preset / source change). */
export function applyTransmissionProfileSync(profile: Signal9VideoAsciiProfile): void {
  loadTransmissionProfile(profile);
  for (const control of SIGNAL_9_VIDEO_SLIDER_CONTROLS) {
    const key =
      control.id === 'glitch' ? 'glitchAmount' : control.id;
    const value = profile[key as keyof Signal9VideoAsciiProfile];
    if (typeof value === 'number') {
      applyTransmissionControlSync(control.id, value);
    }
  }
}

export function readEngineControlSnapshot(visual: VisualEngineAdapter): Record<string, number> {
  return { ...visual.getParameterSnapshot() };
}
