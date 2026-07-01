import {
  getBroadcastAudioAnalysis,
  isBroadcastAudioActive,
} from './broadcastAudioAnalysis.js';
import { scaleAudioReactiveFeature } from '../config/audioReactiveConfig.js';

/** Normalized 0–1 bands for HUD + ASCII visual reactivity. */
export type AudioReactiveState = {
  bass: number;
  mid: number;
  treble: number;
  rms: number;
  peak: number;
  amplitude: number;
  transient: number;
  isPlaying: boolean;
};

/** Read current broadcast audio reactive bands from local MP3 playback. */
export function getAudioReactiveState(): AudioReactiveState {
  const analysis = getBroadcastAudioAnalysis();
  return {
    bass: scaleAudioReactiveFeature(analysis.bass),
    mid: scaleAudioReactiveFeature(analysis.mids),
    treble: scaleAudioReactiveFeature(analysis.highs),
    rms: scaleAudioReactiveFeature(analysis.rms),
    peak: scaleAudioReactiveFeature(analysis.peak),
    amplitude: scaleAudioReactiveFeature(analysis.amplitude),
    transient: scaleAudioReactiveFeature(analysis.transient),
    isPlaying: isBroadcastAudioActive(),
  };
}
