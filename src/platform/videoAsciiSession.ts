import type { Signal9PresetTrackId } from '../audio/transmissionTracks.js';
import {
  getDefaultVideoForPreset,
  getVideoSourceById,
  getVideoSourceBySrc,
  SIGNAL_9_DEFAULT_VIDEO_SOURCE,
  type Signal9VideoSource,
} from '../config/videoSources.js';
import { SIGNAL_9_VIDEO_GLYPH_SET } from '../config/emojiGlyphs.js';
import { SIGNAL_9_VIDEO_PROFILE_MAP, SIGNAL_9_VIDEO_BROADCAST } from '../content/videoVisualPresets.js';
import { applyPresetTheme } from '../theme/applyPresetTheme.js';
import { getAsciiColorForPreset } from '../theme/presetAsciiThemes.js';
import type { Signal9PresetThemeId } from '../theme/applyPresetTheme.js';

import { setActiveVisualBaseProfile } from './activeVisualProfile.js';
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
  const profile = SIGNAL_9_VIDEO_PROFILE_MAP[presetId];
  setActiveVisualBaseProfile(profile);
  applyTransmissionProfileSync(profile);
}

/** Immediate slider → engine (sync, every input event). */
export function setVideoControlFromSlider(controlId: string, value: number): void {
  applyTransmissionControlSync(controlId, value);
}

export type VisualEngineVideoLoadOptions = {
  loop?: boolean;
  muted?: boolean;
  autoplay?: boolean;
  fitMode?: 'fit' | 'fill' | 'stretch' | 'center';
  /** When false, skip the video asset's default ASCII profile (e.g. mixtape presets). */
  applySourceAsciiProfile?: boolean;
};

/**
 * Load a URL through the Plantasonic Visual Engine VideoSource pipeline.
 * Signal 9 does not decode or manage media — the engine owns loading and decoding.
 */
export async function loadVisualEngineVideoUrl(
  src: string,
  options: VisualEngineVideoLoadOptions = {},
): Promise<boolean> {
  const visual = getSignal9VisualAdapter();
  if (!visual) return false;

  await applySignal9VisualPerformance(visual);
  await visual.prepareVideoAsciiPipeline();
  await visual.loadVideoSource({
    src,
    loop: options.loop ?? true,
    muted: options.muted ?? true,
    autoplay: options.autoplay ?? true,
    fitMode: options.fitMode ?? 'fit',
  });

  const status = visual.getVideoStatus();
  return status.ready && !status.error;
}

/** Activate engine source mode so video frames drive the ASCII grid. */
export async function enableVideoSourceMode(): Promise<void> {
  const visual = getSignal9VisualAdapter();
  if (!visual || !isVideoBackgroundEnabled()) return;

  await visual.setSourceMode('source');
  await visual.setVideoBackgroundEnabled(true);
  await startVisualLoop();
}

/** Apply ASCII profile + theme for a local public/assets/video/ URL. */
export async function applyVideoSourceAsciiProfile(src: string): Promise<void> {
  const visual = getSignal9VisualAdapter();
  if (!visual) return;

  const meta = getVideoSourceBySrc(src);
  const presetId = meta?.defaultPreset ?? 'broadcast';

  setActiveVisualBaseProfile(SIGNAL_9_VIDEO_PROFILE_MAP[presetId]);
  await visual.setGlyphSet([...SIGNAL_9_VIDEO_GLYPH_SET]);
  await applyAsciiThemeColor(presetId);
  applyTransmissionProfileSync(SIGNAL_9_VIDEO_PROFILE_MAP[presetId]);

  const profile = SIGNAL_9_VIDEO_PROFILE_MAP[presetId];
  if (typeof profile.sourceContrast === 'number') {
    visual.setControlSync('sourceContrast', profile.sourceContrast);
  }
  if (typeof profile.sourceEdge === 'number') {
    visual.setControlSync('sourceEdge', profile.sourceEdge);
  }
  if (typeof profile.sourceBlend === 'number') {
    visual.setControlSync('sourceBlend', profile.sourceBlend);
  }
}

function resolveLocalVideoSource(ref: string): Signal9VideoSource | undefined {
  return getVideoSourceById(ref) ?? getVideoSourceBySrc(ref);
}

/**
 * Load a configured video source id or local asset URL and activate ASCII source mode.
 * Mixtapes pass `videoSourceId`; ambient playlist passes discovered `/assets/video/` URLs.
 */
export async function activateLocalVideoSourceMode(
  videoSourceIdOrSrc: string,
  options: VisualEngineVideoLoadOptions = {},
): Promise<boolean> {
  const { applySourceAsciiProfile = true, ...loadOptions } = options;
  const source = resolveLocalVideoSource(videoSourceIdOrSrc);
  const src = source?.src ?? videoSourceIdOrSrc;

  const loaded = await loadVisualEngineVideoUrl(src, {
    loop: source?.loop ?? true,
    muted: source?.muted ?? true,
    autoplay: loadOptions.autoplay ?? true,
    fitMode: loadOptions.fitMode ?? 'fill',
    ...loadOptions,
  });
  if (!loaded) return false;

  if (applySourceAsciiProfile) {
    await applyVideoSourceAsciiProfile(src);
  }
  await enableVideoSourceMode();
  return true;
}

/** Signal 9 broadcast surveillance ASCII profile — purple terminal aesthetic. */
export async function applySignal9AsciiSurveillanceProfile(): Promise<void> {
  const visual = getSignal9VisualAdapter();
  if (!visual) return;

  setActiveVisualBaseProfile(SIGNAL_9_VIDEO_BROADCAST);
  await visual.setGlyphSet([...SIGNAL_9_VIDEO_GLYPH_SET]);
  await applyAsciiThemeColor('broadcast');
  applyTransmissionProfileSync(SIGNAL_9_VIDEO_BROADCAST);
}

/** Enable video-to-ASCII sampling and start engine playback. */
export async function startVisualEngineVideoPlayback(): Promise<void> {
  const visual = getSignal9VisualAdapter();
  if (!visual) return;

  await startVisualLoop();
  if (isVideoBackgroundEnabled()) {
    await visual.setVideoBackgroundEnabled(true);
  }
  await visual.playVideo();
}

async function loadVideoIntoEngine(
  source: Signal9VideoSource,
): Promise<boolean> {
  const loaded = await activateLocalVideoSourceMode(source.src, {
    loop: source.loop,
    muted: source.muted,
    autoplay: true,
    fitMode: 'fill',
  });
  if (loaded) return true;

  const visual = getSignal9VisualAdapter();
  if (!visual) return false;

  console.warn('[signal-9] video load failed, trying demo fallback:', source.src);

  const demoVideo = await primeDemoVideo();
  await visual.loadVideoSource({
    element: demoVideo,
    loop: true,
    muted: true,
    autoplay: true,
  });

  const status = visual.getVideoStatus();
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
  setActiveVisualBaseProfile(SIGNAL_9_VIDEO_PROFILE_MAP[source.defaultPreset]);
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
  setActiveVisualBaseProfile(SIGNAL_9_VIDEO_PROFILE_MAP[presetId]);

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
