import { SIGNAL_9_STARTER_BUNDLE } from '../content/presetBundles.js';
import { mountControlMenu } from '../ui/ControlMenu.js';
import { mountTransmissionControls } from '../ui/TransmissionControls.js';
import { mountVideoTransmissionControls } from '../ui/VideoTransmissionControls.js';

import { applySignal9Preset, updateTransmissionPresetUi } from './applySignal9Preset.js';
import {
  startTransmissionSession,
  startVisualLoop,
  stopTransmissionSession,
} from './transmissionSession.js';
import { playVideoTransmission } from './videoAsciiSession.js';
import { mountTransmissionDebugOverlay } from './transmissionDebugOverlay.js';

const STARTER_BUNDLE_ID = SIGNAL_9_STARTER_BUNDLE.id as 'broadcast';

function refreshStageLayout(root: ParentNode): void {
  window.dispatchEvent(new Event('resize'));
  const stage = root.querySelector<HTMLElement>('[data-ps-region="stage"]');
  if (!stage) return;
  stage.dispatchEvent(new Event('transitionend'));
}

export async function bootstrapInstrumentVisuals(instrumentRoot: HTMLElement): Promise<void> {
  const menuPanels = mountControlMenu(instrumentRoot);
  mountVideoTransmissionControls(menuPanels);
  const bar = mountTransmissionControls(menuPanels);
  mountTransmissionDebugOverlay(instrumentRoot);

  await applySignal9Preset(instrumentRoot, STARTER_BUNDLE_ID);

  const presets = bar.querySelector('.s9-transmission-bar__presets');
  if (presets) {
    updateTransmissionPresetUi(presets, STARTER_BUNDLE_ID);
  }

  refreshStageLayout(instrumentRoot);

  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });

  await startVisualLoop();
  await playVideoTransmission();

  window.addEventListener('resize', () => refreshStageLayout(instrumentRoot));
}

let transmissionArmed = false;

export function startInstrumentTransmission(): void {
  void startTransmissionSession().then(() => playVideoTransmission());
}

export function stopInstrumentTransmission(): void {
  void stopTransmissionSession();
}

export function armTransmissionOnGesture(): void {
  if (transmissionArmed) return;
  transmissionArmed = true;

  const unlock = (): void => {
    startInstrumentTransmission();
    document.removeEventListener('pointerdown', unlock, true);
    document.removeEventListener('keydown', unlock, true);
  };

  document.addEventListener('pointerdown', unlock, true);
  document.addEventListener('keydown', unlock, true);
}

export async function bootstrapInstrumentSession(instrumentRoot: HTMLElement): Promise<void> {
  await bootstrapInstrumentVisuals(instrumentRoot);
  armTransmissionOnGesture();
}
