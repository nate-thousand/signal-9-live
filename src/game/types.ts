import type { Signal9PresetTrackId } from '../audio/transmissionTracks.js';

/** Conversation turn in the broadcast terminal */
export interface ConversationTurn {
  role: 'player' | 'narrator' | 'system';
  text: string;
  timestamp: string;
}

/** Unlocked lore entry surfaced in the right panel */
export interface LoreEntry {
  id: string;
  title: string;
  body: string;
  category: 'transmission' | 'document' | 'archive' | 'faction' | 'location' | 'mission';
  unlockedAt: string;
}

/** Discovered character file */
export interface CharacterFile {
  id: string;
  callsign: string;
  role: string;
  summary: string;
  faction?: string;
  discoveredAt: string;
}

/** Inventory item — future-ready hook */
export interface InventoryItem {
  id: string;
  label: string;
  quantity: number;
}

/**
 * Typed broadcast game state — single source of truth for the terminal.
 * Loop phases, attributes, skills, roll state, and mission flags: docs/CHAT_GAME_LOOP.md
 */
export interface BroadcastGameState {
  currentLocation: string;
  currentMission: string;
  currentTrack: Signal9PresetTrackId | 'blackout';
  currentMood: string;
  currentVisualPreset: string;
  currentAsciiPreset: string;
  backgroundVideo: string;
  backgroundImage: string;
  unlockedLore: LoreEntry[];
  discoveredCharacters: CharacterFile[];
  inventory: InventoryItem[];
  conversationHistory: ConversationTurn[];
  availableChoices: string[];
  networkStatus: 'online' | 'degraded' | 'offline';
  broadcastStatus: 'live' | 'standby' | 'jamming';
  aiStatus: 'ready' | 'thinking' | 'error';
  systemMessage: string;
}

export type BroadcastGameStatePatch = Partial<BroadcastGameState>;
