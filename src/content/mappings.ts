/**
 * Signal 9 audio → visual bridge reference.
 * Runtime mapping is configured per PresetBundle.audioReactive.mappings.
 *
 * Platform bridge (no engine coupling):
 *   bass      → density
 *   mids      → motion (engine speed)
 *   highs     → brightness (engine strength)
 *   amplitude → scale (engine sourceContrast)
 *   transient → glitch (engine glitchAmount)
 *
 * Base scanlines, trails, and contrast are set in visualParameters per preset.
 */
export const SIGNAL_9_DEFAULT_TEMPO = 84;

export const SIGNAL_9_BRIDGE_REFERENCE = {
  bass: { target: 'density' as const, amount: 0.5, engineControl: 'density' },
  mids: { target: 'motion' as const, amount: 0.45, engineControl: 'speed' },
  highs: { target: 'brightness' as const, amount: 0.4, engineControl: 'strength' },
  amplitude: { target: 'scale' as const, amount: 0.42, engineControl: 'sourceContrast' },
  transient: { target: 'glitch' as const, amount: 0.35, engineControl: 'glitchAmount' },
} as const;

export const SIGNAL_9_PRESET_MAPPING_NOTES = {
  description:
    'Signal 9 pairs ascii-visual-engine presets with broadcast bundles. Audio is MP3 transmission — not synth.',
  renderer: 'ascii-visual-engine (Plantasia ASCII Visual Engine)',
  audioSource: 'public/assets/audio/*.mp3 (one track per preset → Audio Reactive Bridge)',
  presets: [
    { bundle: 'broadcast', track: 'atmo-beats4.mp3', sound: 'root', visual: 'ambient' },
    { bundle: 'interference', track: 'dead-wave-prime1.mp3', sound: 'vine', visual: 'glyphCorruptedBroadcast' },
    { bundle: 'jammer', track: 'ghost-sonic-shadow.mp3', sound: 'mycelium', visual: 'glyphParticleNebula' },
    { bundle: 'uplink', track: 'dust-data-loops.mp3', sound: 'mutation', visual: 'chaotic' },
  ],
} as const;
