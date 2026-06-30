import { SIGNAL_9_PRESET_TRACK_LIST } from '../audio/transmissionTracks.js';
import { SIGNAL_9_VIDEO_SOURCES } from '../config/videoSources.js';
import { SIGNAL_9_PRESET_BUNDLES } from '../content/presetBundles.js';

/** Shared manifest asset fields */
export interface ManifestAssetBase {
  id: string;
  title: string;
  description: string;
  tags: string[];
  mood: string;
  location: string;
  faction: string;
  mission: string;
  relatedAssets: string[];
  filePath?: string;
}

export interface SongAsset extends ManifestAssetBase {
  kind: 'song';
  presetId: string;
  bpm?: number;
}

export interface VideoAsset extends ManifestAssetBase {
  kind: 'video';
  defaultPreset: string;
  loop: boolean;
}

export interface ImageAsset extends ManifestAssetBase {
  kind: 'image';
}

export interface CharacterAsset extends ManifestAssetBase {
  kind: 'character';
  callsign: string;
  role: string;
}

export interface LocationAsset extends ManifestAssetBase {
  kind: 'location';
  sector: string;
}

export interface LoreAsset extends ManifestAssetBase {
  kind: 'lore';
  category: 'transmission' | 'document' | 'archive' | 'faction' | 'location' | 'mission';
  body: string;
}

export type ManifestAsset =
  | SongAsset
  | VideoAsset
  | ImageAsset
  | CharacterAsset
  | LocationAsset
  | LoreAsset;

export interface Signal9AssetManifest {
  songs: SongAsset[];
  videos: VideoAsset[];
  images: ImageAsset[];
  characters: CharacterAsset[];
  locations: LocationAsset[];
  lore: LoreAsset[];
}

const MOOD_BY_PRESET: Record<string, string> = {
  broadcast: 'steady',
  interference: 'volatile',
  jammer: 'aggressive',
  uplink: 'focused',
  blackout: 'void',
};

function songAssets(): SongAsset[] {
  return SIGNAL_9_PRESET_TRACK_LIST.map((entry) => {
    const bundle = SIGNAL_9_PRESET_BUNDLES.find((b) => b.id === entry.id);
    return {
      kind: 'song',
      id: entry.id,
      title: entry.label,
      description: bundle?.description ?? `${entry.track} transmission carrier`,
      tags: bundle?.tags ?? ['signal-9', 'audio'],
      mood: MOOD_BY_PRESET[entry.id] ?? 'neutral',
      location: 'Sector 9',
      faction: 'Signal 9',
      mission: 'broadcast',
      relatedAssets: [`video-${entry.id === 'broadcast' ? 'broadcast-feed' : entry.id}`],
      filePath: entry.track,
      presetId: entry.id,
      bpm: bundle?.ui?.tempo,
    };
  });
}

function videoAssets(): VideoAsset[] {
  return SIGNAL_9_VIDEO_SOURCES.map((source) => ({
    kind: 'video',
    id: source.id,
    title: source.title,
    description: source.description,
    tags: ['signal-9', 'video', 'ascii'],
    mood: MOOD_BY_PRESET[source.defaultPreset] ?? 'neutral',
    location: 'Relay Grid',
    faction: 'Signal 9',
    mission: source.defaultPreset,
    relatedAssets: [source.defaultPreset],
    filePath: source.src,
    defaultPreset: source.defaultPreset,
    loop: source.loop,
  }));
}

const PLACEHOLDER_IMAGES: ImageAsset[] = [
  {
    kind: 'image',
    id: 'img-relay-tower',
    title: 'Relay Tower 9',
    description: 'Crushed violet skyline — Sector 9 uplink array.',
    tags: ['signal-9', 'location', 'sector-9'],
    mood: 'ominous',
    location: 'Sector 9',
    faction: 'Signal 9',
    mission: 'establish-uplink',
    relatedAssets: ['loc-sector-9', 'broadcast'],
    filePath: '/assets/images/relay-tower-9.svg',
  },
  {
    kind: 'image',
    id: 'img-static-field',
    title: 'Static Field',
    description: 'Interference bloom across the dead grid.',
    tags: ['interference', 'static'],
    mood: 'volatile',
    location: 'Dead Grid',
    faction: 'Unknown',
    mission: 'grid-breach',
    relatedAssets: ['interference', 'interference-static'],
    filePath: '/assets/images/static-field.svg',
  },
];

const CHARACTER_ASSETS: CharacterAsset[] = [
  {
    kind: 'character',
    id: 'char-operator',
    title: 'Operator',
    callsign: 'OP-9',
    role: 'Field relay technician',
    description: 'You — the last open channel on the resistance grid.',
    tags: ['player', 'operator'],
    mood: 'determined',
    location: 'Sector 9',
    faction: 'Signal 9',
    mission: 'establish-uplink',
    relatedAssets: ['lore-welcome'],
  },
  {
    kind: 'character',
    id: 'char-ghost',
    title: 'Ghost',
    callsign: 'GH0ST',
    role: 'Signal 9 network AI',
    description: 'The voice in the static — narrator, mission generator, lore keeper.',
    tags: ['ai', 'narrator'],
    mood: 'cryptic',
    location: 'Network Core',
    faction: 'Signal 9',
    mission: 'all',
    relatedAssets: ['lore-welcome', 'broadcast'],
  },
  {
    kind: 'character',
    id: 'char-jammer',
    title: 'Jammer Prime',
    callsign: 'JAM-R',
    role: 'Hostile signal hunter',
    description: 'Tracks open frequencies across the blackout corridors.',
    tags: ['antagonist', 'jammer'],
    mood: 'hostile',
    location: 'Jammer Corridor',
    faction: 'Corp Static',
    mission: 'grid-breach',
    relatedAssets: ['jammer', 'jammer-pulse'],
  },
];

const LOCATION_ASSETS: LocationAsset[] = [
  {
    kind: 'location',
    id: 'loc-sector-9',
    title: 'Sector 9 Relay',
    sector: '9',
    description: 'Primary resistance broadcast node — violet CRT hum, low traffic.',
    tags: ['hub', 'relay'],
    mood: 'tense',
    location: 'Sector 9',
    faction: 'Signal 9',
    mission: 'establish-uplink',
    relatedAssets: ['broadcast', 'broadcast-feed'],
  },
  {
    kind: 'location',
    id: 'loc-dead-grid',
    title: 'Dead Grid',
    sector: '—',
    description: 'Collapsed network sector — interference storms and ghost data.',
    tags: ['danger', 'interference'],
    mood: 'volatile',
    location: 'Dead Grid',
    faction: 'Unknown',
    mission: 'grid-breach',
    relatedAssets: ['interference', 'interference-static'],
  },
  {
    kind: 'location',
    id: 'loc-jammer-corridor',
    title: 'Jammer Corridor',
    sector: '4',
    description: 'Fuchsia feedback bursts — hostile tracking arrays.',
    tags: ['danger', 'jammer'],
    mood: 'aggressive',
    location: 'Jammer Corridor',
    faction: 'Corp Static',
    mission: 'extraction',
    relatedAssets: ['jammer', 'jammer-pulse'],
  },
];

const LORE_ASSETS: LoreAsset[] = [
  {
    kind: 'lore',
    id: 'lore-welcome',
    title: 'Operator Brief',
    category: 'transmission',
    body: 'Signal 9 is an underground resistance broadcast network. Use the terminal to navigate the grid.',
    description: 'Initial operator transmission.',
    tags: ['intro'],
    mood: 'neutral',
    location: 'Sector 9',
    faction: 'Signal 9',
    mission: 'establish-uplink',
    relatedAssets: ['char-ghost'],
  },
  {
    kind: 'lore',
    id: 'lore-blackout-protocol',
    title: 'Blackout Protocol',
    category: 'document',
    body: 'When visual carriers fail, switch to void-mode ASCII. Audio may be suppressed. Survive the silence.',
    description: 'Emergency broadcast doctrine.',
    tags: ['blackout', 'protocol'],
    mood: 'void',
    location: 'Network Core',
    faction: 'Signal 9',
    mission: 'blackout',
    relatedAssets: ['blackout', 'blackout-void'],
  },
  {
    kind: 'lore',
    id: 'lore-corp-static',
    title: 'Corp Static Manifest',
    category: 'faction',
    body: 'Corporate jammers hunt open frequencies. They leave fuchsia scars in the ASCII field.',
    description: 'Hostile faction intelligence.',
    tags: ['faction', 'jammer'],
    mood: 'hostile',
    location: 'Jammer Corridor',
    faction: 'Corp Static',
    mission: 'grid-breach',
    relatedAssets: ['char-jammer', 'jammer'],
  },
];

export const SIGNAL_9_ASSET_MANIFEST: Signal9AssetManifest = {
  songs: songAssets(),
  videos: videoAssets(),
  images: PLACEHOLDER_IMAGES,
  characters: CHARACTER_ASSETS,
  locations: LOCATION_ASSETS,
  lore: LORE_ASSETS,
};

export function getManifestAsset(id: string): ManifestAsset | undefined {
  const all = [
    ...SIGNAL_9_ASSET_MANIFEST.songs,
    ...SIGNAL_9_ASSET_MANIFEST.videos,
    ...SIGNAL_9_ASSET_MANIFEST.images,
    ...SIGNAL_9_ASSET_MANIFEST.characters,
    ...SIGNAL_9_ASSET_MANIFEST.locations,
    ...SIGNAL_9_ASSET_MANIFEST.lore,
  ];
  return all.find((asset) => asset.id === id);
}

export function manifestContextForAi(): string {
  const summarize = (items: ManifestAssetBase[]) =>
    items.map((a) => `${a.id}: ${a.title} (${a.mood}, ${a.location})`).join('\n');

  return [
    'SONGS:',
    summarize(SIGNAL_9_ASSET_MANIFEST.songs),
    'VIDEOS:',
    summarize(SIGNAL_9_ASSET_MANIFEST.videos),
    'LOCATIONS:',
    summarize(SIGNAL_9_ASSET_MANIFEST.locations),
    'CHARACTERS:',
    summarize(SIGNAL_9_ASSET_MANIFEST.characters),
    'LORE:',
    summarize(SIGNAL_9_ASSET_MANIFEST.lore),
  ].join('\n\n');
}
