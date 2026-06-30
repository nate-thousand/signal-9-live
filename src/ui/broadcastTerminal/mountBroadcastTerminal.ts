import { applyBroadcastResponse } from '../../ai/applyBroadcastResponse.js';
import { sendBroadcastChat } from '../../ai/chatClient.js';
import {
  SIGNAL_9_PRESET_TRACK_LIST,
  type Signal9PresetTrackId,
} from '../../audio/transmissionTracks.js';
import { broadcastGameState } from '../../game/gameState.js';
import type { CharacterFile, ConversationTurn, LoreEntry } from '../../game/types.js';
import { applySignal9Preset } from '../../platform/applySignal9Preset.js';
import { getSignal9Mp3Adapter } from '../../platform/signal9SoundIntegration.js';
import { getSignal9VisualAdapter } from '../../platform/signal9VisualIntegration.js';
import {
  startTransmissionSession,
  stopTransmissionSession,
} from '../../platform/transmissionSession.js';
import {
  pauseVideoTransmission,
  playVideoTransmission,
  restartVideoTransmission,
} from '../../platform/videoAsciiSession.js';

type RadioSource = 'local' | 'mixcloud' | 'soundcloud' | 'relay';

let radioSource: RadioSource = 'local';

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

function activeTrackLabel(trackId: string): string {
  return SIGNAL_9_PRESET_TRACK_LIST.find((track) => track.id === trackId)?.track ?? trackId;
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

function sourceLabel(source: RadioSource): string {
  switch (source) {
    case 'mixcloud':
      return 'MIXCLOUD RELAY';
    case 'soundcloud':
      return 'SOUNDCLOUD RELAY';
    case 'relay':
      return 'OPEN STREAM';
    default:
      return 'LOCAL TAPE';
  }
}

function renderSpectrumBars(count = 24): string {
  return Array.from({ length: count }, (_, index) => {
    const height = 18 + ((index * 17) % 54);
    return `<i style="--s9-bar:${height}%"></i>`;
  }).join('');
}

function renderWaveformTicks(count = 44): string {
  return Array.from({ length: count }, (_, index) => {
    const height = 22 + ((index * 23) % 72);
    return `<i style="--s9-wave:${height}%"></i>`;
  }).join('');
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
  return `
    <header class="s9-broadcast__header" data-s9-broadcast-status>
      <span class="s9-broadcast__brand">SIGNAL 9 // RESISTANCE OPERATING TERMINAL</span>
      <span class="s9-broadcast__header-stat" data-s9-stat="mission">${escapeHtml(s.currentMission)}</span>
      <span class="s9-broadcast__header-stat" data-s9-stat="location">${escapeHtml(s.currentLocation)}</span>
      <span class="s9-broadcast__header-stat s9-broadcast__stat--${s.networkStatus}" data-s9-stat="network">NET ${s.networkStatus.toUpperCase()}</span>
      <span class="s9-broadcast__header-stat s9-broadcast__stat--${s.broadcastStatus}" data-s9-stat="broadcast">TX ${s.broadcastStatus.toUpperCase()}</span>
    </header>
  `;
}

function renderRadioPanel(): string {
  const s = broadcastGameState.getState();
  const adapter = getSignal9Mp3Adapter();
  const snapshot = adapter?.getPlaybackSnapshot();
  const playing = snapshot?.playing ?? false;
  const duration = snapshot?.duration ?? 0;
  const currentTime = snapshot?.currentTime ?? 0;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const volume = Math.round((snapshot?.volume ?? 1) * 100);
  return `
    <aside class="s9-broadcast__panel s9-broadcast__radio" data-s9-broadcast-radio>
      <div class="s9-broadcast__panel-chrome">
        <h2 class="s9-broadcast__panel-title">SIGNAL 9 RADIO</h2>
        <span class="s9-broadcast__panel-state" data-s9-radio-state>${playing ? 'ON AIR' : 'STANDBY'}</span>
      </div>

      <div class="s9-radio__art" aria-hidden="true">
        <div class="s9-radio__art-grid"></div>
        <span>S9</span>
      </div>

      <p class="s9-radio__source" data-s9-radio-source>${sourceLabel(radioSource)}</p>
      <p class="s9-radio__track" data-s9-deck-track>${escapeHtml(activeTrackLabel(s.currentTrack))}</p>
      <p class="s9-radio__meta">FREQ <span data-s9-radio-frequency>${frequencyForTrack(s.currentTrack)}</span> FM // MOOD <span data-s9-deck-mood>${escapeHtml(s.currentMood)}</span></p>

      <div class="s9-radio__waveform" data-s9-waveform aria-hidden="true">${renderWaveformTicks()}</div>
      <div class="s9-radio__progress" aria-label="Playback progress">
        <span data-s9-radio-progress style="inline-size:${progress}%"></span>
      </div>
      <div class="s9-radio__time">
        <span data-s9-radio-time>${formatTime(currentTime)}</span>
        <span data-s9-radio-duration>${formatTime(duration)}</span>
      </div>

      <div class="s9-radio__spectrum" data-s9-spectrum aria-hidden="true">${renderSpectrumBars()}</div>

      <div class="s9-radio__controls">
        <button type="button" class="s9-broadcast__btn" data-s9-deck="play" aria-pressed="${playing}">${playing ? 'STOP' : 'PLAY'}</button>
        <button type="button" class="s9-broadcast__btn" data-s9-deck="restart">RST</button>
      </div>

      <label class="s9-radio__field">
        <span>TRACK</span>
        <select data-s9-radio-preset>
          ${SIGNAL_9_PRESET_TRACK_LIST.map((track) => `<option value="${track.id}" ${track.id === s.currentTrack ? 'selected' : ''}>${track.label}</option>`).join('')}
        </select>
      </label>

      <label class="s9-radio__field">
        <span>SOURCE</span>
        <select data-s9-radio-source-select>
          <option value="local" ${radioSource === 'local' ? 'selected' : ''}>Local Soundtrack</option>
          <option value="mixcloud" ${radioSource === 'mixcloud' ? 'selected' : ''}>Mixcloud</option>
          <option value="soundcloud" ${radioSource === 'soundcloud' ? 'selected' : ''}>SoundCloud</option>
          <option value="relay" ${radioSource === 'relay' ? 'selected' : ''}>Streaming Radio</option>
        </select>
      </label>

      <label class="s9-radio__volume">
        <span>VOL <b data-s9-radio-volume>${volume}</b></span>
        <input data-s9-radio-volume-input type="range" min="0" max="100" value="${volume}" />
      </label>
    </aside>
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
    <section class="s9-broadcast__mission" data-s9-broadcast-lore>
      <div class="s9-broadcast__mini-panel">
        <h2 class="s9-broadcast__panel-title">MISSION CONSOLE</h2>
        <p class="s9-broadcast__objective" data-s9-objective>${escapeHtml(s.currentMission)}</p>
      </div>
      <div class="s9-broadcast__mini-panel">
        <h3 class="s9-broadcast__subhead">Memory Nodes</h3>
      <ul class="s9-broadcast__lore-list" data-s9-lore-list>${lore || '<li class="s9-broadcast__empty">—</li>'}</ul>
      </div>
      <div class="s9-broadcast__mini-panel">
        <h3 class="s9-broadcast__subhead">Echo Files</h3>
      <ul class="s9-broadcast__char-list" data-s9-char-list>${chars || '<li class="s9-broadcast__empty">—</li>'}</ul>
      </div>
    </section>
  `;
}

function renderVisualizerFrame(): string {
  const s = broadcastGameState.getState();
  return `
    <section class="s9-broadcast__visual" data-s9-broadcast-center aria-label="ASCII visual engine">
      <div class="s9-broadcast__visual-chrome">
        <span>ASCII VISUAL ENGINE</span>
        <span data-s9-footer-visual>VIS ${escapeHtml(s.currentVisualPreset)}</span>
        <span data-s9-footer-ascii>ASCII ${escapeHtml(s.currentAsciiPreset)}</span>
      </div>
      <div class="s9-broadcast__visual-reticle" aria-hidden="true"></div>
      <div class="s9-broadcast__visual-telemetry" aria-hidden="true">
        <span>THRESHOLD</span>
        <span>DITHER</span>
        <span>FREQ SCAN</span>
        <span>PACKET ACTIVITY</span>
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
        ${renderRadioPanel()}
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

function patchDom(root: HTMLElement): void {
  const s = broadcastGameState.getState();
  root.querySelector<HTMLElement>('[data-s9-stat="location"]')!.textContent = s.currentLocation;
  root.querySelector<HTMLElement>('[data-s9-stat="mission"]')!.textContent = s.currentMission;
  root.querySelector<HTMLElement>('[data-s9-objective]')!.textContent = s.currentMission;
  root.querySelector<HTMLElement>('[data-s9-deck-track]')!.textContent = activeTrackLabel(s.currentTrack);
  root.querySelector<HTMLElement>('[data-s9-deck-mood]')!.textContent = s.currentMood;
  root.querySelector<HTMLElement>('[data-s9-radio-frequency]')!.textContent = frequencyForTrack(s.currentTrack);
  const presetSelect = root.querySelector<HTMLSelectElement>('[data-s9-radio-preset]');
  if (presetSelect && s.currentTrack !== 'blackout') presetSelect.value = s.currentTrack;
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
  root.querySelector<HTMLElement>('[data-s9-hud-frequency]')!.textContent = `${frequencyForTrack(s.currentTrack)} FM`;
  root.querySelector<HTMLElement>('[data-s9-hud-memory]')!.textContent = String(s.unlockedLore.length);
  root.querySelector<HTMLElement>('[data-s9-hud-broadcast]')!.textContent = s.broadcastStatus.toUpperCase();
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

function bindDeckControls(root: HTMLElement): void {
  root.querySelector<HTMLButtonElement>('[data-s9-deck="play"]')?.addEventListener('click', () => {
    const adapter = getSignal9Mp3Adapter();
    if (!adapter) return;
    const playing = adapter.getStatus().playing;
    if (playing) {
      void stopTransmissionSession().then(() => pauseVideoTransmission());
    } else {
      void startTransmissionSession().then(() => playVideoTransmission());
    }
    broadcastGameState.patch({ broadcastStatus: playing ? 'standby' : 'live' });
    patchDom(root);
  });

  root.querySelector<HTMLButtonElement>('[data-s9-deck="restart"]')?.addEventListener('click', () => {
    void restartVideoTransmission().then(() => startTransmissionSession());
    broadcastGameState.patch({ broadcastStatus: 'live' });
  });

  root.querySelector<HTMLSelectElement>('[data-s9-radio-preset]')?.addEventListener('change', (event) => {
    const select = event.currentTarget as HTMLSelectElement | null;
    if (!select) return;
    const presetId = select.value as Signal9PresetTrackId;
    const instrumentRoot = document.querySelector<HTMLElement>('[data-s9-instrument-layer]');
    if (!instrumentRoot) return;
    void applySignal9Preset(instrumentRoot, presetId).then(() => {
      broadcastGameState.patch({
        currentTrack: presetId,
        currentMood: presetId === 'interference' ? 'unstable' : presetId === 'jammer' ? 'hostile' : presetId === 'uplink' ? 'focused' : 'tense',
        broadcastStatus: getSignal9Mp3Adapter()?.getStatus().playing ? 'live' : 'standby',
        systemMessage: `Radio preset loaded: ${activeTrackLabel(presetId)}`,
      });
    });
  });

  root.querySelector<HTMLSelectElement>('[data-s9-radio-source-select]')?.addEventListener('change', (event) => {
    const select = event.currentTarget as HTMLSelectElement | null;
    if (!select) return;
    radioSource = select.value as RadioSource;
    root.querySelector<HTMLElement>('[data-s9-radio-source]')!.textContent = sourceLabel(radioSource);
    broadcastGameState.appendConversation({
      role: 'system',
      text:
        radioSource === 'local'
          ? 'LOCAL SOUNDTRACK PATCHED INTO SIGNAL CHAIN'
          : `${sourceLabel(radioSource)} SOURCE SELECTED — AWAITING OPERATOR CREDENTIALS`,
      timestamp: new Date().toISOString(),
    });
  });

  root.querySelector<HTMLInputElement>('[data-s9-radio-volume-input]')?.addEventListener('input', (event) => {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    const value = Number(input.value);
    getSignal9Mp3Adapter()?.setVolume(value / 100);
    root.querySelector<HTMLElement>('[data-s9-radio-volume]')!.textContent = String(value);
  });
}

function updateLiveTelemetry(root: HTMLElement): void {
  const adapter = getSignal9Mp3Adapter();
  const visual = getSignal9VisualAdapter();
  const state = broadcastGameState.getState();
  const snapshot = adapter?.getPlaybackSnapshot();
  const features = adapter?.getAudioFeatures();
  const status = adapter?.getStatus();
  const visualStatus = visual?.getStatus();
  const progress = snapshot && snapshot.duration > 0 ? Math.min(100, (snapshot.currentTime / snapshot.duration) * 100) : 0;
  const signal = Math.round(58 + (features?.amplitude ?? 0) * 28 + (features?.bass ?? 0) * 14);
  const cpu = Math.round(14 + (features?.amplitude ?? 0) * 18 + (features?.transient ?? 0) * 11);
  const fps = Math.round(visualStatus?.fps ?? 60);

  root.querySelector<HTMLElement>('[data-s9-radio-state]')!.textContent = status?.playing ? 'ON AIR' : 'STANDBY';
  root.querySelector<HTMLButtonElement>('[data-s9-deck="play"]')!.textContent = status?.playing ? 'STOP' : 'PLAY';
  root.querySelector<HTMLButtonElement>('[data-s9-deck="play"]')!.setAttribute('aria-pressed', status?.playing ? 'true' : 'false');
  root.querySelector<HTMLElement>('[data-s9-radio-progress]')!.style.inlineSize = `${progress}%`;
  root.querySelector<HTMLElement>('[data-s9-radio-time]')!.textContent = formatTime(snapshot?.currentTime ?? 0);
  root.querySelector<HTMLElement>('[data-s9-radio-duration]')!.textContent = formatTime(snapshot?.duration ?? 0);
  root.querySelector<HTMLElement>('[data-s9-hud-time]')!.textContent = new Date().toLocaleTimeString([], { hour12: false });
  root.querySelector<HTMLElement>('[data-s9-hud-signal]')!.textContent = `${Math.min(99, signal)}%`;
  root.querySelector<HTMLElement>('[data-s9-hud-cpu]')!.textContent = `${Math.min(99, cpu)}%`;
  root.querySelector<HTMLElement>('[data-s9-hud-fps]')!.textContent = String(Math.max(0, fps));
  root.querySelector<HTMLElement>('[data-s9-hud-echo]')!.textContent =
    state.discoveredCharacters.length > 0 ? 'LOCKED' : state.aiStatus === 'thinking' ? 'TRACE' : 'LISTENING';

  const bars = root.querySelectorAll<HTMLElement>('[data-s9-spectrum] i');
  bars.forEach((bar, index) => {
    const base = index % 3 === 0 ? features?.bass : index % 3 === 1 ? features?.mids : features?.highs;
    const height = 10 + (base ?? 0.08) * 82 + ((index * 7) % 10);
    bar.style.setProperty('--s9-bar', `${Math.min(96, height)}%`);
  });

  const ticks = root.querySelectorAll<HTMLElement>('[data-s9-waveform] i');
  ticks.forEach((tick, index) => {
    const height = 18 + (features?.amplitude ?? 0.1) * 62 + Math.sin(Date.now() / 180 + index) * 16;
    tick.style.setProperty('--s9-wave', `${Math.max(8, Math.min(92, height))}%`);
  });
}

export function mountBroadcastTerminal(root: HTMLElement): () => void {
  root.innerHTML = renderShell();
  bindDeckControls(root);
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

  const unsubscribe = broadcastGameState.subscribe(() => patchDom(root));
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
    window.clearInterval(telemetryTimer);
    window.removeEventListener('keydown', onKeyDown);
    unsubscribe();
    root.innerHTML = '';
  };
}
