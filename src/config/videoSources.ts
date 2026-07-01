import type { Signal9PresetTrackId } from '../audio/transmissionTracks.js';

export interface Signal9VideoSource {
  id: string;
  title: string;
  src: string;
  description: string;
  defaultPreset: Signal9PresetTrackId | 'blackout';
  loop: boolean;
  muted: boolean;
}

/** Local video loops in `public/assets/video/`. */
export const SIGNAL_9_VIDEO_SOURCES: Signal9VideoSource[] = [
  {
    id: 'blackout-void',
    title: 'Blackout Void',
    src: '/assets/video/blackout-void.mp4',
    description: 'Crushed void transmission — slate threshold mode.',
    defaultPreset: 'blackout',
    loop: true,
    muted: true,
  },
  {
    id: 'organic-vs-synthetic-2',
    title: 'Organic vs Synthetic II',
    src: '/assets/video/organic-vs-synthetic-2.mp4',
    description: 'Human imperfection defeating the optimization grid.',
    defaultPreset: 'broadcast',
    loop: true,
    muted: true,
  },
];

const PRESET_VIDEO_SOURCE_ID: Record<Signal9PresetTrackId | 'blackout', string> = {
  broadcast: 'organic-vs-synthetic-2',
  interference: 'blackout-void',
  jammer: 'blackout-void',
  uplink: 'organic-vs-synthetic-2',
  blackout: 'blackout-void',
};

export const SIGNAL_9_DEFAULT_VIDEO_SOURCE = SIGNAL_9_VIDEO_SOURCES[0]!;

export function normalizeVideoSrc(src: string): string {
  try {
    return decodeURIComponent(src);
  } catch {
    return src;
  }
}

export function getVideoSourceById(id: string): Signal9VideoSource | undefined {
  return SIGNAL_9_VIDEO_SOURCES.find((source) => source.id === id);
}

/** Resolve configured metadata for a local asset URL from public/assets/video/. */
export function getVideoSourceBySrc(src: string): Signal9VideoSource | undefined {
  const target = normalizeVideoSrc(src);
  return SIGNAL_9_VIDEO_SOURCES.find(
    (source) =>
      source.src === src ||
      normalizeVideoSrc(source.src) === target ||
      source.src.endsWith(target.split('/').pop() ?? ''),
  );
}

function titleFromVideoFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '');
  return base.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function slugFromVideoFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, '');
  return base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'video';
}

/**
 * Merge auto-discovered public/assets/video URLs with configured sources.
 * Unknown files still become valid ASCII source-mode entries (broadcast profile default).
 */
export function resolveLocalVideoSources(discoveredUrls: string[]): Signal9VideoSource[] {
  const bySrc = new Map<string, Signal9VideoSource>();
  for (const source of SIGNAL_9_VIDEO_SOURCES) {
    bySrc.set(normalizeVideoSrc(source.src), source);
  }
  for (const url of discoveredUrls) {
    const key = normalizeVideoSrc(url);
    if (bySrc.has(key)) continue;
    const filename = key.split('/').pop() ?? 'video.mp4';
    bySrc.set(key, {
      id: slugFromVideoFilename(filename),
      title: titleFromVideoFilename(filename),
      src: url,
      description: 'Local asset from public/assets/video/',
      defaultPreset: 'broadcast',
      loop: true,
      muted: true,
    });
  }
  return [...bySrc.values()].sort((a, b) => a.title.localeCompare(b.title));
}

export function getDefaultVideoForPreset(
  presetId: Signal9PresetTrackId | 'blackout',
): Signal9VideoSource | undefined {
  const sourceId = PRESET_VIDEO_SOURCE_ID[presetId];
  return getVideoSourceById(sourceId) ?? SIGNAL_9_DEFAULT_VIDEO_SOURCE;
}
