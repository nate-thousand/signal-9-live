import type { Signal9PresetTrackId } from '../audio/transmissionTracks.js';
import { resolvePresetTrack } from '../audio/transmissionTracks.js';
import { SIGNAL_9_PRESET_BUNDLES } from '../content/presetBundles.js';
import { applyPresetTheme } from '../theme/applyPresetTheme.js';

import { applySignal9AudioReactiveBoost, getSignal9AudioReactiveBridge } from './signal9AudioReactive.js';
import { getSignal9Mp3Adapter } from './signal9SoundIntegration.js';
import { activateVideoAsciiForPreset } from './videoAsciiSession.js';
import { syncVideoPanelPreset } from '../ui/VideoTransmissionControls.js';

/** Apply audio-reactive bridge from bundle — no visual preset (video owns the stage). */
function applyBridgePreset(presetId: Signal9PresetTrackId): void {
  const bundle = SIGNAL_9_PRESET_BUNDLES.find((entry) => entry.id === presetId);
  const bridge = getSignal9AudioReactiveBridge();
  if (!bundle?.audioReactive || !bridge) return;

  const reactive = bundle.audioReactive;
  bridge.updateMapping({
    enabled: reactive.enabled ?? true,
    sensitivity: reactive.sensitivity ?? 0.75,
    smoothing: reactive.smoothing ?? 0.65,
    mappings: (reactive.mappings ?? []).map((mapping) => ({ ...mapping })),
  });
  applySignal9AudioReactiveBoost(bridge);
}

/**
 * Apply a Signal 9 preset: UI theme, bridge, MP3, and video-to-ASCII.
 * Skips bundle visual preset — glyph presets break video source sampling.
 */
export async function applySignal9Preset(
  _instrumentRoot: HTMLElement,
  presetId: Signal9PresetTrackId,
): Promise<void> {
  const adapter = getSignal9Mp3Adapter();
  const track = resolvePresetTrack(presetId);
  const wasPlaying = adapter?.getStatus().playing ?? false;

  applyPresetTheme(presetId);
  applyBridgePreset(presetId);

  await activateVideoAsciiForPreset(presetId);
  syncVideoPanelPreset(presetId);

  if (adapter && track) {
    await adapter.loadTrack(track, wasPlaying);
  }
}

export function updateTransmissionPresetUi(
  presetsRoot: ParentNode,
  activeId: Signal9PresetTrackId,
): void {
  presetsRoot.querySelectorAll<HTMLButtonElement>('[data-s9-preset]').forEach((btn) => {
    const active = btn.dataset.s9Preset === activeId;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}
