import { getSignal9Mp3Adapter } from './signal9SoundIntegration.js';
import type { Signal9AudioAnalysisSnapshot } from './mp3SoundEngineAdapter.js';

const IDLE: Signal9AudioAnalysisSnapshot = {
  amplitude: 0,
  bass: 0,
  mids: 0,
  highs: 0,
  transient: 0,
  timestamp: 0,
  peak: 0,
  rms: 0,
  signalStrength: 0,
  transmissionQuality: 0,
  frequencyBins: Array.from({ length: 32 }, () => 0),
  waveform: Array.from({ length: 64 }, () => 0),
  stereo: { left: 0, right: 0, balance: 0.5 },
};

/** Real MP3 analyzer output for HUD + ASCII visual reactivity. */
export function getBroadcastAudioAnalysis(): Signal9AudioAnalysisSnapshot {
  const adapter = getSignal9Mp3Adapter();
  if (!adapter) return { ...IDLE, timestamp: Date.now() };
  if (!adapter.getStatus().playing) return { ...IDLE, timestamp: Date.now() };
  return adapter.getAudioAnalysis();
}

export function isBroadcastAudioActive(): boolean {
  return getSignal9Mp3Adapter()?.getStatus().playing ?? false;
}
