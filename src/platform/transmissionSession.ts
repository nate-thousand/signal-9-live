import type { VisualEngineAdapter } from '@plantasonic/platform-types';

interface TransmissionTransportHandlers {
  onPlay: () => Promise<void>;
  onStop: () => Promise<void>;
}

let transportHandlers: TransmissionTransportHandlers | null = null;
let visualAdapter: VisualEngineAdapter | null = null;

export function registerTransmissionSession(
  visual: VisualEngineAdapter,
  handlers: TransmissionTransportHandlers,
): void {
  visualAdapter = visual;
  transportHandlers = handlers;
}

/** Start ASCII visual loop (no audio). Safe to call before user gesture. */
export async function startVisualLoop(): Promise<void> {
  if (!visualAdapter) return;
  const status = visualAdapter.getStatus();
  if (status.playing) return;
  await visualAdapter.start();
}

/** Start MP3 + visual engine + audio-reactive bridge + platform lifecycle. */
export async function startTransmissionSession(): Promise<void> {
  await transportHandlers?.onPlay();
}

/** Stop all engines and bridge. */
export async function stopTransmissionSession(): Promise<void> {
  await transportHandlers?.onStop();
}
