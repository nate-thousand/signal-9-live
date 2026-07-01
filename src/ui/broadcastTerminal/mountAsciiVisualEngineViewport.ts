import { getSignal9VisualAdapter } from '../../platform/signal9VisualIntegration.js';
import {
  applyAsciiVisualAudioReactive,
  resetAsciiVisualAudioReactive,
} from '../../platform/applyAsciiVisualAudioReactive.js';
import {
  isDedicatedVisualLocked,
  registerAmbientVisualChannel,
  startAmbientVisualRotation,
} from '../../platform/ambientVisualChannelRegistry.js';
import { getActiveTransmission } from '../../platform/activeTransmission.js';
import { getAudioReactiveState } from '../../platform/audioReactiveState.js';
import { isBroadcastAudioActive } from '../../platform/broadcastAudioAnalysis.js';
import { createSignal9VisualEnginePlaylistChannel } from '../../platform/signal9VisualEngineChannel.js';
import type { Signal9VisualEngineChannel } from '../../platform/signal9VisualEngineChannel.js';
import { listLocalVideoSources } from '../../platform/localVideoSourceMode.js';

const STANDBY_LINES = [
  '╔══════════════════════════════╗',
  '║   STANDBY TRANSMISSION       ║',
  '║   NO VIDEO FEED DETECTED     ║',
  '║   AWAITING LOCAL ASSETS      ║',
  '╚══════════════════════════════╝',
];

async function waitForVisualAdapter(timeoutMs = 30_000): Promise<ReturnType<typeof getSignal9VisualAdapter>> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const visual = getSignal9VisualAdapter();
    if (visual?.isReady) return visual;
    await new Promise((resolve) => window.setTimeout(resolve, 100));
  }
  return getSignal9VisualAdapter();
}

function findStageCanvas(): HTMLCanvasElement | null {
  return document.querySelector<HTMLCanvasElement>(
    '[data-s9-instrument-layer] .ps-stage__canvas, [data-s9-instrument-layer] [data-ps-canvas-mount] canvas',
  );
}

function attachCanvasToViewport(viewport: HTMLElement): HTMLCanvasElement | null {
  const canvas = findStageCanvas();
  if (!canvas) return null;
  viewport.replaceChildren(canvas);
  return canvas;
}

function applyViewportSize(
  viewport: HTMLElement,
  visual: NonNullable<ReturnType<typeof getSignal9VisualAdapter>>,
): void {
  const rect = viewport.getBoundingClientRect();
  visual.resize(Math.max(1, rect.width), Math.max(1, rect.height));
}

function setStandbyVisible(root: HTMLElement, visible: boolean): void {
  const standby = root.querySelector<HTMLElement>('[data-s9-visual-standby]');
  const viewport = root.querySelector<HTMLElement>('[data-s9-visual-viewport]');
  if (standby) standby.hidden = !visible;
  if (viewport) viewport.hidden = visible;
}

function verifyVideoSourceReady(
  visual: NonNullable<ReturnType<typeof getSignal9VisualAdapter>>,
  root: HTMLElement,
): boolean {
  const status = visual.getVideoStatus();
  if (status.ready && !status.error) {
    setStandbyVisible(root, false);
    return true;
  }
  if (status.error) {
    console.warn('[signal-9] video source error:', status.error);
  }
  setStandbyVisible(root, true);
  return false;
}

/**
 * Mount the platform ASCII canvas into the ASCII Visual Engine viewport and drive
 * ambient playback through the Plantasonic Visual Engine VideoSource pipeline.
 */
export function mountAsciiVisualEngineViewport(root: HTMLElement): () => void {
  let disposed = false;
  let resizeObserver: ResizeObserver | null = null;
  let channel: Signal9VisualEngineChannel | null = null;
  let audioReactiveFrame: number | null = null;

  const viewport = root.querySelector<HTMLElement>('[data-s9-visual-viewport]');
  if (!viewport) {
    return () => {};
  }

  const runAudioReactiveLoop = (visual: NonNullable<ReturnType<typeof getSignal9VisualAdapter>>): void => {
    if (disposed) return;
    if (document.visibilityState === 'visible' && visual.isReady) {
      applyAsciiVisualAudioReactive(visual, getAudioReactiveState());
    }
    const intervalMs = isBroadcastAudioActive() ? 16 : 50;
    audioReactiveFrame = window.setTimeout(() => runAudioReactiveLoop(visual), intervalMs);
  };

  void (async () => {
    const visual = await waitForVisualAdapter();
    if (disposed || !visual) {
      setStandbyVisible(root, true);
      return;
    }

    const localSources = await listLocalVideoSources();
    const playlist = localSources.map((source) => source.src);
    if (disposed) return;

    if (playlist.length === 0) {
      setStandbyVisible(root, true);
      return;
    }

    const canvas = attachCanvasToViewport(viewport);
    if (!canvas) {
      setStandbyVisible(root, true);
      return;
    }

    applyViewportSize(viewport, visual);
    resizeObserver = new ResizeObserver(() => {
      if (disposed) return;
      applyViewportSize(viewport, visual);
    });
    resizeObserver.observe(viewport);

    channel = createSignal9VisualEnginePlaylistChannel(visual, playlist, (src) => {
      if (src) verifyVideoSourceReady(visual, root);
    });
    registerAmbientVisualChannel(channel);

    if (!isDedicatedVisualLocked() && getActiveTransmission().kind === 'none') {
      startAmbientVisualRotation();
    }
    verifyVideoSourceReady(visual, root);

    runAudioReactiveLoop(visual);

    if (disposed) {
      channel?.stop();
    }
  })();

  return () => {
    disposed = true;
    if (audioReactiveFrame !== null) {
      window.clearTimeout(audioReactiveFrame);
      audioReactiveFrame = null;
    }
    resetAsciiVisualAudioReactive();
    channel?.stop();
    registerAmbientVisualChannel({ start: async () => {}, stop: () => {} });
    resizeObserver?.disconnect();
    resizeObserver = null;
  };
}

export function renderAsciiVisualStandby(): string {
  return STANDBY_LINES.join('\n');
}
