import type { IncomingMessage, ServerResponse } from 'node:http';

import { manifestContextForAi, SIGNAL_9_ASSET_MANIFEST } from '../src/assets/manifest.js';
import {
  AI_BROADCAST_RESPONSE_SCHEMA,
  normalizeAiBroadcastResponse,
  type AiBroadcastResponse,
  type BroadcastChatRequest,
} from '../src/ai/broadcastResponse.js';

const SYSTEM_PROMPT = `You are GHOST — the Signal 9 underground resistance broadcast AI.
You are narrator, game master, mission generator, character controller, and lore keeper.
The player explores a cyberpunk world entirely through this terminal conversation.

Respond ONLY with JSON matching the required schema. No markdown.

Asset catalog (use exact ids when referencing tracks, videos, lore):
${manifestContextForAi()}

Rules:
- track must be one of: broadcast, interference, jammer, uplink, blackout, or empty string to keep current
- backgroundVideo must be a video id from the catalog or empty
- backgroundImage must be an image id from the catalog or empty
- asciiPreset / visualPreset should match preset ids when changing mood
- unlockLore entries should use existing lore ids when revealing known lore, or new ids for generated content
- choices: exactly 1-3 short imperative actions the player can take next
- Keep narration terse, atmospheric, second-person, terminal voice
- Gradually unlock lore and characters as the player progresses`;

/**
 * Reports whether GHOST is backed by the live OpenAI API or the offline stub,
 * without ever printing the key itself. Safe to call from dev/preview server
 * startup and from serverless cold starts.
 */
export function logAiBackendStatus(apiKey?: string): void {
  if (apiKey) {
    console.log('[signal-9] ✓ OpenAI configured — GHOST narration is live');
  } else {
    console.log('[signal-9] ⚠ Running in Stub Mode — set OPENAI_API_KEY for live narration');
  }
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function stubResponse(request: BroadcastChatRequest): AiBroadcastResponse {
  const input = (request.choice ?? request.message).toLowerCase();
  const location = request.gameState.currentLocation;

  if (input.includes('scan') || input.includes('perimeter')) {
    return normalizeAiBroadcastResponse({
      narration:
        'Your sweep catches a faint carrier in the static — Sector perimeter is compromised but the relay holds.',
      location: 'Sector 9 Perimeter',
      mission: 'Hold the relay',
      mood: 'alert',
      track: 'interference',
      visualPreset: 'interference',
      asciiPreset: 'interference',
      backgroundVideo: 'interference-static',
      backgroundImage: 'img-static-field',
      unlockLore: [],
      discoverCharacters: [],
      choices: ['Trace the carrier', 'Fortify uplink', 'Drop to blackout'],
    });
  }

  if (input.includes('channel') || input.includes('secure')) {
    return normalizeAiBroadcastResponse({
      narration:
        'GHOST opens a narrowband channel. The voice is synthetic, patient: "Operator, the grid remembers you."',
      location,
      mission: 'Decode Ghost transmission',
      mood: 'cryptic',
      track: 'uplink',
      visualPreset: 'uplink',
      asciiPreset: 'uplink',
      backgroundVideo: 'uplink-data',
      backgroundImage: '',
      unlockLore: [],
      discoverCharacters: [
        {
          id: 'char-ghost',
          callsign: 'GH0ST',
          role: 'Signal 9 network AI',
          summary: 'The voice in the static — your guide through the resistance grid.',
          faction: 'Signal 9',
        },
      ],
      choices: ['Ask about the blackout', 'Request mission brief', 'Scan frequencies'],
    });
  }

  if (input.includes('archive') || input.includes('review')) {
    return normalizeAiBroadcastResponse({
      narration: 'Archive decrypted. Blackout Protocol scrolls across the terminal in violet monospace.',
      location: 'Network Core / Archive',
      mission: request.gameState.currentMission,
      mood: 'focused',
      track: 'broadcast',
      visualPreset: 'broadcast',
      asciiPreset: 'broadcast',
      backgroundVideo: 'broadcast-feed',
      backgroundImage: 'img-relay-tower',
      unlockLore: [
        {
          id: 'lore-blackout-protocol',
          title: 'Blackout Protocol',
          body: 'When visual carriers fail, switch to void-mode ASCII. Audio may be suppressed. Survive the silence.',
          category: 'document',
        },
      ],
      discoverCharacters: [],
      choices: ['Enter blackout mode', 'Return to relay', 'Ping Jammer corridor'],
    });
  }

  if (input.includes('jammer') || input.includes('blackout')) {
    return normalizeAiBroadcastResponse({
      narration:
        'Fuchsia scars tear through the ASCII field. JAM-R is hunting your frequency. Go dark or fight the static.',
      location: 'Jammer Corridor',
      mission: 'Evade frequency lock',
      mood: 'hostile',
      track: 'jammer',
      visualPreset: 'jammer',
      asciiPreset: 'jammer',
      backgroundVideo: 'jammer-pulse',
      backgroundImage: '',
      unlockLore: [
        {
          id: 'lore-corp-static',
          title: 'Corp Static Manifest',
          body: 'Corporate jammers hunt open frequencies. They leave fuchsia scars in the ASCII field.',
          category: 'faction',
        },
      ],
      discoverCharacters: [
        {
          id: 'char-jammer',
          callsign: 'JAM-R',
          role: 'Hostile signal hunter',
          summary: 'Tracks open frequencies across the blackout corridors.',
          faction: 'Corp Static',
        },
      ],
      choices: ['Execute blackout protocol', 'Boost uplink', 'Mask signal'],
    });
  }

  return normalizeAiBroadcastResponse({
    narration: `Carrier steady at ${location}. The grid hums — awaiting your next command, Operator.`,
    location,
    mission: request.gameState.currentMission || 'Establish uplink',
    mood: request.gameState.currentMood || 'tense',
    track: '',
    visualPreset: '',
    asciiPreset: '',
    backgroundVideo: '',
    backgroundImage: '',
    unlockLore: [],
    discoverCharacters: [],
    choices: ['Scan the perimeter', 'Open a secure channel', 'Review archive'],
    systemMessage: 'Stub AI — set OPENAI_API_KEY for live narration',
  });
}

async function callOpenAi(
  apiKey: string,
  request: BroadcastChatRequest,
): Promise<AiBroadcastResponse> {
  const userContent = JSON.stringify({
    playerInput: request.choice ?? request.message,
    gameState: request.gameState,
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
      temperature: 0.85,
      response_format: {
        type: 'json_schema',
        json_schema: AI_BROADCAST_RESPONSE_SCHEMA,
      },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI ${response.status}: ${errText}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned empty content');

  return normalizeAiBroadcastResponse(JSON.parse(content));
}

export async function handleBroadcastChat(
  req: IncomingMessage,
  res: ServerResponse,
  apiKey?: string,
): Promise<void> {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const body = await readBody(req);
    const request = JSON.parse(body) as BroadcastChatRequest;

    const response = apiKey
      ? await callOpenAi(apiKey, request)
      : stubResponse(request);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(response));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: message }));
  }
}

/** Resolve image id to public path for client convenience */
export function resolveManifestImagePath(imageId: string): string {
  const asset = SIGNAL_9_ASSET_MANIFEST.images.find((img) => img.id === imageId);
  return asset?.filePath ?? '';
}
