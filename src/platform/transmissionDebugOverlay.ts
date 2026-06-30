import type { VisualEngineAdapter } from '@plantasonic/platform-types';

import { mapGlitchSlider } from '../config/transmissionControls.js';
import { getSignal9Mp3Adapter } from './signal9SoundIntegration.js';
import { getSignal9VisualAdapter } from './signal9VisualIntegration.js';
import {
  getTransmissionSliderValue,
  readEngineControlSnapshot,
} from './transmissionControlState.js';
import { isVideoBackgroundEnabled } from './videoAsciiSession.js';

const DEBUG_FLAG_KEY = 'signal9-debug';
const DEBUG_QUERY = 'debug';

export function isTransmissionDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  if (params.has(DEBUG_QUERY)) return true;
  try {
    return window.localStorage.getItem(DEBUG_FLAG_KEY) === '1';
  } catch {
    return false;
  }
}

let overlayEl: HTMLElement | null = null;
let overlayRaf = 0;

function formatNum(value: number, digits = 3): string {
  return value.toFixed(digits);
}

function collectDiagnostics(visual: VisualEngineAdapter): string[] {
  const status = visual.getStatus();
  const video = visual.getVideoStatus();
  const snapshot = readEngineControlSnapshot(visual);
  const diag = visual.getTransmissionDiagnostics();
  const sound = getSignal9Mp3Adapter();
  const features = sound?.getAudioFeatures();
  const thresholdSlider = getTransmissionSliderValue('threshold');
  const glitchSlider = getTransmissionSliderValue('glitch');

  return [
    `threshold: ${snapshot.postThreshold !== undefined ? formatNum(snapshot.postThreshold) : '—'} (ui ${thresholdSlider !== undefined ? `${Math.round(thresholdSlider * 100)}%` : '—'})`,
    `glyphs: ${diag ? `${diag.glyphCount} (${diag.cols}×${diag.rows})` : '—'}`,
    `fps: ${status.fps ?? 0} | render: ${diag ? `${formatNum(diag.renderTimeMs, 2)}ms` : '—'}`,
    `video: ${video.width}×${video.height} ${video.playing ? 'play' : 'pause'} [${video.sourceMode}]`,
    `preset: ${status.currentPresetId ?? '—'} | renderer: ${diag?.rendererId ?? '—'}`,
    `source: ${video.activeSourceId ?? 'procedural'}${isVideoBackgroundEnabled() ? '' : ' (video off)'}`,
    `interference: ${glitchSlider !== undefined ? formatNum(mapGlitchSlider(glitchSlider)) : '—'}`,
    `amplitude: ${features ? formatNum(features.amplitude) : '—'}`,
    `density: ${snapshot.density !== undefined ? formatNum(snapshot.density, 2) : '—'}`,
  ];
}

export function mountTransmissionDebugOverlay(root: HTMLElement): void {
  if (!isTransmissionDebugEnabled()) return;
  if (overlayEl) return;

  overlayEl = document.createElement('div');
  overlayEl.className = 's9-transmission-debug';
  overlayEl.setAttribute('aria-hidden', 'true');
  root.appendChild(overlayEl);

  const tick = (): void => {
    overlayRaf = requestAnimationFrame(tick);
    const visual = getSignal9VisualAdapter();
    if (!visual || !overlayEl) return;
    overlayEl.textContent = collectDiagnostics(visual).join('\n');
  };

  overlayRaf = requestAnimationFrame(tick);
}

export function unmountTransmissionDebugOverlay(): void {
  if (overlayRaf) cancelAnimationFrame(overlayRaf);
  overlayRaf = 0;
  overlayEl?.remove();
  overlayEl = null;
}
