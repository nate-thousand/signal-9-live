import type { Signal9PresetTrackId } from '../audio/transmissionTracks.js';
import {
  getDefaultVideoForPreset,
  getVideoSourceById,
  SIGNAL_9_DEFAULT_VIDEO_SOURCE,
  type Signal9VideoSource,
} from '../config/videoSources.js';
import { SIGNAL_9_VIDEO_GLYPH_SET } from '../config/emojiGlyphs.js';
import { SIGNAL_9_VIDEO_PROFILE_MAP } from '../content/videoVisualPresets.js';
import { applyPresetTheme } from '../theme/applyPresetTheme.js';
import { getAsciiColorForPreset } from '../theme/presetAsciiThemes.js';
import type { Signal9PresetThemeId } from '../theme/applyPresetTheme.js';

import { getSignal9VisualAdapter } from './signal9VisualIntegration.js';
import { startVisualLoop } from './transmissionSession.js';
import { applySignal9VisualPerformance } from './signal9VisualPerformance.js';
import {
  applyTransmissionControlSync,
  applyTransmissionProfileSync,
} from './transmissionControlState.js';
import { primeDemoVideo } from './videoDemoSource.js';

let videoBackgroundEnabled = true;

export function isVideoBackgroundEnabled(): boolean {
  return videoBackgroundEnabled;
}

export async function setVideoBackgroundEnabled(enabled: boolean): Promise<void> {
  const visual = getSignal9VisualAdapter();
  if (!visual) return;

  videoBackgroundEnabled = enabled;
  await visual.setVideoBackgroundEnabled(enabled);
  await startVisualLoop();
}

export async function applyAsciiThemeColor(
  presetId: Signal9PresetThemeId,
): Promise<void> {
  const visual = getSignal9VisualAdapter();
  if (!visual) return;
  await visual.setAsciiColor(getAsciiColorForPreset(presetId));
}

export async function applyVideoAsciiProfileForPreset(
  presetId: Signal9PresetTrackId | 'blackout',
): Promise<void> {
  applyTransmissionProfileSync(SIGNAL_9_VIDEO_PROFILE_MAP[presetId]);
}

/** Immediate slider → engine (sync, every input event). */
export function setVideoControlFromSlider(controlId: string, value: number): void {
  applyTransmissionControlSync(controlId, value);
}

async function loadVideoIntoEngine(
  source: Signal9VideoSource,
): Promise<boolean> {
  const visual = getSignal9VisualAdapter();
  if (!visual) return false;

  await applySignal9VisualPerformance(visual);
  await visual.prepareVideoAsciiPipeline();
  await visual.loadVideoSource({
    src: source.src,
    loop: source.loop,
    muted: source.muted,
    autoplay: true,
  });

  let status = visual.getVideoStatus();
  if (status.ready && !status.error) {
    return true;
  }

  console.warn('[signal-9] video load failed, trying demo fallback:', status.error, source.src);

  const demoVideo = await primeDemoVideo();
  await visual.loadVideoSource({
    element: demoVideo,
    loop: true,
    muted: true,
    autoplay: true,
  });

  status = visual.getVideoStatus();
  return status.ready && !status.error;
}

export async function loadVideoSourceForPreset(
  presetId: Signal9PresetTrackId | 'blackout',
): Promise<void> {
  const source = getDefaultVideoForPreset(presetId);
  if (!source) return;
  await loadVideoIntoEngine(source);
}

export async function loadVideoSourceById(sourceId: string): Promise<void> {
  const visual = getSignal9VisualAdapter();
  const source = getVideoSourceById(sourceId);
  if (!visual || !source) return;

  const loaded = await loadVideoIntoEngine(source);
  if (!loaded) return;

  applyTransmissionProfileSync(SIGNAL_9_VIDEO_PROFILE_MAP[source.defaultPreset]);
  applyPresetTheme(source.defaultPreset);
  await applyAsciiThemeColor(source.defaultPreset);
  await visual.setGlyphSet([...SIGNAL_9_VIDEO_GLYPH_SET]);

  if (isVideoBackgroundEnabled()) {
    await visual.setVideoBackgroundEnabled(true);
  }
}

export async function activateVideoAsciiForPreset(
  presetId: Signal9PresetTrackId | 'blackout',
): Promise<void> {
  const visual = getSignal9VisualAdapter();
  const source = getDefaultVideoForPreset(presetId);
  if (!visual || !source) {
    console.error('[signal-9] activateVideoAsciiForPreset: missing visual adapter or source');
    return;
  }

  const loaded = await loadVideoIntoEngine(source);
  if (!loaded) {
    console.error('[signal-9] activateVideoAsciiForPreset: video source not ready');
    return;
  }

  await visual.setGlyphSet([...SIGNAL_9_VIDEO_GLYPH_SET]);
  await applyAsciiThemeColor(presetId);
  applyTransmissionProfileSync(SIGNAL_9_VIDEO_PROFILE_MAP[presetId]);

  await startVisualLoop();
  if (isVideoBackgroundEnabled()) {
    await visual.setVideoBackgroundEnabled(true);
  } else {
    await visual.setVideoBackgroundEnabled(false);
  }
}

export async function playVideoTransmission(sourceId?: string): Promise<void> {
  const visual = getSignal9VisualAdapter();
  if (!visual) return;

  await startVisualLoop();

  if (!isVideoBackgroundEnabled()) {
    return;
  }

  let status = visual.getVideoStatus();
  if (!status.ready || status.error) {
    const id = sourceId ?? SIGNAL_9_DEFAULT_VIDEO_SOURCE.id;
    if (id) {
      await loadVideoSourceById(id);
      status = visual.getVideoStatus();
    }
  }

  if (!status.ready) {
    console.warn('[signal-9] video not ready:', status);
    return;
  }

  await visual.playVideo();
}

export async function pauseVideoTransmission(): Promise<void> {
  const visual = getSignal9VisualAdapter();
  if (!visual) return;
  await visual.pauseVideo();
}

export async function restartVideoTransmission(sourceId?: string): Promise<void> {
  const visual = getSignal9VisualAdapter();
  if (!visual) return;

  if (sourceId) {
    await loadVideoSourceById(sourceId);
  } else {
    await visual.restartVideo();
    return;
  }

  await startVisualLoop();
  await visual.playVideo();
}

export function getActiveVideoSourceForPreset(
  presetId: Signal9PresetTrackId | 'blackout',
): Signal9VideoSource | undefined {
  return getDefaultVideoForPreset(presetId);
}

// Legacy re-exports for any external callers
export {
  mapContrastSlider,
  mapBrightnessSlider,
  mapThresholdSlider,
  mapLinearEffectSlider,
  mapLinearTransmissionSlider,
  THRESHOLD_ENGINE_MIN,
  THRESHOLD_ENGINE_MAX,
  EFFECT_ENGINE_MIN,
  EFFECT_ENGINE_MAX,
  TRANSMISSION_ENGINE_MIN,
  TRANSMISSION_ENGINE_MAX,
} from '../config/transmissionControls.js';

export { mapAsciiScaleSliderToDensity } from './videoAsciiScale.js';
