import { resolveLocalVideoSources, type Signal9VideoSource } from '../config/videoSources.js';
import { discoverVideoAssets } from '../ui/broadcastTerminal/discoverVideoAssets.js';

import {
  activateLocalVideoSourceMode,
  applyVideoSourceAsciiProfile,
  type VisualEngineVideoLoadOptions,
} from './videoAsciiSession.js';

export type { VisualEngineVideoLoadOptions };

/** All video files from public/assets/video/ (discovered at dev/build time). */
export async function listLocalVideoSources(): Promise<Signal9VideoSource[]> {
  const urls = await discoverVideoAssets();
  return resolveLocalVideoSources(urls);
}

export {
  activateLocalVideoSourceMode,
  applyVideoSourceAsciiProfile,
};

export { getVideoSourceBySrc } from '../config/videoSources.js';
