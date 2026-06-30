import type { PresetBundle } from '@plantasonic/platform-types';

import {
  SIGNAL_9_ENGINE_PRESET_MAP,
  SIGNAL_9_VISUAL_BLACKOUT,
  SIGNAL_9_VISUAL_BROADCAST,
  SIGNAL_9_VISUAL_INTERFERENCE,
  SIGNAL_9_VISUAL_JAMMER,
  SIGNAL_9_VISUAL_UPLINK,
} from './visualPresets.js';

/** Shared audio-reactive mapping: bass→density, mids→motion, highs→brightness, amplitude→scale, peaks→glitch */
const SIGNAL_9_BRIDGE_BASE = {
  bass: { feature: 'bass' as const, target: 'density' as const },
  mids: { feature: 'mids' as const, target: 'motion' as const },
  highs: { feature: 'highs' as const, target: 'brightness' as const },
  amplitude: { feature: 'amplitude' as const, target: 'scale' as const },
  transient: { feature: 'transient' as const, target: 'glitch' as const },
};

function bridgeMappings(
  amounts: { bass: number; mids: number; highs: number; amplitude: number; transient: number },
) {
  return [
    { ...SIGNAL_9_BRIDGE_BASE.bass, amount: amounts.bass, enabled: true },
    { ...SIGNAL_9_BRIDGE_BASE.mids, amount: amounts.mids, enabled: true },
    { ...SIGNAL_9_BRIDGE_BASE.highs, amount: amounts.highs, enabled: true },
    { ...SIGNAL_9_BRIDGE_BASE.amplitude, amount: amounts.amplitude, enabled: true },
    { ...SIGNAL_9_BRIDGE_BASE.transient, amount: amounts.transient, enabled: true },
  ];
}

/** Per-preset bridge sensitivity — scaled to 10%–100% range after applySignal9AudioReactiveBoost */

/** Broadcast — baseline resistance carrier on the ASCII stage */
export const SIGNAL_9_BROADCAST_BUNDLE: PresetBundle = {
  id: 'broadcast',
  name: 'Broadcast',
  description: 'Atmo Beats carrier — clean video-to-ASCII broadcast transmission.',
  category: 'broadcast',
  tags: ['signal-9', 'broadcast', 'crt', 'ascii-engine'],
  sound: { presetId: SIGNAL_9_ENGINE_PRESET_MAP.broadcast.sound },
  visual: { presetId: SIGNAL_9_ENGINE_PRESET_MAP.broadcast.visual },
  audioReactive: {
    enabled: true,
    sensitivity: 0.85,
    smoothing: 0.38,
    mappings: bridgeMappings({
      bass: 0.72,
      mids: 0.62,
      highs: 0.55,
      amplitude: 0.78,
      transient: 0.55,
    }),
  },
  workspace: { activeInspectorPanel: 'audio-reactive' },
  ui: {
    audioReactiveEnabled: true,
    tempo: 84,
    soundParameters: { growth: 0.35, bloom: 0.25, roots: 0.55, mold: 0.35, bacteria: 0.35 },
    visualParameters: { ...SIGNAL_9_VISUAL_BROADCAST },
    bridgeSensitivity: 0.9,
    bridgeSmoothing: 0.38,
  },
};

/** Interference — corrupted transmission static and scanline glitch bursts */
export const SIGNAL_9_INTERFERENCE_BUNDLE: PresetBundle = {
  id: 'interference',
  name: 'Interference',
  description: 'Dead Wave static — high glitch video ASCII distortion.',
  category: 'broadcast',
  tags: ['signal-9', 'interference', 'static', 'ascii-engine'],
  sound: { presetId: SIGNAL_9_ENGINE_PRESET_MAP.interference.sound },
  visual: { presetId: SIGNAL_9_ENGINE_PRESET_MAP.interference.visual },
  audioReactive: {
    enabled: true,
    sensitivity: 1,
    smoothing: 0.22,
    mappings: bridgeMappings({
      bass: 0.72,
      mids: 0.68,
      highs: 0.88,
      amplitude: 0.62,
      transient: 1,
    }),
  },
  workspace: { activeInspectorPanel: 'visual-parameters' },
  ui: {
    audioReactiveEnabled: true,
    tempo: 104,
    soundParameters: { growth: 0.3, bloom: 0.2, roots: 0.35, mold: 0.88, bacteria: 0.55 },
    visualParameters: { ...SIGNAL_9_VISUAL_INTERFERENCE },
    bridgeSensitivity: 1,
    bridgeSmoothing: 0.28,
  },
};

/** Jammer — grid pulse jamming with broken sub pulses */
export const SIGNAL_9_JAMMER_BUNDLE: PresetBundle = {
  id: 'jammer',
  name: 'Jammer',
  description: 'Ghost Shadow pulse — broken signal feedback on video ASCII.',
  category: 'resistance',
  tags: ['signal-9', 'jammer', 'grid', 'ascii-engine'],
  sound: { presetId: SIGNAL_9_ENGINE_PRESET_MAP.jammer.sound },
  visual: { presetId: SIGNAL_9_ENGINE_PRESET_MAP.jammer.visual },
  audioReactive: {
    enabled: true,
    sensitivity: 0.95,
    smoothing: 0.3,
    mappings: bridgeMappings({
      bass: 0.92,
      mids: 0.78,
      highs: 0.68,
      amplitude: 0.82,
      transient: 0.88,
    }),
  },
  workspace: { activeInspectorPanel: 'audio-reactive' },
  ui: {
    audioReactiveEnabled: true,
    tempo: 96,
    soundParameters: { growth: 0.4, bloom: 0.25, roots: 0.3, mold: 0.5, bacteria: 0.82 },
    visualParameters: { ...SIGNAL_9_VISUAL_JAMMER },
    bridgeSensitivity: 0.95,
    bridgeSmoothing: 0.38,
  },
};

/** Uplink — resistance burst with tape-delay motion through the grid */
export const SIGNAL_9_UPLINK_BUNDLE: PresetBundle = {
  id: 'uplink',
  name: 'Uplink',
  description: 'Dust & Data uplink — bright high-contrast video ASCII.',
  category: 'resistance',
  tags: ['signal-9', 'uplink', 'transmission', 'ascii-engine'],
  sound: { presetId: SIGNAL_9_ENGINE_PRESET_MAP.uplink.sound },
  visual: { presetId: SIGNAL_9_ENGINE_PRESET_MAP.uplink.visual },
  audioReactive: {
    enabled: true,
    sensitivity: 0.88,
    smoothing: 0.45,
    mappings: bridgeMappings({
      bass: 0.62,
      mids: 0.9,
      highs: 0.75,
      amplitude: 0.7,
      transient: 0.55,
    }),
  },
  workspace: { activeInspectorPanel: 'audio-reactive' },
  ui: {
    audioReactiveEnabled: true,
    tempo: 88,
    soundParameters: { growth: 0.45, bloom: 0.3, roots: 0.28, mold: 0.62, bacteria: 0.6 },
    visualParameters: { ...SIGNAL_9_VISUAL_UPLINK },
    bridgeSensitivity: 0.9,
    bridgeSmoothing: 0.48,
  },
};

/** Blackout — collapsed video ASCII, heavy threshold */
export const SIGNAL_9_BLACKOUT_BUNDLE: PresetBundle = {
  id: 'blackout',
  name: 'Blackout',
  description: 'Grid collapse — low visibility video ASCII with heavy threshold.',
  category: 'experimental',
  tags: ['signal-9', 'blackout', 'collapse', 'video-ascii'],
  sound: { presetId: SIGNAL_9_ENGINE_PRESET_MAP.blackout.sound },
  visual: { presetId: SIGNAL_9_ENGINE_PRESET_MAP.blackout.visual },
  audioReactive: {
    enabled: true,
    sensitivity: 1,
    smoothing: 0.25,
    mappings: bridgeMappings({
      bass: 0.78,
      mids: 0.82,
      highs: 0.58,
      amplitude: 0.65,
      transient: 0.95,
    }),
  },
  workspace: { activeInspectorPanel: 'visual-parameters' },
  ui: {
    audioReactiveEnabled: true,
    tempo: 112,
    soundParameters: { growth: 0.28, bloom: 0.16, roots: 0.2, mold: 0.72, bacteria: 0.62 },
    visualParameters: { ...SIGNAL_9_VISUAL_BLACKOUT },
    bridgeSensitivity: 1,
    bridgeSmoothing: 0.28,
  },
};

export const SIGNAL_9_STARTER_BUNDLE = SIGNAL_9_BROADCAST_BUNDLE;

export const SIGNAL_9_PRESET_BUNDLES: PresetBundle[] = [
  SIGNAL_9_BROADCAST_BUNDLE,
  SIGNAL_9_INTERFERENCE_BUNDLE,
  SIGNAL_9_JAMMER_BUNDLE,
  SIGNAL_9_UPLINK_BUNDLE,
  SIGNAL_9_BLACKOUT_BUNDLE,
];
