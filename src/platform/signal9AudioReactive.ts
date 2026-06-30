import type { AudioReactiveBridge } from '@plantasonic/platform-types';

import {
  boostBridgeSensitivity,
  boostMappingAmount,
} from '../config/audioReactiveConfig.js';

let audioReactiveBridge: AudioReactiveBridge | null = null;

export function registerSignal9AudioReactiveBridge(bridge: AudioReactiveBridge): void {
  audioReactiveBridge = bridge;
}

export function getSignal9AudioReactiveBridge(): AudioReactiveBridge | null {
  return audioReactiveBridge;
}

/** Push bridge sensitivity + mapping amounts into the 10%–100% reactive range. */
export function applySignal9AudioReactiveBoost(bridge?: AudioReactiveBridge | null): void {
  const target = bridge ?? audioReactiveBridge;
  if (!target) return;

  const status = target.getStatus();
  target.updateMapping({
    enabled: status.enabled,
    smoothing: status.smoothing,
    sensitivity: boostBridgeSensitivity(status.sensitivity),
    mappings: status.mappings.map((mapping) => ({
      ...mapping,
      amount: boostMappingAmount(mapping.amount),
    })),
  });
}
