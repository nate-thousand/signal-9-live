import { applyBroadcastResponse } from '../../ai/applyBroadcastResponse.js';
import { sendBroadcastChat } from '../../ai/chatClient.js';
import { broadcastGameState } from '../../game/gameState.js';
import type { CharacterFile, ConversationTurn, LoreEntry } from '../../game/types.js';
import { getSignal9Mp3Adapter } from '../../platform/signal9SoundIntegration.js';
import {
  pauseVideoTransmission,
  playVideoTransmission,
  restartVideoTransmission,
} from '../../platform/videoAsciiSession.js';

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

function renderHistory(): string {
  const { conversationHistory } = broadcastGameState.getState();
  return conversationHistory
    .slice(-40)
    .map(
      (turn: ConversationTurn) =>
        `<p class="s9-broadcast-chat__line ${roleClass(turn.role)}"><span class="s9-broadcast-chat__role">${turn.role === 'player' ? 'OP' : turn.role === 'narrator' ? 'GHOST' : 'SYS'}</span> ${escapeHtml(turn.text)}</p>`,
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
    <header class="s9-broadcast__status" data-s9-broadcast-status>
      <span class="s9-broadcast__brand">SIGNAL 9</span>
      <span class="s9-broadcast__stat" data-s9-stat="location">${escapeHtml(s.currentLocation)}</span>
      <span class="s9-broadcast__stat" data-s9-stat="mission">${escapeHtml(s.currentMission)}</span>
      <span class="s9-broadcast__stat s9-broadcast__stat--${s.networkStatus}" data-s9-stat="network">NET ${s.networkStatus.toUpperCase()}</span>
      <span class="s9-broadcast__stat s9-broadcast__stat--${s.broadcastStatus}" data-s9-stat="broadcast">TX ${s.broadcastStatus.toUpperCase()}</span>
    </header>
  `;
}

function renderDeck(): string {
  const s = broadcastGameState.getState();
  const adapter = getSignal9Mp3Adapter();
  const playing = adapter?.getStatus().playing ?? false;
  return `
    <aside class="s9-broadcast__deck" data-s9-broadcast-deck>
      <h2 class="s9-broadcast__panel-title">BROADCAST DECK</h2>
      <p class="s9-broadcast__deck-track" data-s9-deck-track>${escapeHtml(s.currentTrack)}</p>
      <div class="s9-broadcast__deck-controls">
        <button type="button" class="s9-broadcast__btn" data-s9-deck="play" aria-pressed="${playing}">${playing ? '■ STOP' : '▶ TX'}</button>
        <button type="button" class="s9-broadcast__btn" data-s9-deck="restart">↻ RST</button>
      </div>
      <p class="s9-broadcast__deck-meta">Mood: <span data-s9-deck-mood>${escapeHtml(s.currentMood)}</span></p>
      <p class="s9-broadcast__deck-hint">Full controls in MENU ↓</p>
    </aside>
  `;
}

function renderLorePanel(): string {
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
    <aside class="s9-broadcast__lore" data-s9-broadcast-lore>
      <h2 class="s9-broadcast__panel-title">MISSION / LORE</h2>
      <p class="s9-broadcast__objective" data-s9-objective>${escapeHtml(s.currentMission)}</p>
      <h3 class="s9-broadcast__subhead">Transmissions</h3>
      <ul class="s9-broadcast__lore-list" data-s9-lore-list>${lore || '<li class="s9-broadcast__empty">—</li>'}</ul>
      <h3 class="s9-broadcast__subhead">Characters</h3>
      <ul class="s9-broadcast__char-list" data-s9-char-list>${chars || '<li class="s9-broadcast__empty">—</li>'}</ul>
    </aside>
  `;
}

function renderFooter(): string {
  const s = broadcastGameState.getState();
  return `
    <footer class="s9-broadcast__footer" data-s9-broadcast-footer>
      <span data-s9-footer-track>♫ ${escapeHtml(s.currentTrack)}</span>
      <span data-s9-footer-visual>VIS ${escapeHtml(s.currentVisualPreset)}</span>
      <span data-s9-footer-ascii>ASCII ${escapeHtml(s.currentAsciiPreset)}</span>
      <span data-s9-footer-system>${escapeHtml(s.systemMessage)}</span>
      <span class="s9-broadcast__ai-status s9-broadcast__ai-status--${s.aiStatus}" data-s9-footer-ai>AI ${s.aiStatus.toUpperCase()}</span>
    </footer>
  `;
}

function renderShell(): string {
  return `
    <div class="s9-broadcast" data-s9-broadcast-terminal>
      ${renderStatusBar()}
      <div class="s9-broadcast__body">
        ${renderDeck()}
        <div class="s9-broadcast__center" data-s9-broadcast-center aria-hidden="true"></div>
        ${renderLorePanel()}
      </div>
      <section class="s9-broadcast__chat" data-s9-broadcast-chat aria-label="Command terminal">
        <div class="s9-broadcast-chat__history" data-s9-chat-history role="log">${renderHistory()}</div>
        <form class="s9-broadcast-chat__form" data-s9-chat-form>
          <label class="s9-terminal__input-row s9-broadcast-chat__input-row">
            <span class="s9-terminal__prompt">&gt;</span>
            <input class="s9-terminal__input s9-broadcast-chat__input" data-s9-chat-input type="text" placeholder="transmit..." spellcheck="false" autocomplete="off" />
          </label>
        </form>
        <div class="s9-broadcast__choices" data-s9-choices>${renderChoices()}</div>
      </section>
      ${renderFooter()}
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
  root.querySelector<HTMLElement>('[data-s9-deck-track]')!.textContent = s.currentTrack;
  root.querySelector<HTMLElement>('[data-s9-deck-mood]')!.textContent = s.currentMood;
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
  root.querySelector<HTMLElement>('[data-s9-footer-track]')!.textContent = `♫ ${s.currentTrack}`;
  root.querySelector<HTMLElement>('[data-s9-footer-visual]')!.textContent = `VIS ${s.currentVisualPreset}`;
  root.querySelector<HTMLElement>('[data-s9-footer-ascii]')!.textContent = `ASCII ${s.currentAsciiPreset}`;
  root.querySelector<HTMLElement>('[data-s9-footer-system]')!.textContent = s.systemMessage;
  const aiEl = root.querySelector<HTMLElement>('[data-s9-footer-ai]');
  if (aiEl) {
    aiEl.textContent = `AI ${s.aiStatus.toUpperCase()}`;
    aiEl.className = `s9-broadcast__ai-status s9-broadcast__ai-status--${s.aiStatus}`;
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
      void adapter.stop();
      void pauseVideoTransmission();
    } else {
      void adapter.start();
      void playVideoTransmission();
    }
    patchDom(root);
  });

  root.querySelector<HTMLButtonElement>('[data-s9-deck="restart"]')?.addEventListener('click', () => {
    void restartVideoTransmission();
    const adapter = getSignal9Mp3Adapter();
    if (adapter && !adapter.getStatus().playing) void adapter.start();
  });
}

export function mountBroadcastTerminal(root: HTMLElement): () => void {
  root.innerHTML = renderShell();
  bindDeckControls(root);
  bindChoiceHandlers(root);

  const form = root.querySelector<HTMLFormElement>('[data-s9-chat-form]');
  const input = root.querySelector<HTMLInputElement>('[data-s9-chat-input]');

  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = input?.value ?? '';
    if (input) input.value = '';
    void submitInput(root, value);
  });

  const unsubscribe = broadcastGameState.subscribe(() => patchDom(root));
  scrollChatToBottom(root);

  return () => {
    unsubscribe();
    root.innerHTML = '';
  };
}
