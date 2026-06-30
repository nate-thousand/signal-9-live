import type { Signal9PresetTrackId } from '../audio/transmissionTracks.js';
import { getManifestAsset, SIGNAL_9_ASSET_MANIFEST } from '../assets/manifest.js';
import type { AiBroadcastResponse } from './broadcastResponse.js';
import { broadcastGameState } from '../game/gameState.js';
import { applySignal9Preset } from '../platform/applySignal9Preset.js';
import {
  applyVideoAsciiProfileForPreset,
  loadVideoSourceById,
  playVideoTransmission,
} from '../platform/videoAsciiSession.js';

const VALID_PRESETS = new Set<Signal9PresetTrackId | 'blackout'>([
  'broadcast',
  'interference',
  'jammer',
  'uplink',
  'blackout',
]);

function resolvePresetId(value: string): Signal9PresetTrackId | 'blackout' | null {
  if (!value) return null;
  const normalized = value.toLowerCase().replace(/\s+/g, '-');
  if (VALID_PRESETS.has(normalized as Signal9PresetTrackId | 'blackout')) {
    return normalized as Signal9PresetTrackId | 'blackout';
  }
  return null;
}

function resolveImagePath(imageRef: string): string {
  if (!imageRef) return '';
  if (imageRef.startsWith('/')) return imageRef;
  const asset = getManifestAsset(imageRef);
  if (asset?.kind === 'image' && asset.filePath) return asset.filePath;
  return '';
}

function getInstrumentRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-s9-instrument-layer]');
}

function setBackgroundImageOverlay(path: string): void {
  const host =
    document.querySelector<HTMLElement>('[data-s9-broadcast-center]') ??
    document.querySelector<HTMLElement>('[data-s9-screen-layer]');
  if (!host) return;

  let overlay = host.querySelector<HTMLElement>('[data-s9-bg-image]');
  if (!path) {
    overlay?.remove();
    return;
  }

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 's9-broadcast__bg-image';
    overlay.dataset.s9BgImage = '';
    host.prepend(overlay);
  }

  overlay.style.backgroundImage = `url("${path}")`;
  overlay.style.opacity = path ? '0.35' : '0';
}

/** Apply structured AI response to game state and live interface */
export async function applyBroadcastResponse(response: AiBroadcastResponse): Promise<void> {
  const state = broadcastGameState.getState();
  const instrumentRoot = getInstrumentRoot();

  const trackPreset =
    resolvePresetId(response.track) ??
    resolvePresetId(response.visualPreset) ??
    resolvePresetId(response.asciiPreset);

  const nextTrack = trackPreset ?? state.currentTrack;
  const nextVisual = response.visualPreset || state.currentVisualPreset;
  const nextAscii = response.asciiPreset || state.currentAsciiPreset;
  const nextVideo = response.backgroundVideo || state.backgroundVideo;
  const nextImage = resolveImagePath(response.backgroundImage) || state.backgroundImage;

  if (instrumentRoot && trackPreset && trackPreset !== 'blackout') {
    await applySignal9Preset(instrumentRoot, trackPreset);
  } else if (instrumentRoot && trackPreset === 'blackout') {
    await applySignal9Preset(instrumentRoot, 'broadcast');
    await applyVideoAsciiProfileForPreset('blackout');
    await loadVideoSourceById('blackout-void');
    await playVideoTransmission('blackout-void');
  }

  const asciiPreset = resolvePresetId(nextAscii) ?? resolvePresetId(nextVisual);
  if (asciiPreset) {
    await applyVideoAsciiProfileForPreset(asciiPreset);
  }

  if (nextVideo) {
    await loadVideoSourceById(nextVideo);
    await playVideoTransmission(nextVideo);
  }

  setBackgroundImageOverlay(nextImage);

  broadcastGameState.unlockLore(
    response.unlockLore.map((entry) => ({
      id: entry.id,
      title: entry.title,
      body: entry.body,
      category: entry.category ?? 'transmission',
    })),
  );

  broadcastGameState.discoverCharacters(response.discoverCharacters);

  broadcastGameState.patch({
    currentLocation: response.location || state.currentLocation,
    currentMission: response.mission || state.currentMission,
    currentTrack: nextTrack,
    currentMood: response.mood || state.currentMood,
    currentVisualPreset: nextVisual,
    currentAsciiPreset: nextAscii,
    backgroundVideo: nextVideo,
    backgroundImage: nextImage,
    availableChoices: response.choices,
    broadcastStatus: trackPreset ? 'live' : state.broadcastStatus,
    networkStatus: 'online',
    aiStatus: 'ready',
    systemMessage: response.systemMessage ?? `GHOST // ${response.mood || 'signal locked'}`,
  });

  broadcastGameState.appendConversation({
    role: 'narrator',
    text: response.narration,
    timestamp: new Date().toISOString(),
  });
}

export function getBroadcastDeckMeta(): {
  trackLabel: string;
  videoLabel: string;
} {
  const state = broadcastGameState.getState();
  const song = SIGNAL_9_ASSET_MANIFEST.songs.find((s) => s.id === state.currentTrack);
  const video = SIGNAL_9_ASSET_MANIFEST.videos.find((v) => v.id === state.backgroundVideo);
  return {
    trackLabel: song?.title ?? state.currentTrack,
    videoLabel: video?.title ?? state.backgroundVideo,
  };
}
