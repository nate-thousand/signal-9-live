/** Preset bundle id → public MP3 path */
export const SIGNAL_9_PRESET_TRACKS = {
  broadcast: '/assets/audio/atmo-beats4.mp3',
  interference: '/assets/audio/dead-wave-prime1.mp3',
  jammer: '/assets/audio/ghost-sonic-shadow.mp3',
  uplink: '/assets/audio/dust-data-loops.mp3',
} as const;

export type Signal9PresetTrackId = keyof typeof SIGNAL_9_PRESET_TRACKS;

export const SIGNAL_9_PRESET_TRACK_LIST: {
  id: Signal9PresetTrackId;
  label: string;
  track: string;
}[] = [
  { id: 'broadcast', label: 'Broadcast', track: 'Atmo Beats' },
  { id: 'interference', label: 'Interference', track: 'Dead Wave' },
  { id: 'jammer', label: 'Jammer', track: 'Ghost Shadow' },
  { id: 'uplink', label: 'Uplink', track: 'Dust & Data' },
];

/** Startup / title sequence uses the broadcast carrier track */
export const SIGNAL_9_TRANSMISSION_AUDIO_PATH = SIGNAL_9_PRESET_TRACKS.broadcast;

export function resolvePresetTrack(bundleId: string): string | undefined {
  if (bundleId in SIGNAL_9_PRESET_TRACKS) {
    return SIGNAL_9_PRESET_TRACKS[bundleId as Signal9PresetTrackId];
  }
  return undefined;
}
