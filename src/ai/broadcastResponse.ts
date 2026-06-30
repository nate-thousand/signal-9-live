import type { Signal9PresetTrackId } from '../audio/transmissionTracks.js';

/** Structured AI broadcast response — drives the entire terminal interface */
export interface AiBroadcastResponse {
  narration: string;
  location: string;
  mission: string;
  mood: string;
  track: Signal9PresetTrackId | 'blackout' | '';
  visualPreset: string;
  asciiPreset: string;
  backgroundVideo: string;
  backgroundImage: string;
  unlockLore: Array<{
    id: string;
    title: string;
    body: string;
    category?: 'transmission' | 'document' | 'archive' | 'faction' | 'location' | 'mission';
  }>;
  discoverCharacters: Array<{
    id: string;
    callsign: string;
    role: string;
    summary: string;
    faction?: string;
  }>;
  choices: string[];
  systemMessage?: string;
}

export interface BroadcastChatRequest {
  message: string;
  choice?: string;
  gameState: {
    currentLocation: string;
    currentMission: string;
    currentTrack: string;
    currentMood: string;
    unlockedLoreIds: string[];
    discoveredCharacterIds: string[];
    recentHistory: Array<{ role: string; text: string }>;
  };
}

export const AI_BROADCAST_RESPONSE_SCHEMA = {
  name: 'signal9_broadcast_response',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: [
      'narration',
      'location',
      'mission',
      'mood',
      'track',
      'visualPreset',
      'asciiPreset',
      'backgroundVideo',
      'backgroundImage',
      'unlockLore',
      'discoverCharacters',
      'choices',
    ],
    properties: {
      narration: { type: 'string' },
      location: { type: 'string' },
      mission: { type: 'string' },
      mood: { type: 'string' },
      track: {
        type: 'string',
        enum: ['broadcast', 'interference', 'jammer', 'uplink', 'blackout', ''],
      },
      visualPreset: { type: 'string' },
      asciiPreset: { type: 'string' },
      backgroundVideo: { type: 'string' },
      backgroundImage: { type: 'string' },
      unlockLore: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['id', 'title', 'body'],
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            body: { type: 'string' },
            category: {
              type: 'string',
              enum: ['transmission', 'document', 'archive', 'faction', 'location', 'mission'],
            },
          },
        },
      },
      discoverCharacters: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['id', 'callsign', 'role', 'summary'],
          properties: {
            id: { type: 'string' },
            callsign: { type: 'string' },
            role: { type: 'string' },
            summary: { type: 'string' },
            faction: { type: 'string' },
          },
        },
      },
      choices: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 3,
      },
      systemMessage: { type: 'string' },
    },
  },
} as const;

const VALID_TRACKS = new Set(['broadcast', 'interference', 'jammer', 'uplink', 'blackout', '']);

export function normalizeAiBroadcastResponse(raw: unknown): AiBroadcastResponse {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Partial<AiBroadcastResponse>;
  const track = typeof data.track === 'string' && VALID_TRACKS.has(data.track) ? data.track : '';

  return {
    narration: typeof data.narration === 'string' ? data.narration : '...static...',
    location: typeof data.location === 'string' ? data.location : '',
    mission: typeof data.mission === 'string' ? data.mission : '',
    mood: typeof data.mood === 'string' ? data.mood : '',
    track,
    visualPreset: typeof data.visualPreset === 'string' ? data.visualPreset : '',
    asciiPreset: typeof data.asciiPreset === 'string' ? data.asciiPreset : '',
    backgroundVideo: typeof data.backgroundVideo === 'string' ? data.backgroundVideo : '',
    backgroundImage: typeof data.backgroundImage === 'string' ? data.backgroundImage : '',
    unlockLore: Array.isArray(data.unlockLore)
      ? data.unlockLore.filter(
          (e): e is AiBroadcastResponse['unlockLore'][number] =>
            !!e && typeof e === 'object' && 'id' in e && 'title' in e && 'body' in e,
        )
      : [],
    discoverCharacters: Array.isArray(data.discoverCharacters)
      ? data.discoverCharacters.filter(
          (c): c is AiBroadcastResponse['discoverCharacters'][number] =>
            !!c && typeof c === 'object' && 'id' in c && 'callsign' in c,
        )
      : [],
    choices:
      Array.isArray(data.choices) && data.choices.length > 0
        ? data.choices.slice(0, 3).map(String)
        : ['Continue transmission', 'Scan frequencies', 'Review archive'],
    systemMessage: typeof data.systemMessage === 'string' ? data.systemMessage : undefined,
  };
}
