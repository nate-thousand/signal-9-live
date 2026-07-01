import { SIGNAL_9_VIDEO_BROADCAST } from '../content/videoVisualPresets.js';
import type { Signal9VideoAsciiProfile } from '../content/videoVisualPresets.js';

let activeBaseProfile: Signal9VideoAsciiProfile = { ...SIGNAL_9_VIDEO_BROADCAST };

/** Baseline ASCII profile for audio-reactive modulation (mixtape or carrier preset). */
export function setActiveVisualBaseProfile(profile: Signal9VideoAsciiProfile): void {
  activeBaseProfile = profile;
}

export function getActiveVisualBaseProfile(): Signal9VideoAsciiProfile {
  return activeBaseProfile;
}

export function resetActiveVisualBaseProfile(): void {
  activeBaseProfile = { ...SIGNAL_9_VIDEO_BROADCAST };
}
