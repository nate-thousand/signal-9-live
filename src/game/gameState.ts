import type {
  BroadcastGameState,
  BroadcastGameStatePatch,
  CharacterFile,
  ConversationTurn,
  LoreEntry,
} from './types.js';

const STORAGE_KEY = 'signal9-broadcast-state-v1';

function createInitialState(): BroadcastGameState {
  return {
    currentLocation: 'Sector 9 Relay',
    currentMission: 'Establish uplink',
    currentTrack: 'broadcast',
    currentMood: 'tense',
    currentVisualPreset: 'broadcast',
    currentAsciiPreset: 'broadcast',
    backgroundVideo: 'organic-vs-synthetic-2',
    backgroundImage: '',
    unlockedLore: [
      {
        id: 'lore-welcome',
        title: 'Operator Brief',
        body: 'Signal 9 is an underground resistance broadcast network. Use the terminal to navigate the grid.',
        category: 'transmission',
        unlockedAt: new Date().toISOString(),
      },
    ],
    discoveredCharacters: [],
    inventory: [],
    conversationHistory: [
      {
        role: 'system',
        text: 'SIGNAL 9 NETWORK ONLINE — AWAITING OPERATOR INPUT',
        timestamp: new Date().toISOString(),
      },
    ],
    availableChoices: ['Scan the perimeter', 'Open a secure channel', 'Review archive'],
    networkStatus: 'online',
    broadcastStatus: 'standby',
    aiStatus: 'ready',
    systemMessage: 'Terminal armed',
  };
}

function loadPersistedState(): BroadcastGameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BroadcastGameState;
  } catch {
    return null;
  }
}

function persistState(state: BroadcastGameState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Quota or private mode — non-fatal
  }
}

type Listener = (state: BroadcastGameState) => void;

class BroadcastGameStateStore {
  private state: BroadcastGameState;
  private readonly listeners = new Set<Listener>();

  constructor() {
    this.state = loadPersistedState() ?? createInitialState();
  }

  getState(): BroadcastGameState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  patch(patch: BroadcastGameStatePatch): void {
    this.state = { ...this.state, ...patch };
    persistState(this.state);
    this.emit();
  }

  appendConversation(turn: ConversationTurn): void {
    this.patch({
      conversationHistory: [...this.state.conversationHistory, turn],
    });
  }

  unlockLore(entries: Omit<LoreEntry, 'unlockedAt'>[]): void {
    const existing = new Set(this.state.unlockedLore.map((e) => e.id));
    const fresh = entries
      .filter((e) => !existing.has(e.id))
      .map((e) => ({ ...e, unlockedAt: new Date().toISOString() }));
    if (fresh.length === 0) return;
    this.patch({ unlockedLore: [...this.state.unlockedLore, ...fresh] });
  }

  discoverCharacters(chars: Omit<CharacterFile, 'discoveredAt'>[]): void {
    const existing = new Set(this.state.discoveredCharacters.map((c) => c.id));
    const fresh = chars
      .filter((c) => !existing.has(c.id))
      .map((c) => ({ ...c, discoveredAt: new Date().toISOString() }));
    if (fresh.length === 0) return;
    this.patch({ discoveredCharacters: [...this.state.discoveredCharacters, ...fresh] });
  }

  reset(): void {
    this.state = createInitialState();
    persistState(this.state);
    this.emit();
  }

  private emit(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export const broadcastGameState = new BroadcastGameStateStore();
