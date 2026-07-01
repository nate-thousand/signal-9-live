/**
 * `logo-themes-1_PN.mp3` — title/startup loop and Broadcast carrier alias.
 * Carrier preset MP3s map to files currently in `public/assets/audio/`.
 */

/** Preset bundle id → public MP3 path */
export const SIGNAL_9_PRESET_TRACKS = {
  broadcast: '/assets/audio/logo-themes-1_PN.mp3',
  interference: '/assets/audio/dust-data-loops.mp3',
  jammer: '/assets/audio/dust-data-loops.mp3',
  uplink: '/assets/audio/dust-data-loops.mp3',
} as const;

export type Signal9PresetTrackId = keyof typeof SIGNAL_9_PRESET_TRACKS;

/** Presets exposed in the radio TRACK selector (unique local files only). */
export const SIGNAL_9_DECK_PRESET_IDS: Signal9PresetTrackId[] = ['broadcast', 'uplink'];

export const SIGNAL_9_PRESET_TRACK_LIST: {
  id: Signal9PresetTrackId;
  label: string;
  track: string;
}[] = [
  { id: 'broadcast', label: 'Broadcast', track: 'Logo Themes' },
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
 * carrier presets.
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
];

export function isAmbientTrackId(id: string): id is Signal9AmbientTrack['id'] {
  return id.startsWith('ambient-');
}

export function getAmbientTrack(id: string): Signal9AmbientTrack | undefined {
  return SIGNAL_9_AMBIENT_TRACKS.find((track) => track.id === id);
}

/** Single flat deck entry — union of carrier presets and ambient tapes. */
export interface Signal9DeckTrack {
  id: Signal9PresetTrackId | Signal9AmbientTrack['id'];
  label: string;
  track: string;
  src: string;
  kind: 'preset' | 'ambient';
}

/** Carrier + ambient entries for the radio deck TRACK control. */
export const SIGNAL_9_DECK_TRACKS: Signal9DeckTrack[] = [
  ...SIGNAL_9_DECK_PRESET_IDS.map((id) => {
    const track = SIGNAL_9_PRESET_TRACK_LIST.find((entry) => entry.id === id)!;
    return {
      id,
      label: track.label,
      track: track.track,
      src: SIGNAL_9_PRESET_TRACKS[id],
      kind: 'preset' as const,
    };
  }),
  ...SIGNAL_9_AMBIENT_TRACKS.map((track) => ({
    id: track.id,
    label: track.label,
    track: track.track,
    src: track.src,
    kind: 'ambient' as const,
  })),
];
