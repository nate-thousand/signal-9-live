import type { IncomingMessage, ServerResponse } from 'node:http';

import { handleBroadcastChat, logAiBackendStatus } from '../../server/broadcastChat.js';

// Runs once per cold start — confirms whether this deployment can reach the
// live OpenAI API without ever printing the key itself.
logAiBackendStatus(process.env.OPENAI_API_KEY);

/**
 * Vercel serverless Function for POST /api/broadcast/chat.
 *
 * Mirrors the Vite dev/preview middleware in `vite.config.ts` so the same
 * `handleBroadcastChat` request handler powers local development and the
 * deployed static build — no separate production-only logic. Reads
 * `OPENAI_API_KEY` from the Vercel project's Environment Variables; falls
 * back to the offline stub responder when it is unset.
 */
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  await handleBroadcastChat(req, res, process.env.OPENAI_API_KEY);
}
