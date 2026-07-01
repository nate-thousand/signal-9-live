import { applyBroadcastResponse } from '../../ai/applyBroadcastResponse.js';
import { sendBroadcastChat } from '../../ai/chatClient.js';
import { isAmbientTrackId } from '../../audio/transmissionTracks.js';
import { SIGNAL_9_RADIO_SOURCE_LABEL } from '../../config/radioConfig.js';
import { broadcastGameState } from '../../game/gameState.js';
import type { CharacterFile, ConversationTurn, LoreEntry } from '../../game/types.js';
import { getBroadcastAudioAnalysis } from '../../platform/broadcastAudioAnalysis.js';
import { getSignal9Mp3Adapter } from '../../platform/signal9SoundIntegration.js';
import { getSignal9VisualAdapter } from '../../platform/signal9VisualIntegration.js';
import {
  bindLocalRadioDeck,
  getActiveDeckTrackId,
  getDeckTrack,
  initLocalRadioDeck,
  patchLocalRadioDom,
  patchLocalRadioTelemetry,
  renderLocalRadioPanel,
  syncActiveDeckTrackFromGameState,
} from './LocalRadioDeck.js';
import {
  mountAsciiVisualEngineViewport,
  renderAsciiVisualStandby,
} from './mountAsciiVisualEngineViewport.js';
import {
  renderAsciiGlobe,
  renderAsciiNetworkMap,
  renderAsciiPortrait,
  renderAsciiSignalMeter,
  renderAsciiTelemetryBars,
  renderAsciiWaveform,
  updateAsciiGlobe,
  updateAsciiNetworkMap,
  updateAsciiPortrait,
  updateAsciiSignalMeter,
  updateAsciiSpectrum,
  updateAsciiTelemetryBars,
  updateAsciiWaveform,
} from '../hudVisuals/index.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function roleClass(role: string): string {
  if (role === 'player') return 's9-broadcast-chat__line--player';
  if (role === 'narrator') return 's9-broadcast-chat__line--narrator';
  return 's9-broadcast-chat__line--system';
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

function getRadioPlaybackTelemetry(): {
  trackLabel: string;
  episodeLabel: string;
  elapsed: string;
  remaining: string;
  sourceLabel: string;
} {
  const snapshot = getSignal9Mp3Adapter()?.getPlaybackSnapshot();
  const deckTrack = getDeckTrack(getActiveDeckTrackId());
  return {
    trackLabel: deckTrack.track,
    episodeLabel: 'LIVE',
    elapsed: formatTime(snapshot?.currentTime ?? 0),
    remaining: formatRemaining(snapshot?.currentTime ?? 0, snapshot?.duration ?? 0),
    sourceLabel: SIGNAL_9_RADIO_SOURCE_LABEL,
  };
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

function visualModeLabel(): string {
  return 'PANEL ASCII';
}

function renderHistory(): string {
  const { conversationHistory } = broadcastGameState.getState();
  return conversationHistory
    .slice(-40)
    .map(
      (turn: ConversationTurn) =>
        `<p class="s9-broadcast-chat__line ${roleClass(turn.role)}"><span class="s9-broadcast-chat__role">${turn.role === 'player' ? 'OP' : turn.role === 'narrator' ? 'GHOST' : 'SYS'}</span> <span class="s9-broadcast-chat__text">${escapeHtml(turn.text)}</span></p>`,
    )
    .join('');
}

function renderChoices(): string {
  const { availableChoices } = broadcastGameState.getState();
  return availableChoices
    .slice(0, 3)
    .map(
      (choice: string, index: number) =>
        `<button type="button" class="s9-broadcast__choice" data-s9-choice="${index}">${escapeHtml(choice)}</button>`,
    )
    .join('');
}

function renderStatusBar(): string {
  const s = broadcastGameState.getState();
  const radio = getRadioPlaybackTelemetry();
  return `
    <header class="s9-broadcast__header" data-s9-broadcast-status>
      <span class="s9-broadcast__brand">SIGNAL 9 // RESISTANCE OPERATING TERMINAL</span>
      <span class="s9-broadcast__header-stat" data-s9-stat="track">TRK ${escapeHtml(radio.trackLabel)}</span>
      <span class="s9-broadcast__header-stat" data-s9-stat="episode">EP ${escapeHtml(radio.episodeLabel)}</span>
      <span class="s9-broadcast__header-stat" data-s9-stat="source">SRC ${radio.sourceLabel}</span>
      <span class="s9-broadcast__header-stat" data-s9-stat="elapsed">EL ${radio.elapsed}</span>
      <span class="s9-broadcast__header-stat" data-s9-stat="remaining">REM ${radio.remaining}</span>
      <span class="s9-broadcast__header-stat s9-broadcast__stat--${s.broadcastStatus}" data-s9-stat="broadcast">TX ${s.broadcastStatus.toUpperCase()}</span>
      <span class="s9-broadcast__header-stat" data-s9-stat="frequency">FRQ ${isAmbientTrackId(getActiveDeckTrackId()) || getActiveDeckTrackId().startsWith('mixtape-') ? '00.0' : frequencyForTrack(s.currentTrack)} FM</span>
      <span class="s9-broadcast__header-stat" data-s9-stat="preset">PRE ${escapeHtml(isAmbientTrackId(getActiveDeckTrackId()) || getActiveDeckTrackId().startsWith('mixtape-') ? 'AMBIENT' : s.currentTrack.toUpperCase())}</span>
      <span class="s9-broadcast__header-stat" data-s9-stat="visual-mode">VIS ${visualModeLabel()}</span>
    </header>
  `;
}

function renderMissionPanel(): string {
  const s = broadcastGameState.getState();
  const lore = s.unlockedLore
    .slice()
    .reverse()
    .map(
      (entry: LoreEntry) =>
        `<li class="s9-broadcast__lore-item"><span class="s9-broadcast__lore-cat">${entry.category}</span> ${escapeHtml(entry.title)}</li>`,
    )
    .join('');
  const chars = s.discoveredCharacters
    .map(
      (c: CharacterFile) =>
        `<li class="s9-broadcast__char-item"><span class="s9-broadcast__char-callsign">${escapeHtml(c.callsign)}</span> ${escapeHtml(c.role)}</li>`,
    )
    .join('');

  return `
    <section
      class="s9-broadcast__panel s9-broadcast__mission"
      data-s9-broadcast-lore
      data-s9-collapsible-panel
    >
      <div class="s9-broadcast__panel-chrome">
        <button
          type="button"
          class="s9-broadcast__panel-toggle"
          data-s9-panel-toggle
          aria-expanded="true"
          aria-controls="s9-panel-mission-body"
          aria-label="Collapse Mission Console panel"
        >
          <span class="s9-broadcast__panel-toggle-icon" aria-hidden="true">−</span>
        </button>
        <h2 class="s9-broadcast__panel-title">MISSION CONSOLE</h2>
        <span class="s9-broadcast__panel-state">TRACKING</span>
      </div>
      <div id="s9-panel-mission-body" class="s9-broadcast__panel-body s9-broadcast__mission-body">
      <div class="s9-broadcast__mini-panel">
        <p class="s9-broadcast__objective" data-s9-objective>${escapeHtml(s.currentMission)}</p>
        ${renderAsciiTelemetryBars()}
      </div>
      <div class="s9-broadcast__mini-panel">
        <h3 class="s9-broadcast__subhead">Memory Nodes</h3>
        <pre class="s9-hud-visual s9-ascii-memory" data-s9-memory-preview aria-label="Memory node preview">MEMORY NODE // ${escapeHtml(s.unlockedLore[s.unlockedLore.length - 1]?.title ?? 'NO SIGNAL')}</pre>
      <ul class="s9-broadcast__lore-list" data-s9-lore-list>${lore || '<li class="s9-broadcast__empty">—</li>'}</ul>
      </div>
      <div class="s9-broadcast__mini-panel">
        <h3 class="s9-broadcast__subhead">Echo Files</h3>
        ${renderAsciiPortrait()}
      <ul class="s9-broadcast__char-list" data-s9-char-list>${chars || '<li class="s9-broadcast__empty">—</li>'}</ul>
      </div>
      </div>
    </section>
  `;
}

/** Center panel — platform ASCII canvas mounts into the viewport at runtime. */
function renderVisualizerFrame(): string {
  const s = broadcastGameState.getState();
  return `
    <section class="s9-broadcast__visual" data-s9-broadcast-center aria-label="ASCII visual engine">
      <div class="s9-broadcast__visual-chrome">
        <span>ASCII VISUAL ENGINE</span>
        <span data-s9-footer-visual>VIS ${escapeHtml(s.currentVisualPreset)}</span>
        <span data-s9-footer-ascii>ASCII ${escapeHtml(s.currentAsciiPreset)}</span>
      </div>
      <div class="s9-broadcast__visual-viewport" data-s9-visual-viewport></div>
      <pre class="s9-broadcast__visual-standby" data-s9-visual-standby hidden aria-hidden="true">${renderAsciiVisualStandby()}</pre>
      <div class="s9-broadcast__visual-reticle" aria-hidden="true"></div>
      <div class="s9-broadcast__visual-modules" aria-hidden="true">
        ${renderAsciiNetworkMap()}
        ${renderAsciiGlobe()}
      </div>
      <div class="s9-broadcast__visual-telemetry" aria-hidden="true">
        <span data-s9-visual-threshold>THR --</span>
        <span data-s9-visual-dither>DITH --</span>
        <span data-s9-visual-motion>MOT --</span>
        <span data-s9-visual-feedback>FDBK --</span>
        <span data-s9-visual-glitch>GLT --</span>
        <span data-s9-visual-brightness>BRT --</span>
      </div>
    </section>
  `;
}

function renderHud(): string {
  const s = broadcastGameState.getState();
  return `
    <footer class="s9-broadcast__hud" data-s9-broadcast-footer>
      <span>FREQ <b data-s9-hud-frequency>${frequencyForTrack(s.currentTrack)} FM</b></span>
      <span>SIG <b data-s9-hud-signal>72%</b></span>
      <span>ECHO <b data-s9-hud-echo>LISTENING</b></span>
      <span>MEM <b data-s9-hud-memory>${s.unlockedLore.length}</b></span>
      <span>TX <b data-s9-hud-broadcast>${s.broadcastStatus.toUpperCase()}</b></span>
      <span>CPU <b data-s9-hud-cpu>18%</b></span>
      <span>FPS <b data-s9-hud-fps>60</b></span>
      <span>MISSION <b data-s9-footer-mission>${escapeHtml(s.currentMission)}</b></span>
      <span>DISTRICT <b data-s9-footer-district>${escapeHtml(s.currentLocation)}</b></span>
      <span>TIME <b data-s9-hud-time>${new Date().toLocaleTimeString([], { hour12: false })}</b></span>
      <span class="s9-broadcast__ai-status s9-broadcast__ai-status--${s.aiStatus}" data-s9-footer-ai>AI ${s.aiStatus.toUpperCase()}</span>
      <span class="s9-broadcast__hud-packet">${renderAsciiSignalMeter('packet', 'Packet')}</span>
    </footer>
  `;
}

function renderShell(): string {
  return `
    <div class="s9-broadcast" data-s9-broadcast-terminal>
      ${renderStatusBar()}
      <section class="s9-broadcast__chat" data-s9-broadcast-chat aria-label="Command terminal">
        <div class="s9-broadcast__panel-chrome">
          <h2 class="s9-broadcast__panel-title">CHAT TERMINAL</h2>
          <span class="s9-broadcast__panel-state">KEYBOARD PRIMARY</span>
        </div>
        <div class="s9-broadcast-chat__latest" aria-hidden="true">
          <span>LATEST TRANSMISSION WAVEFORM</span>
          ${renderAsciiWaveform()}
        </div>
        <div class="s9-broadcast-chat__history" data-s9-chat-history role="log">${renderHistory()}</div>
        <form class="s9-broadcast-chat__form" data-s9-chat-form>
          <label class="s9-terminal__input-row s9-broadcast-chat__input-row">
            <span class="s9-terminal__prompt">&gt;</span>
            <input class="s9-terminal__input s9-broadcast-chat__input" data-s9-chat-input type="text" placeholder="transmit..." spellcheck="false" autocomplete="off" />
          </label>
        </form>
        <div class="s9-broadcast__choices" data-s9-choices>${renderChoices()}</div>
      </section>
      ${renderVisualizerFrame()}
      <div class="s9-broadcast__right">
        ${renderLocalRadioPanel()}
        ${renderMissionPanel()}
      </div>
      ${renderHud()}
    </div>
  `;
}

function scrollChatToBottom(root: HTMLElement): void {
  const history = root.querySelector<HTMLElement>('[data-s9-chat-history]');
  if (history) history.scrollTop = history.scrollHeight;
}

function patchHeaderPlaybackStats(root: HTMLElement): void {
  const radio = getRadioPlaybackTelemetry();
  root.querySelector<HTMLElement>('[data-s9-stat="track"]')!.textContent = `TRK ${radio.trackLabel}`;
  root.querySelector<HTMLElement>('[data-s9-stat="episode"]')!.textContent = `EP ${radio.episodeLabel}`;
  root.querySelector<HTMLElement>('[data-s9-stat="source"]')!.textContent = `SRC ${radio.sourceLabel}`;
  root.querySelector<HTMLElement>('[data-s9-stat="elapsed"]')!.textContent = `EL ${radio.elapsed}`;
  root.querySelector<HTMLElement>('[data-s9-stat="remaining"]')!.textContent = `REM ${radio.remaining}`;
}

function patchDom(root: HTMLElement): void {
  const s = broadcastGameState.getState();
  patchHeaderPlaybackStats(root);
  patchLocalRadioDom(root);
  const deckId = getActiveDeckTrackId();
  root.querySelector<HTMLElement>('[data-s9-stat="frequency"]')!.textContent = `FRQ ${isAmbientTrackId(deckId) || deckId.startsWith('mixtape-') ? '00.0' : frequencyForTrack(s.currentTrack)} FM`;
  root.querySelector<HTMLElement>('[data-s9-stat="preset"]')!.textContent = `PRE ${isAmbientTrackId(deckId) || deckId.startsWith('mixtape-') ? 'AMBIENT' : s.currentTrack.toUpperCase()}`;
  root.querySelector<HTMLElement>('[data-s9-stat="visual-mode"]')!.textContent = `VIS ${visualModeLabel()}`;
  root.querySelector<HTMLElement>('[data-s9-objective]')!.textContent = s.currentMission;
  root.querySelector<HTMLElement>('[data-s9-chat-history]')!.innerHTML = renderHistory();
  root.querySelector<HTMLElement>('[data-s9-choices]')!.innerHTML = renderChoices();
  root.querySelector<HTMLElement>('[data-s9-lore-list]')!.innerHTML =
    s.unlockedLore
      .slice()
      .reverse()
      .map(
        (entry: LoreEntry) =>
          `<li class="s9-broadcast__lore-item"><span class="s9-broadcast__lore-cat">${entry.category}</span> ${escapeHtml(entry.title)}</li>`,
      )
      .join('') || '<li class="s9-broadcast__empty">—</li>';
  root.querySelector<HTMLElement>('[data-s9-char-list]')!.innerHTML =
    s.discoveredCharacters
      .map(
        (c: CharacterFile) =>
          `<li class="s9-broadcast__char-item"><span class="s9-broadcast__char-callsign">${escapeHtml(c.callsign)}</span> ${escapeHtml(c.role)}</li>`,
      )
      .join('') || '<li class="s9-broadcast__empty">—</li>';
  root.querySelector<HTMLElement>('[data-s9-footer-visual]')!.textContent = `VIS ${s.currentVisualPreset}`;
  root.querySelector<HTMLElement>('[data-s9-footer-ascii]')!.textContent = `ASCII ${s.currentAsciiPreset}`;
  root.querySelector<HTMLElement>('[data-s9-footer-mission]')!.textContent = s.currentMission;
  root.querySelector<HTMLElement>('[data-s9-footer-district]')!.textContent = s.currentLocation;
  root.querySelector<HTMLElement>('[data-s9-hud-frequency]')!.textContent = `${isAmbientTrackId(getActiveDeckTrackId()) || getActiveDeckTrackId().startsWith('mixtape-') ? '00.0' : frequencyForTrack(s.currentTrack)} FM`;
  root.querySelector<HTMLElement>('[data-s9-hud-memory]')!.textContent = String(s.unlockedLore.length);
  root.querySelector<HTMLElement>('[data-s9-hud-broadcast]')!.textContent = s.broadcastStatus.toUpperCase();
  root.querySelector<HTMLElement>('[data-s9-memory-preview]')!.textContent =
    `MEMORY NODE // ${s.unlockedLore[s.unlockedLore.length - 1]?.title ?? 'NO SIGNAL'}`;
  const aiEl = root.querySelector<HTMLElement>('[data-s9-footer-ai]');
  if (aiEl) {
    aiEl.textContent = `AI ${s.aiStatus.toUpperCase()}`;
    aiEl.className = `s9-broadcast__ai-status s9-broadcast__ai-status--${s.aiStatus}`;
  }
  const network = root.querySelector<HTMLElement>('[data-s9-stat="network"]');
  if (network) {
    network.textContent = `NET ${s.networkStatus.toUpperCase()}`;
    network.className = `s9-broadcast__header-stat s9-broadcast__stat--${s.networkStatus}`;
  }
  const broadcast = root.querySelector<HTMLElement>('[data-s9-stat="broadcast"]');
  if (broadcast) {
    broadcast.textContent = `TX ${s.broadcastStatus.toUpperCase()}`;
    broadcast.className = `s9-broadcast__header-stat s9-broadcast__stat--${s.broadcastStatus}`;
  }
  scrollChatToBottom(root);
  bindChoiceHandlers(root);
}

async function submitInput(root: HTMLElement, text: string, choice?: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed && !choice) return;

  broadcastGameState.patch({ aiStatus: 'thinking', broadcastStatus: 'live' });
  broadcastGameState.appendConversation({
    role: 'player',
    text: choice ?? trimmed,
    timestamp: new Date().toISOString(),
  });
  patchDom(root);

  try {
    const response = await sendBroadcastChat(trimmed || choice || '', choice);
    await applyBroadcastResponse(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    broadcastGameState.patch({ aiStatus: 'error', systemMessage: message });
    broadcastGameState.appendConversation({
      role: 'system',
      text: `LINK FAILURE — ${message}`,
      timestamp: new Date().toISOString(),
    });
  }

  patchDom(root);
}

function bindChoiceHandlers(root: HTMLElement): void {
  root.querySelectorAll<HTMLButtonElement>('[data-s9-choice]').forEach((btn) => {
    btn.onclick = () => {
      const index = Number(btn.dataset.s9Choice);
      const choice = broadcastGameState.getState().availableChoices[index];
      if (choice) void submitInput(root, choice, choice);
    };
  });
}

function setPanelCollapsed(panel: HTMLElement, collapsed: boolean): void {
  panel.classList.toggle('s9-broadcast__panel--collapsed', collapsed);
  const toggle = panel.querySelector<HTMLButtonElement>('[data-s9-panel-toggle]');
  const icon = panel.querySelector<HTMLElement>('.s9-broadcast__panel-toggle-icon');
  const title = panel.querySelector<HTMLElement>('.s9-broadcast__panel-title')?.textContent?.trim() ?? 'panel';
  if (toggle) {
    toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    toggle.setAttribute('aria-label', collapsed ? `Expand ${title} panel` : `Collapse ${title} panel`);
  }
  if (icon) icon.textContent = collapsed ? '+' : '−';
}

function bindCollapsiblePanels(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('[data-s9-collapsible-panel]').forEach((panel) => {
    const toggle = panel.querySelector<HTMLButtonElement>('[data-s9-panel-toggle]');
    if (!toggle || toggle.dataset.s9PanelBound === 'true') return;
    toggle.dataset.s9PanelBound = 'true';
    toggle.addEventListener('click', () => {
      setPanelCollapsed(panel, !panel.classList.contains('s9-broadcast__panel--collapsed'));
    });
  });

  const mission = root.querySelector<HTMLElement>('[data-s9-broadcast-lore]');
  if (mission && window.matchMedia('(max-width: 760px)').matches) {
    setPanelCollapsed(mission, true);
  }
}

function updateLiveTelemetry(root: HTMLElement): void {
  const adapter = getSignal9Mp3Adapter();
  const visual = getSignal9VisualAdapter();
  const state = broadcastGameState.getState();
  const snapshot = adapter?.getPlaybackSnapshot();
  const analysis = adapter?.getAudioAnalysis() ?? getBroadcastAudioAnalysis();
  const visualStatus = visual?.getStatus();
  const amplitude = analysis.amplitude;
  const bass = analysis.bass;
  const mids = analysis.mids;
  const highs = analysis.highs;
  const transient = analysis.transient;
  const phase = Date.now() / 1000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const signal = Math.round((analysis.signalStrength || Math.min(1, 0.58 + amplitude * 0.28 + bass * 0.14)) * 99);
  const peak = Math.round(analysis.peak * 99);
  const rms = Math.round(analysis.rms * 99);
  const cpu = Math.round(14 + amplitude * 18 + transient * 11);
  const fps = Math.round(visualStatus?.fps ?? 60);
  const deckId = getActiveDeckTrackId();

  patchHeaderPlaybackStats(root);
  patchLocalRadioTelemetry(root);
  root.querySelector<HTMLElement>('[data-s9-stat="frequency"]')!.textContent = `FRQ ${isAmbientTrackId(deckId) || deckId.startsWith('mixtape-') ? '00.0' : frequencyForTrack(state.currentTrack)} FM`;
  root.querySelector<HTMLElement>('[data-s9-stat="preset"]')!.textContent = `PRE ${isAmbientTrackId(deckId) || deckId.startsWith('mixtape-') ? 'AMBIENT' : state.currentTrack.toUpperCase()}`;
  root.querySelector<HTMLElement>('[data-s9-visual-threshold]')!.textContent = `THR ${String(Math.round(amplitude * 99)).padStart(2, '0')}`;
  root.querySelector<HTMLElement>('[data-s9-visual-dither]')!.textContent = `DITH ${String(Math.round(highs * 99)).padStart(2, '0')}`;
  root.querySelector<HTMLElement>('[data-s9-visual-motion]')!.textContent = `MOT ${String(Math.round(mids * 99)).padStart(2, '0')}`;
  root.querySelector<HTMLElement>('[data-s9-visual-feedback]')!.textContent = `FDBK ${String(Math.round(bass * 99)).padStart(2, '0')}`;
  root.querySelector<HTMLElement>('[data-s9-visual-glitch]')!.textContent = `GLT ${String(Math.round(transient * 99)).padStart(2, '0')}`;
  root.querySelector<HTMLElement>('[data-s9-visual-brightness]')!.textContent = `BRT ${String(Math.round(highs * 99)).padStart(2, '0')}`;
  root.querySelector<HTMLElement>('[data-s9-hud-time]')!.textContent = new Date().toLocaleTimeString([], { hour12: false });
  root.querySelector<HTMLElement>('[data-s9-hud-signal]')!.textContent = `${Math.min(99, signal)}%`;
  root.querySelector<HTMLElement>('[data-s9-hud-cpu]')!.textContent = `${Math.min(99, cpu)}%`;
  root.querySelector<HTMLElement>('[data-s9-hud-fps]')!.textContent = String(Math.max(0, fps));
  root.querySelector<HTMLElement>('[data-s9-hud-echo]')!.textContent =
    state.discoveredCharacters.length > 0 ? 'LOCKED' : state.aiStatus === 'thinking' ? 'TRACE' : 'LISTENING';

  updateAsciiWaveform(root, {
    amplitude,
    bass,
    mids,
    highs,
    transient,
    waveform: analysis.waveform,
    stereo: analysis.stereo,
    playing: snapshot?.playing,
    transmissionQuality: analysis.transmissionQuality,
    phase,
    reducedMotion,
  });
  updateAsciiNetworkMap(root, {
    location: state.currentLocation,
    networkStatus: state.networkStatus,
    packetActivity: Math.min(1, amplitude + transient),
    phase,
    reducedMotion,
  });
  updateAsciiGlobe(root, {
    networkStatus: state.networkStatus,
    broadcastStatus: state.broadcastStatus,
    phase,
    reducedMotion,
  });
  updateAsciiSpectrum(root, {
    bass,
    mids,
    highs,
    transient,
    peak: analysis.peak,
    rms: analysis.rms,
    signalStrength: analysis.signalStrength,
    frequencyBins: analysis.frequencyBins,
    phase,
    reducedMotion,
  });
  updateAsciiTelemetryBars(root, {
    bars: [
      { label: 'peak', value: peak / 99 },
      { label: 'rms', value: rms / 99 },
      { label: 'bass', value: bass },
      { label: 'mid', value: mids },
      { label: 'treb', value: highs },
    ],
  });
  updateAsciiSignalMeter(root, 'broadcast', {
    label: 'Broadcast',
    value: signal / 100,
  });
  updateAsciiSignalMeter(root, 'packet', {
    label: 'Packet',
    value: Math.min(1, amplitude + transient * 0.8 + (state.aiStatus === 'thinking' ? 0.2 : 0)),
    variant: 'inline',
  });
  updateAsciiPortrait(root, {
    callsign: state.discoveredCharacters[0]?.callsign,
    status:
      state.networkStatus === 'offline'
        ? 'offline'
        : state.discoveredCharacters.length > 0
          ? 'locked'
          : state.aiStatus === 'thinking'
            ? 'trace'
            : 'listening',
    interference: Math.min(1, transient + (state.networkStatus === 'degraded' ? 0.35 : 0)),
    phase,
    reducedMotion,
  });
}

export function mountBroadcastTerminal(root: HTMLElement): () => void {
  root.innerHTML = renderShell();
  bindLocalRadioDeck(root);
  void initLocalRadioDeck(root);
  const unmountVisualEngine = mountAsciiVisualEngineViewport(root);
  bindCollapsiblePanels(root);
  bindChoiceHandlers(root);

  const form = root.querySelector<HTMLFormElement>('[data-s9-chat-form]');
  const input = root.querySelector<HTMLInputElement>('[data-s9-chat-input]');
  input?.focus();

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input?.value ?? '';
    if (input) input.value = '';
    void submitInput(root, value);
  });

  const unsubscribe = broadcastGameState.subscribe(() => {
    syncActiveDeckTrackFromGameState();
    patchDom(root);
  });
  const telemetryTimer = window.setInterval(() => updateLiveTelemetry(root), 250);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === '/' && document.activeElement !== input) {
      event.preventDefault();
      input?.focus();
    }
  };
  window.addEventListener('keydown', onKeyDown);
  scrollChatToBottom(root);
  updateLiveTelemetry(root);

  return () => {
    unmountVisualEngine();
    window.clearInterval(telemetryTimer);
    window.removeEventListener('keydown', onKeyDown);
    unsubscribe();
    root.innerHTML = '';
  };
}
