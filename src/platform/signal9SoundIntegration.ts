import type { PlatformApplication } from '@plantasonic/platform';
import type { SoundEngineAdapter } from '@plantasonic/platform-types';

import {
  createMp3SoundEngineAdapter,
  type Signal9Mp3SoundAdapter,
} from './mp3SoundEngineAdapter.js';

export {
  bindEngineTransport,
  createEngineTransportHandlers,
  renderParameterPanel,
  setEngineControlsEnabled,
  wireEngineDemo,
} from '@plantasonic/platform-demo/soundIntegration';

let mp3SoundAdapter: Signal9Mp3SoundAdapter | null = null;

export function getSignal9Mp3Adapter(): Signal9Mp3SoundAdapter | null {
  return mp3SoundAdapter;
}

/** Signal 9 uses MP3 transmission audio for the Audio Reactive Bridge — not the synth. */
export async function createDemoSoundAdapter(
  app: PlatformApplication,
): Promise<SoundEngineAdapter> {
  mp3SoundAdapter = createMp3SoundEngineAdapter({ eventBus: app.eventBus });
  await mp3SoundAdapter.init();
  return mp3SoundAdapter;
}
