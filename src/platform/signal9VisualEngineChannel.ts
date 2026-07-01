import type { VisualEngineAdapter } from '@plantasonic/platform-types';

import {
  activateLocalVideoSourceMode,
  startVisualEngineVideoPlayback,
} from './videoAsciiSession.js';

/** Future feeds (webcam, OBS) resolve through this contract. */
export interface VisualEnginePlaylistSource {
  resolveNext(excludeSrc?: string): Promise<string | null>;
}

export class LocalVisualEnginePlaylistSource implements VisualEnginePlaylistSource {
  constructor(private readonly playlist: string[]) {}

  async resolveNext(excludeSrc?: string): Promise<string | null> {
    if (this.playlist.length === 0) return null;
    if (this.playlist.length === 1) return this.playlist[0] ?? null;

    let candidate = this.playlist[0] ?? null;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const index = Math.floor(Math.random() * this.playlist.length);
      candidate = this.playlist[index] ?? null;
      if (candidate && candidate !== excludeSrc) return candidate;
    }
    return candidate;
  }
}

export interface Signal9VisualEngineChannelOptions {
  visual: VisualEngineAdapter;
  source: VisualEnginePlaylistSource;
  onFeedChange?: (src: string | null) => void;
}

export interface Signal9VisualEngineChannel {
  start(): Promise<void>;
  stop(): void;
}

const PLAYBACK_POLL_MS = 400;

/**
 * Ambient playlist channel — a themed consumer of the Plantasonic Visual Engine.
 *
 * Pipeline: local asset URL → VisualEngine VideoSource → frame processing → Signal 9 ASCII.
 */
export function createSignal9VisualEngineChannel(
  options: Signal9VisualEngineChannelOptions,
): Signal9VisualEngineChannel {
  const { visual, source, onFeedChange } = options;
  let disposed = false;
  let advancing = false;
  let lastSrc: string | null = null;
  let sawPlayback = false;
  let pollTimer: number | null = null;

  const stopPlaybackMonitor = (): void => {
    if (pollTimer !== null) {
      window.clearInterval(pollTimer);
      pollTimer = null;
    }
    sawPlayback = false;
  };

  const onEnginePlaybackEnded = (): void => {
    if (disposed) return;
    stopPlaybackMonitor();
    void playNext();
  };

  const startPlaybackMonitor = (): void => {
    stopPlaybackMonitor();
    pollTimer = window.setInterval(() => {
      if (disposed) return;

      const status = visual.getVideoStatus();
      if (!status.ready || status.error) return;

      if (status.playing) {
        sawPlayback = true;
        return;
      }

      if (sawPlayback) {
        onEnginePlaybackEnded();
      }
    }, PLAYBACK_POLL_MS);
  };

  const tryPlaySrc = async (src: string): Promise<boolean> => {
    const loaded = await activateLocalVideoSourceMode(src, {
      loop: false,
      muted: true,
      autoplay: true,
      fitMode: 'fill',
    });

    if (!loaded || disposed) return false;

    await startVisualEngineVideoPlayback();
    if (disposed) return false;

    startPlaybackMonitor();
    onFeedChange?.(src);
    return true;
  };

  const playNext = async (): Promise<void> => {
    if (disposed || advancing) return;
    advancing = true;
    try {
      for (let attempt = 0; attempt < 4; attempt += 1) {
        const src = await source.resolveNext(lastSrc ?? undefined);
        if (!src || disposed) {
          onFeedChange?.(null);
          return;
        }
        lastSrc = src;
        if (await tryPlaySrc(src)) return;
      }
      onFeedChange?.(null);
    } finally {
      advancing = false;
    }
  };

  return {
    async start(): Promise<void> {
      if (disposed) return;
      await playNext();
    },
    stop(): void {
      disposed = true;
      stopPlaybackMonitor();
      void visual.pauseVideo();
      onFeedChange?.(null);
    },
  };
}

export function createSignal9VisualEnginePlaylistChannel(
  visual: VisualEngineAdapter,
  playlist: string[],
  onFeedChange?: (src: string | null) => void,
): Signal9VisualEngineChannel {
  return createSignal9VisualEngineChannel({
    visual,
    source: new LocalVisualEnginePlaylistSource(playlist),
    onFeedChange,
  });
}
