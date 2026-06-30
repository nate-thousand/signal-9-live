/**
 * Signal 9 visual engine control profiles.
 * Applied via PresetBundle.ui.visualParameters → VisualEngineAdapter.updateParameter().
 * Rendering is owned by ascii-visual-engine (Plantasia ASCII Visual Engine).
 */
export interface Signal9VisualParameters {
  density: number;
  speed: number;
  glitchAmount: number;
  trailAmount: number;
  scanlineAmount: number;
  strength: number;
  sourceContrast: number;
}

/** Broadcast — stable violet CRT carrier, readable terminal glyphs */
export const SIGNAL_9_VISUAL_BROADCAST: Signal9VisualParameters = {
  density: 0.56,
  speed: 0.32,
  glitchAmount: 0.05,
  trailAmount: 0.34,
  scanlineAmount: 0.22,
  strength: 0.58,
  sourceContrast: 0.5,
};

/** Interference — cyan static corruption, heavy glitch shimmer */
export const SIGNAL_9_VISUAL_INTERFERENCE: Signal9VisualParameters = {
  density: 0.9,
  speed: 0.78,
  glitchAmount: 0.82,
  trailAmount: 0.04,
  scanlineAmount: 0.88,
  strength: 0.76,
  sourceContrast: 0.44,
};

/** Jammer — fuchsia particle bursts, feedback-heavy broken grid */
export const SIGNAL_9_VISUAL_JAMMER: Signal9VisualParameters = {
  density: 0.84,
  speed: 0.82,
  glitchAmount: 0.48,
  trailAmount: 0.08,
  scanlineAmount: 0.38,
  strength: 0.68,
  sourceContrast: 0.56,
};

/** Uplink — emerald geometric data stream, bright contrast */
export const SIGNAL_9_VISUAL_UPLINK: Signal9VisualParameters = {
  density: 0.64,
  speed: 0.6,
  glitchAmount: 0.12,
  trailAmount: 0.46,
  scanlineAmount: 0.18,
  strength: 0.84,
  sourceContrast: 0.72,
};

/** Blackout — collapsed slate void, heavy threshold collapse */
export const SIGNAL_9_VISUAL_BLACKOUT: Signal9VisualParameters = {
  density: 0.96,
  speed: 0.66,
  glitchAmount: 0.64,
  trailAmount: 0.03,
  scanlineAmount: 0.56,
  strength: 0.26,
  sourceContrast: 0.36,
};

/**
 * Per-theme ascii-visual-engine preset ids — sound/bridge mapping only.
 * Video rendering uses `prepareVideoAsciiPipeline()` (minimal preset, no pattern layers).
 */
export const SIGNAL_9_ENGINE_PRESET_MAP = {
  broadcast: { sound: 'root', visual: 'glyphCrtTerminal' },
  interference: { sound: 'vine', visual: 'glyphCorruptedBroadcast' },
  jammer: { sound: 'mycelium', visual: 'glyphParticleNebula' },
  uplink: { sound: 'mutation', visual: 'glyphAbstractGeometry' },
  blackout: { sound: 'crystal', visual: 'glyphMinimalZen' },
} as const;
