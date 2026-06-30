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

/**
 * Standalone ambient tracks — recovered tape fragments outside the four
 * carrier presets. Loaded directly through the MP3 adapter (no visual
 * preset, theme, or audio-reactive bridge change) so they can be auditioned
 * from the radio deck without altering preset/bundle architecture.
 */
export interface Signal9AmbientTrack {
  id: `ambient-${string}`;
  label: string;
  track: string;
  src: string;
}

export const SIGNAL_9_AMBIENT_TRACKS: Signal9AmbientTrack[] = [
  {
    id: 'ambient-memory-eraser',
    label: 'Memory Eraser',
    track: 'DJ Null — Sonic Nihilist',
    src: '/assets/audio/dj-null-memory-eraser.mp3',
  },
  {
    id: 'ambient-dub-moods',
    label: 'Dub Moods',
    track: 'Dub Moods',
    src: '/assets/audio/dub-moods.mp3',
  },
  {
    id: 'ambient-sound-sanctuaries',
    label: 'Sound Sanctuaries',
    track: 'Resistance Factions — Echo Nodes',
    src: '/assets/audio/sound-sanctuaries.mp3',
  },
  {
    id: 'ambient-blacksite-core',
    label: 'Blacksite AI Core',
    track: 'Enemy Monolith — Core Entity',
    src: '/assets/audio/blacksite-ai-core.mp3',
  },
];

export function isAmbientTrackId(id: string): id is Signal9AmbientTrack['id'] {
  return id.startsWith('ambient-');
}

export function getAmbientTrack(id: string): Signal9AmbientTrack | undefined {
  return SIGNAL_9_AMBIENT_TRACKS.find((track) => track.id === id);
}
