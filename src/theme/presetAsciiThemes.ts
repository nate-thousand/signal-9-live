import type { Signal9PresetThemeId } from './applyPresetTheme.js';

/**
 * ASCII glyph colors per song preset — matches preset-themes.css transmission accents.
 * Applied directly to the Visual Engine canvas (not CSS).
 */
export const SIGNAL_9_ASCII_THEME_COLORS: Record<Signal9PresetThemeId, string> = {
  broadcast: '#8B5CF6',
  interference: '#22D3EE',
  jammer: '#C026D3',
  uplink: '#10B981',
  blackout: '#94A3B8',
};

export function getAsciiColorForPreset(presetId: Signal9PresetThemeId): string {
  return SIGNAL_9_ASCII_THEME_COLORS[presetId];
}
