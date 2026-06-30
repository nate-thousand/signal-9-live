import type { AiBroadcastResponse, BroadcastChatRequest } from './broadcastResponse.js';
import { normalizeAiBroadcastResponse } from './broadcastResponse.js';
import { broadcastGameState } from '../game/gameState.js';

const CHAT_ENDPOINT = '/api/broadcast/chat';

function buildRequest(message: string, choice?: string): BroadcastChatRequest {
  const state = broadcastGameState.getState();
  return {
    message,
    choice,
    gameState: {
      currentLocation: state.currentLocation,
      currentMission: state.currentMission,
      currentTrack: state.currentTrack,
      currentMood: state.currentMood,
      unlockedLoreIds: state.unlockedLore.map((l) => l.id),
      discoveredCharacterIds: state.discoveredCharacters.map((c) => c.id),
      recentHistory: state.conversationHistory.slice(-8).map((t) => ({
        role: t.role,
        text: t.text,
      })),
    },
  };
}

export async function sendBroadcastChat(
  message: string,
  choice?: string,
): Promise<AiBroadcastResponse> {
  const payload = buildRequest(message, choice);

  const response = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(typeof err.error === 'string' ? err.error : 'Broadcast chat failed');
  }

  const data = await response.json();
  return normalizeAiBroadcastResponse(data);
}
