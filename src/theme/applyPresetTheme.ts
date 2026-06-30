/**
 * Per-preset UI theme palettes.
 * Applied via `data-s9-preset` on `<html>` — see preset-themes.css.
 */
import type { Signal9PresetTrackId } from '../audio/transmissionTracks.js';

export type Signal9PresetThemeId = Signal9PresetTrackId | 'blackout';

export const SIGNAL_9_PRESET_THEME_IDS: Signal9PresetThemeId[] = [
  'broadcast',
  'interference',
  'jammer',
  'uplink',
  'blackout',
];

export function isSignal9PresetThemeId(id: string): id is Signal9PresetThemeId {
  return SIGNAL_9_PRESET_THEME_IDS.includes(id as Signal9PresetThemeId);
}

/** Set active preset theme (song + UI chrome share the same preset id). */
export function applyPresetTheme(presetId: Signal9PresetThemeId): void {
  document.documentElement.dataset.s9Preset = presetId;
}

export function clearPresetTheme(): void {
  delete document.documentElement.dataset.s9Preset;
}
