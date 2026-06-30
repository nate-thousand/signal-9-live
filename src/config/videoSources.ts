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

/** Pixel flower loops — files in public/assets/video/ */
export const SIGNAL_9_VIDEO_SOURCES: Signal9VideoSource[] = [
  {
    id: 'broadcast-feed',
    title: 'Broadcast Feed',
    src: '/assets/video/broadcast-loop.mp4',
    description: 'Pixel flower loop — clean violet Broadcast transmission.',
    defaultPreset: 'broadcast',
    loop: true,
    muted: true,
  },
  {
    id: 'interference-static',
    title: 'Interference Static',
    src: '/assets/video/interference-static.mp4',
    description: 'Pixel flower loop — cyan Interference glitch treatment.',
    defaultPreset: 'interference',
    loop: true,
    muted: true,
  },
  {
    id: 'jammer-pulse',
    title: 'Jammer Pulse',
    src: '/assets/video/jammer-pulse.mp4',
    description: 'Pixel flower loop — fuchsia Jammer feedback bursts.',
    defaultPreset: 'jammer',
    loop: true,
    muted: true,
  },
  {
    id: 'uplink-data',
    title: 'Uplink Data',
    src: '/assets/video/uplink-data.mp4',
    description: 'Pixel flower loop — emerald Uplink high-contrast ASCII.',
    defaultPreset: 'uplink',
    loop: true,
    muted: true,
  },
  {
    id: 'blackout-void',
    title: 'Blackout Void',
    src: '/assets/video/blackout-void.mp4',
    description: 'Pixel flower loop — crushed Blackout threshold mode.',
    defaultPreset: 'blackout',
    loop: true,
    muted: true,
  },
];

export const SIGNAL_9_DEFAULT_VIDEO_SOURCE = SIGNAL_9_VIDEO_SOURCES[0];

export function getVideoSourceById(id: string): Signal9VideoSource | undefined {
  return SIGNAL_9_VIDEO_SOURCES.find((source) => source.id === id);
}

export function getDefaultVideoForPreset(
  presetId: Signal9PresetTrackId | 'blackout',
): Signal9VideoSource | undefined {
  return (
    SIGNAL_9_VIDEO_SOURCES.find((source) => source.defaultPreset === presetId) ??
    SIGNAL_9_DEFAULT_VIDEO_SOURCE
  );
}
