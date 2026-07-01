import type { Signal9VisualEngineChannel } from './signal9VisualEngineChannel.js';

let ambientChannel: Signal9VisualEngineChannel | null = null;
let dedicatedVisualLock = false;

export function registerAmbientVisualChannel(channel: Signal9VisualEngineChannel): void {
  ambientChannel = channel;
}

export function suspendAmbientVisualChannel(): void {
  ambientChannel?.stop();
}

/** Start random ambient video rotation — only when idle with no track-selected visual. */
export function startAmbientVisualRotation(): void {
  if (!dedicatedVisualLock) {
    void ambientChannel?.start();
  }
}

export function setDedicatedVisualLock(locked: boolean): void {
  dedicatedVisualLock = locked;
  if (locked) {
    ambientChannel?.stop();
  }
}

export function isDedicatedVisualLocked(): boolean {
  return dedicatedVisualLock;
}

/** Release track visual ownership and resume idle ambient rotation. */
export function enterIdleVisualState(): void {
  setDedicatedVisualLock(false);
  startAmbientVisualRotation();
}

/** @deprecated Use setDedicatedVisualLock */
export const setMixtapeVisualLock = setDedicatedVisualLock;

/** @deprecated Use isDedicatedVisualLocked */
export const isMixtapeVisualLocked = isDedicatedVisualLocked;

/** @deprecated Use startAmbientVisualRotation */
export function resumeAmbientVisualChannel(): void {
  startAmbientVisualRotation();
}
