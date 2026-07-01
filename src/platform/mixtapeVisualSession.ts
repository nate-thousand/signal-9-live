import {
  getMixtapePresetByDeckId,
  MIXTAPE_TINT_COLORS,
  resolveMixtapeFitMode,
  resolveMixtapeVideoProfile,
  type Signal9MixtapePreset,
} from '../config/mixtapePresets.js';
import { getVideoSourceById } from '../config/videoSources.js';
import { SIGNAL_9_VIDEO_GLYPH_SET } from '../config/emojiGlyphs.js';
import { getAsciiColorForPreset } from '../theme/presetAsciiThemes.js';
import type { Signal9PresetThemeId } from '../theme/applyPresetTheme.js';

import { setActiveVisualBaseProfile } from './activeVisualProfile.js';
import { setDedicatedVisualLock } from './ambientVisualChannelRegistry.js';
import { resetAsciiVisualAudioReactive } from './applyAsciiVisualAudioReactive.js';
import { getSignal9VisualAdapter } from './signal9VisualIntegration.js';
import { applyTransmissionProfileSync } from './transmissionControlState.js';
import {
  activateLocalVideoSourceMode,
  startVisualEngineVideoPlayback,
} from './videoAsciiSession.js';

let activeMixtapePreset: Signal9MixtapePreset | null = null;

export function getActiveMixtapePreset(): Signal9MixtapePreset | null {
  return activeMixtapePreset;
}

export function getActiveMixtapePresetForDeck(deckId: string): Signal9MixtapePreset | null {
  return getMixtapePresetByDeckId(deckId) ?? null;
}

async function applyMixtapeAsciiPreset(preset: Signal9MixtapePreset): Promise<void> {
  const visual = getSignal9VisualAdapter();
  if (!visual) return;

  const profile = resolveMixtapeVideoProfile(preset);
  const overrides = preset.defaultAsciiPreset;
  const asciiColor =
    overrides?.tint !== undefined
      ? MIXTAPE_TINT_COLORS[overrides.tint]
      : getAsciiColorForPreset(preset.asciiPresetId as Signal9PresetThemeId);

  resetAsciiVisualAudioReactive();
  setActiveVisualBaseProfile(profile);
  await visual.setGlyphSet([...SIGNAL_9_VIDEO_GLYPH_SET]);
  await visual.setAsciiColor(asciiColor);
  applyTransmissionProfileSync(profile);

  if (overrides?.contrast !== undefined) {
    visual.setControlSync('sourceContrast', overrides.contrast);
  }
  if (overrides?.edge !== undefined) {
    visual.setControlSync('sourceEdge', overrides.edge);
  }
  if (overrides?.blend !== undefined) {
    visual.setControlSync('sourceBlend', overrides.blend);
  }
  if (overrides?.motion !== undefined) {
    visual.setControlSync('speed', overrides.motion);
  }
}

/** Load mixtape video source and apply its linked ASCII preset profile. */
export async function activateMixtapeVisual(preset: Signal9MixtapePreset): Promise<boolean> {
  const visual = getSignal9VisualAdapter();
  if (!visual) return false;

  const source = getVideoSourceById(preset.videoSourceId);
  if (!source) {
    console.warn('[signal-9] unknown mixtape video source id:', preset.videoSourceId);
    return false;
  }

  activeMixtapePreset = preset;
  setDedicatedVisualLock(true);

  const fit = preset.defaultAsciiPreset?.fit ?? 'cover';
  const loaded = await activateLocalVideoSourceMode(preset.videoSourceId, {
    loop: source.loop,
    muted: source.muted,
    autoplay: false,
    fitMode: resolveMixtapeFitMode(fit),
    applySourceAsciiProfile: false,
  });

  if (!loaded) {
    console.warn('[signal-9] mixtape video load failed:', preset.videoSourceId);
    clearMixtapeVisual();
    return false;
  }

  await applyMixtapeAsciiPreset(preset);
  return true;
}

export async function playMixtapeVisualTransmission(): Promise<void> {
  if (!activeMixtapePreset) return;
  await startVisualEngineVideoPlayback();
}

export function clearMixtapeVisual(): void {
  activeMixtapePreset = null;
}
