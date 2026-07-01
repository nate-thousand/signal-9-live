import {
  getAmbientTrack,
  isAmbientTrackId,
  type Signal9PresetTrackId,
} from '../../audio/transmissionTracks.js';
import { SIGNAL_9_RADIO_SOURCE_LABEL } from '../../config/radioConfig.js';
import { getDefaultVideoForPreset } from '../../config/videoSources.js';
import { broadcastGameState } from '../../game/gameState.js';
import {
  activeTransmission,
  activeTransmissionFromAmbient,
  activeTransmissionFromMixtape,
  activeTransmissionFromPreset,
} from '../../platform/activeTransmission.js';
import {
  enterIdleVisualState,
  setDedicatedVisualLock,
} from '../../platform/ambientVisualChannelRegistry.js';
import { applySignal9Preset } from '../../platform/applySignal9Preset.js';
import { getSignal9Mp3Adapter } from '../../platform/signal9SoundIntegration.js';
import {
  startTransmissionSession,
  stopTransmissionSession,
} from '../../platform/transmissionSession.js';
import {
  pauseVideoTransmission,
  playVideoTransmission,
  restartVideoTransmission,
} from '../../platform/videoAsciiSession.js';
import {
  renderAsciiGlobe,
  renderAsciiSpectrum,
  renderAsciiWaveform,
} from '../hudVisuals/index.js';

import { discoverAudioAssets } from './discoverAudioAssets.js';
import { getRadioDeckTracks, isMixtapeTrackId, setDiscoveredMixtapes, type RadioDeckTrack } from './radioDeck.js';
import {
  activateMixtapeVisual,
  clearMixtapeVisual,
  getActiveMixtapePresetForDeck,
  playMixtapeVisualTransmission,
} from '../../platform/mixtapeVisualSession.js';

function syncDedicatedVisualLock(): void {
  const tx = activeTransmission.get();
  if (tx.kind === 'none' || !tx.deckTrackId) {
    enterIdleVisualState();
    return;
  }
  setDedicatedVisualLock(true);
}

function patchTransmissionGameState(
  track: RadioDeckTrack,
  autoplay: boolean,
  presetMission?: string,
  presetAsciiId?: string,
  videoSourceId?: string,
): void {
  broadcastGameState.patch({
    broadcastStatus: autoplay ? 'live' : 'standby',
    systemMessage:
      track.kind === 'mixtape'
        ? `Mixtape loaded: ${track.track}`
        : track.kind === 'ambient'
          ? `Ambient tape loaded: ${track.label}`
          : `Radio preset loaded: ${track.track}`,
    ...(presetMission ? { currentMission: presetMission } : {}),
    ...(presetAsciiId
      ? { currentAsciiPreset: presetAsciiId, currentVisualPreset: presetAsciiId }
      : {}),
    ...(videoSourceId ? { backgroundVideo: videoSourceId } : {}),
    ...(track.kind === 'preset' ? { currentTrack: track.id as Signal9PresetTrackId } : {}),
  });
}

export type DeckTrackId = RadioDeckTrack['id'];

let activeDeckTrackId: DeckTrackId = 'broadcast';
let muted = false;
let previousVolume = 1;
let deckReady = false;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function formatRemaining(currentTime: number, duration: number): string {
  if (!Number.isFinite(duration) || duration <= 0) return '--:--';
  return `-${formatTime(Math.max(0, duration - currentTime))}`;
}

function frequencyForTrack(trackId: string): string {
  switch (trackId) {
    case 'interference':
      return '91.7';
    case 'jammer':
      return '108.9';
    case 'uplink':
      return '143.2';
    case 'blackout':
      return '00.0';
    default:
      return '99.9';
  }
}

export function getActiveDeckTrackId(): DeckTrackId {
  return activeDeckTrackId;
}

export function getDeckTrack(trackId: string): RadioDeckTrack {
  return (
    getRadioDeckTracks().find((track) => track.id === trackId) ??
    getRadioDeckTracks().find((track) => track.id === activeDeckTrackId) ??
    getRadioDeckTracks()[0]!
  );
}

function stepDeckTrack(direction: -1 | 1): RadioDeckTrack {
  const tracks = getRadioDeckTracks();
  const currentIndex = Math.max(0, tracks.findIndex((track) => track.id === activeDeckTrackId));
  const nextIndex = (currentIndex + direction + tracks.length) % tracks.length;
  return tracks[nextIndex]!;
}

export function syncActiveDeckTrackFromGameState(): void {
  if (isAmbientTrackId(activeDeckTrackId) || activeDeckTrackId.startsWith('mixtape-')) return;
  const { currentTrack } = broadcastGameState.getState();
  if (currentTrack === 'blackout') return;
  if (currentTrack !== activeDeckTrackId) {
    activeDeckTrackId = currentTrack;
  }
}

export async function loadDeckTrack(
  root: HTMLElement,
  track: RadioDeckTrack,
  autoplay = true,
): Promise<void> {
  activeDeckTrackId = track.id;

  if (track.kind === 'ambient' || track.kind === 'mixtape') {
    const src = track.kind === 'ambient' ? getAmbientTrack(track.id as `ambient-${string}`)?.src : track.src;
    if (!src) return;

    if (track.kind === 'mixtape') {
      clearMixtapeVisual();
      const preset = getActiveMixtapePresetForDeck(track.id);
      if (preset) {
        activeTransmission.set(activeTransmissionFromMixtape(preset, track.id));
      } else {
        activeTransmission.set({
          kind: 'mixtape',
          mixtapeId: '',
          title: track.track,
          artist: track.label,
          audioSrc: src,
          videoSourceId: '',
          asciiPresetId: '',
          status: 'LOCAL TAPE',
          mission: '',
          deckTrackId: track.id,
          playbackState: 'loading',
        });
      }

      await getSignal9Mp3Adapter()?.loadTrack(src, false);

      if (preset) {
        const visualReady = await activateMixtapeVisual(preset);
        if (!visualReady) {
          activeTransmission.patch({ playbackState: 'error' });
        }
      }

      if (autoplay) {
        await startTransmissionSession();
        await playMixtapeVisualTransmission();
        activeTransmission.patch({ playbackState: 'playing' });
      } else {
        activeTransmission.patch({ playbackState: 'paused' });
      }

      syncDedicatedVisualLock();
      patchTransmissionGameState(track, autoplay, preset?.mission, preset?.asciiPresetId, preset?.videoSourceId);
    } else {
      clearMixtapeVisual();
      activeTransmission.set(activeTransmissionFromAmbient(track.id, track.label, track.track, src));
      await getSignal9Mp3Adapter()?.loadTrack(src, autoplay);
      activeTransmission.patch({ playbackState: autoplay ? 'playing' : 'paused' });
      syncDedicatedVisualLock();
      patchTransmissionGameState(track, autoplay);
      broadcastGameState.appendConversation({
        role: 'system',
        text: `AMBIENT TAPE RECOVERED — ${track.track.toUpperCase()}`,
        timestamp: new Date().toISOString(),
      });
    }
    patchLocalRadioDom(root);
    return;
  }

  clearMixtapeVisual();

  const presetId = track.id as Signal9PresetTrackId;
  const videoSource = getDefaultVideoForPreset(presetId);
  activeTransmission.set(
    activeTransmissionFromPreset(
      presetId,
      track.id,
      track.track,
      track.src,
      videoSource?.id ?? '',
    ),
  );

  const instrumentRoot = document.querySelector<HTMLElement>('[data-s9-instrument-layer]');
  if (!instrumentRoot) return;
  await applySignal9Preset(instrumentRoot, presetId);
  if (autoplay) {
    await startTransmissionSession();
    await playVideoTransmission();
    activeTransmission.patch({ playbackState: 'playing' });
  } else {
    activeTransmission.patch({ playbackState: 'paused' });
  }
  syncDedicatedVisualLock();
  patchTransmissionGameState(track, autoplay, undefined, presetId, videoSource?.id);
  broadcastGameState.patch({
    currentMood:
      presetId === 'interference'
        ? 'unstable'
        : presetId === 'jammer'
          ? 'hostile'
          : presetId === 'uplink'
            ? 'focused'
            : 'tense',
    broadcastStatus: getSignal9Mp3Adapter()?.getStatus().playing ? 'live' : 'standby',
  });
  patchLocalRadioDom(root);
}

function renderTrackOptions(selectedId: string): string {
  const tracks = getRadioDeckTracks();
  const mixtapes = tracks.filter((track) => track.kind === 'mixtape');
  const presets = tracks.filter((track) => track.kind === 'preset');
  const ambient = tracks.filter((track) => track.kind === 'ambient');

  const option = (track: RadioDeckTrack) =>
    `<option value="${track.id}" ${track.id === selectedId ? 'selected' : ''}>${escapeHtml(track.label === track.track ? track.track : `${track.label} — ${track.track}`)}</option>`;

  return `
    ${mixtapes.length > 0 ? `<optgroup label="MIXTAPES">${mixtapes.map(option).join('')}</optgroup>` : ''}
    <optgroup label="CARRIER PRESETS">${presets.map(option).join('')}</optgroup>
    <optgroup label="AMBIENT TAPES">${ambient.map(option).join('')}</optgroup>
  `;
}

export function renderLocalRadioPanel(): string {
  const s = broadcastGameState.getState();
  const adapter = getSignal9Mp3Adapter();
  const snapshot = adapter?.getPlaybackSnapshot();
  const analysis = adapter?.getAudioAnalysis();
  const deckTrack = getDeckTrack(activeDeckTrackId);
  const playing = snapshot?.playing ?? false;
  const duration = snapshot?.duration ?? 0;
  const currentTime = snapshot?.currentTime ?? 0;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const volume = Math.round((snapshot?.volume ?? 1) * 100);
  const peak = Math.round((analysis?.peak ?? 0) * 99);
  const rms = Math.round((analysis?.rms ?? 0) * 99);
  const quality = Math.round((analysis?.transmissionQuality ?? 0) * 99);

  return `
    <aside
      class="s9-broadcast__panel s9-broadcast__radio"
      data-s9-broadcast-radio
      data-s9-collapsible-panel
    >
      <div class="s9-broadcast__panel-chrome">
        <button
          type="button"
          class="s9-broadcast__panel-toggle"
          data-s9-panel-toggle
          aria-expanded="true"
          aria-controls="s9-panel-radio-body"
          aria-label="Collapse Signal 9 Radio panel"
        >
          <span class="s9-broadcast__panel-toggle-icon" aria-hidden="true">−</span>
        </button>
        <h2 class="s9-broadcast__panel-title">SIGNAL 9 RADIO</h2>
        <span class="s9-broadcast__panel-state" data-s9-radio-state>${playing ? 'ON AIR' : 'STANDBY'}</span>
      </div>
      <div id="s9-panel-radio-body" class="s9-broadcast__panel-body s9-radio__body">
        <div class="s9-radio__art" aria-hidden="true">
          <div class="s9-radio__art-grid"></div>
          <span class="s9-radio__album-art" data-s9-album-art>${escapeHtml(deckTrack.label)}</span>
          ${renderAsciiGlobe()}
        </div>

        <p class="s9-radio__source" data-s9-radio-source>${SIGNAL_9_RADIO_SOURCE_LABEL}</p>
        <p class="s9-radio__track" data-s9-deck-track>${escapeHtml(deckTrack.track)}</p>
        <p class="s9-radio__meta">FREQ <span data-s9-radio-frequency>${isAmbientTrackId(activeDeckTrackId) || activeDeckTrackId.startsWith('mixtape-') ? '00.0' : frequencyForTrack(s.currentTrack)}</span> FM // MOOD <span data-s9-deck-mood>${escapeHtml(isAmbientTrackId(activeDeckTrackId) || activeDeckTrackId.startsWith('mixtape-') ? 'recovered' : s.currentMood)}</span></p>
        <p class="s9-radio__meta">PK <span data-s9-audio-peak>${peak}</span> // RMS <span data-s9-audio-rms>${rms}</span> // Q <span data-s9-audio-quality>${quality}</span></p>

        <div class="s9-radio__waveform" data-s9-waveform aria-hidden="true">${renderAsciiWaveform()}</div>
        <div class="s9-radio__progress" aria-label="Playback progress">
          <span data-s9-radio-progress style="inline-size:${progress}%"></span>
        </div>
        <input class="s9-radio__seek" data-s9-radio-seek type="range" min="0" max="1000" value="${Math.round(progress * 10)}" aria-label="Seek transmission" />
        <div class="s9-radio__time">
          <span data-s9-radio-time>${formatTime(currentTime)}</span>
          <span data-s9-radio-duration>${formatTime(duration)}</span>
          <span data-s9-radio-remaining>${formatRemaining(currentTime, duration)}</span>
        </div>

        <div class="s9-radio__spectrum" data-s9-spectrum aria-hidden="true">${renderAsciiSpectrum()}</div>

        <div class="s9-radio__controls">
          <button type="button" class="s9-broadcast__btn" data-s9-deck="previous">PREV</button>
          <button type="button" class="s9-broadcast__btn" data-s9-deck="play" aria-pressed="${playing}">PLAY</button>
          <button type="button" class="s9-broadcast__btn" data-s9-deck="pause" aria-pressed="${!playing}">PAUSE</button>
          <button type="button" class="s9-broadcast__btn" data-s9-deck="next">NEXT</button>
          <button type="button" class="s9-broadcast__btn" data-s9-deck="restart">RST</button>
          <button type="button" class="s9-broadcast__btn" data-s9-deck="mute" aria-pressed="${muted}">${muted ? 'UNMUTE' : 'MUTE'}</button>
        </div>

        <label class="s9-radio__field">
          <span>TRACK</span>
          <select data-s9-radio-preset>${renderTrackOptions(activeDeckTrackId)}</select>
        </label>

        <label class="s9-radio__volume">
          <span>VOL <b data-s9-radio-volume>${volume}</b></span>
          <input data-s9-radio-volume-input type="range" min="0" max="100" value="${volume}" />
        </label>
      </div>
    </aside>
  `;
}

export function patchLocalRadioDom(root: HTMLElement): void {
  const s = broadcastGameState.getState();
  const deckTrack = getDeckTrack(activeDeckTrackId);

  root.querySelector<HTMLElement>('[data-s9-deck-track]')!.textContent = deckTrack.track;
  root.querySelector<HTMLElement>('[data-s9-album-art]')!.textContent = deckTrack.label;
  root.querySelector<HTMLElement>('[data-s9-deck-mood]')!.textContent =
    isAmbientTrackId(activeDeckTrackId) || activeDeckTrackId.startsWith('mixtape-')
      ? 'recovered'
      : s.currentMood;
  root.querySelector<HTMLElement>('[data-s9-radio-frequency]')!.textContent =
    isAmbientTrackId(activeDeckTrackId) || activeDeckTrackId.startsWith('mixtape-')
      ? '00.0'
      : frequencyForTrack(s.currentTrack);
  root.querySelector<HTMLElement>('[data-s9-radio-source]')!.textContent = SIGNAL_9_RADIO_SOURCE_LABEL;

  const presetSelect = root.querySelector<HTMLSelectElement>('[data-s9-radio-preset]');
  if (presetSelect && presetSelect.value !== activeDeckTrackId) {
    presetSelect.innerHTML = renderTrackOptions(activeDeckTrackId);
    presetSelect.value = activeDeckTrackId;
  }
}

export function patchLocalRadioTelemetry(root: HTMLElement): void {
  activeTransmission.syncPlaybackFromAdapter();
  const adapter = getSignal9Mp3Adapter();
  const snapshot = adapter?.getPlaybackSnapshot();
  const analysis = adapter?.getAudioAnalysis();
  const deckTrack = getDeckTrack(activeDeckTrackId);
  const progress =
    snapshot && snapshot.duration > 0
      ? Math.min(100, (snapshot.currentTime / snapshot.duration) * 100)
      : 0;
  const peak = Math.round((analysis?.peak ?? 0) * 99);
  const rms = Math.round((analysis?.rms ?? 0) * 99);
  const quality = Math.round((analysis?.transmissionQuality ?? 0) * 99);

  root.querySelector<HTMLElement>('[data-s9-radio-state]')!.textContent = snapshot?.playing ? 'ON AIR' : 'STANDBY';
  root.querySelector<HTMLButtonElement>('[data-s9-deck="play"]')?.setAttribute(
    'aria-pressed',
    snapshot?.playing ? 'true' : 'false',
  );
  root.querySelector<HTMLButtonElement>('[data-s9-deck="pause"]')?.setAttribute(
    'aria-pressed',
    snapshot?.playing ? 'false' : 'true',
  );
  const muteButton = root.querySelector<HTMLButtonElement>('[data-s9-deck="mute"]');
  if (muteButton) {
    muteButton.textContent = snapshot?.muted ? 'UNMUTE' : 'MUTE';
    muteButton.setAttribute('aria-pressed', snapshot?.muted ? 'true' : 'false');
  }
  root.querySelector<HTMLElement>('[data-s9-deck-track]')!.textContent = deckTrack.track;
  root.querySelector<HTMLElement>('[data-s9-album-art]')!.textContent = deckTrack.label;
  root.querySelector<HTMLElement>('[data-s9-radio-progress]')!.style.inlineSize = `${progress}%`;
  const seek = root.querySelector<HTMLInputElement>('[data-s9-radio-seek]');
  if (seek) seek.value = String(Math.round(progress * 10));
  root.querySelector<HTMLElement>('[data-s9-radio-time]')!.textContent = formatTime(snapshot?.currentTime ?? 0);
  root.querySelector<HTMLElement>('[data-s9-radio-duration]')!.textContent = formatTime(snapshot?.duration ?? 0);
  root.querySelector<HTMLElement>('[data-s9-radio-remaining]')!.textContent = formatRemaining(
    snapshot?.currentTime ?? 0,
    snapshot?.duration ?? 0,
  );
  root.querySelector<HTMLElement>('[data-s9-audio-peak]')!.textContent = String(peak);
  root.querySelector<HTMLElement>('[data-s9-audio-rms]')!.textContent = String(rms);
  root.querySelector<HTMLElement>('[data-s9-audio-quality]')!.textContent = String(quality);
}

export function bindLocalRadioDeck(root: HTMLElement): void {
  root.querySelector<HTMLButtonElement>('[data-s9-deck="play"]')?.addEventListener('click', () => {
    void startTransmissionSession()
      .then(() => {
        if (isMixtapeTrackId(activeDeckTrackId)) {
          return playMixtapeVisualTransmission();
        }
        if (!isAmbientTrackId(activeDeckTrackId)) {
          return playVideoTransmission();
        }
      })
      .then(() => {
        activeTransmission.patch({ playbackState: 'playing' });
        broadcastGameState.patch({ broadcastStatus: 'live' });
        patchLocalRadioDom(root);
      });
  });

  root.querySelector<HTMLButtonElement>('[data-s9-deck="pause"]')?.addEventListener('click', () => {
    void stopTransmissionSession()
      .then(() => pauseVideoTransmission())
      .then(() => {
        activeTransmission.patch({ playbackState: 'paused' });
        broadcastGameState.patch({ broadcastStatus: 'standby' });
        patchLocalRadioDom(root);
      });
  });

  root.querySelector<HTMLButtonElement>('[data-s9-deck="previous"]')?.addEventListener('click', () => {
    void loadDeckTrack(root, stepDeckTrack(-1), true);
  });

  root.querySelector<HTMLButtonElement>('[data-s9-deck="next"]')?.addEventListener('click', () => {
    void loadDeckTrack(root, stepDeckTrack(1), true);
  });

  root.querySelector<HTMLButtonElement>('[data-s9-deck="restart"]')?.addEventListener('click', () => {
    getSignal9Mp3Adapter()?.seekTo(0);
    if (isMixtapeTrackId(activeDeckTrackId)) {
      void playMixtapeVisualTransmission().then(() => startTransmissionSession());
    } else {
      void restartVideoTransmission().then(() => startTransmissionSession());
    }
    broadcastGameState.patch({ broadcastStatus: 'live' });
    activeTransmission.patch({ playbackState: 'playing' });
  });

  root.querySelector<HTMLButtonElement>('[data-s9-deck="mute"]')?.addEventListener('click', () => {
    muted = !muted;
    const adapter = getSignal9Mp3Adapter();
    if (muted) {
      previousVolume = adapter?.getPlaybackSnapshot().volume ?? previousVolume;
    } else {
      adapter?.setVolume(previousVolume);
      root.querySelector<HTMLInputElement>('[data-s9-radio-volume-input]')!.value = String(
        Math.round(previousVolume * 100),
      );
      root.querySelector<HTMLElement>('[data-s9-radio-volume]')!.textContent = String(
        Math.round(previousVolume * 100),
      );
    }
    adapter?.setMuted(muted);
    patchLocalRadioDom(root);
  });

  root.querySelector<HTMLSelectElement>('[data-s9-radio-preset]')?.addEventListener('change', (event) => {
    const select = event.currentTarget as HTMLSelectElement | null;
    if (!select) return;
    void loadDeckTrack(root, getDeckTrack(select.value), true);
  });

  root.querySelector<HTMLInputElement>('[data-s9-radio-volume-input]')?.addEventListener('input', (event) => {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    const value = Number(input.value);
    getSignal9Mp3Adapter()?.setVolume(value / 100);
    root.querySelector<HTMLElement>('[data-s9-radio-volume]')!.textContent = String(value);
  });

  root.querySelector<HTMLInputElement>('[data-s9-radio-seek]')?.addEventListener('input', (event) => {
    const input = event.currentTarget as HTMLInputElement | null;
    const snapshot = getSignal9Mp3Adapter()?.getPlaybackSnapshot();
    if (!input || !snapshot || snapshot.duration <= 0) return;
    getSignal9Mp3Adapter()?.seekTo((Number(input.value) / 1000) * snapshot.duration);
    patchLocalRadioDom(root);
  });
}

export async function initLocalRadioDeck(root: HTMLElement): Promise<void> {
  if (deckReady) return;
  const discovered = await discoverAudioAssets();
  setDiscoveredMixtapes(discovered);
  deckReady = true;
  const firstTrack = getRadioDeckTracks()[0];
  if (firstTrack) {
    await loadDeckTrack(root, firstTrack, false);
  }
  patchLocalRadioDom(root);
}
