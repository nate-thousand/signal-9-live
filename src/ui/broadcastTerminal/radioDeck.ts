import {
  SIGNAL_9_DECK_TRACKS,
  type Signal9AmbientTrack,
  type Signal9DeckTrack,
  type Signal9PresetTrackId,
} from '../../audio/transmissionTracks.js';
import {
  getMixtapeDeckTrackId,
  getMixtapePresetByAudioSrc,
  SIGNAL_9_MIXTAPE_PRESETS,
} from '../../config/mixtapePresets.js';

export type RadioDeckTrackKind = Signal9DeckTrack['kind'] | 'mixtape';

export interface RadioDeckTrack {
  id: string;
  label: string;
  track: string;
  src: string;
  kind: RadioDeckTrackKind;
  /** Config id when kind === 'mixtape' */
  mixtapeId?: string;
}

const EXCLUDED_FILENAMES = new Set([
  'startup.mp3',
  'logo-themes-1_PN.mp3',
  'dust-data-loops.mp3',
  'dj-null-memory-eraser.mp3',
]);

function filenameFromUrl(url: string): string {
  return decodeURIComponent(url.split('/').pop() ?? '');
}

function titleFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '');
  return base.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '');
  return base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'track';
}

let discoveredMixtapes: RadioDeckTrack[] = [];

function mixtapePresetToDeckTrack(preset: (typeof SIGNAL_9_MIXTAPE_PRESETS)[number]): RadioDeckTrack {
  return {
    id: getMixtapeDeckTrackId(preset.id),
    label: preset.title,
    track: `${preset.artist} — ${preset.title}`,
    src: preset.audioSrc,
    kind: 'mixtape',
    mixtapeId: preset.id,
  };
}

export function setDiscoveredMixtapes(urls: string[]): void {
  const configuredSrc = new Set(SIGNAL_9_MIXTAPE_PRESETS.map((preset) => preset.audioSrc));
  const knownSrc = new Set([
    ...SIGNAL_9_DECK_TRACKS.map((track) => track.src),
    ...configuredSrc,
  ]);

  discoveredMixtapes = [
    ...SIGNAL_9_MIXTAPE_PRESETS.map(mixtapePresetToDeckTrack),
    ...urls
      .filter((url) => {
        const filename = filenameFromUrl(url);
        return (
          filename.length > 0 &&
          !EXCLUDED_FILENAMES.has(filename) &&
          !knownSrc.has(url) &&
          !getMixtapePresetByAudioSrc(url)
        );
      })
      .map((url) => {
        const filename = filenameFromUrl(url);
        return {
          id: `mixtape-${slugFromFilename(filename)}`,
          label: 'Mixtape',
          track: titleFromFilename(filename),
          src: url,
          kind: 'mixtape' as const,
        };
      }),
  ];
}

export function getRadioDeckTracks(): RadioDeckTrack[] {
  const carriers = SIGNAL_9_DECK_TRACKS.map((track) => ({
    id: track.id,
    label: track.label,
    track: track.track,
    src: track.src,
    kind: track.kind,
  }));

  return [...discoveredMixtapes, ...carriers];
}

export function isMixtapeTrackId(id: string): boolean {
  return id.startsWith('mixtape-');
}

export function isDeckTrackId(id: string): id is Signal9PresetTrackId | Signal9AmbientTrack['id'] | `mixtape-${string}` {
  return getRadioDeckTracks().some((track) => track.id === id);
}
