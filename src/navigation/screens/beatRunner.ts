import type { ScreenContext } from '../types.js';
import { renderBroadcastTerminalScreen } from './broadcastTerminal.js';

/** Legacy screen id — delegates to the broadcast terminal */
export function renderBeatRunnerScreen(ctx: ScreenContext): void {
  renderBroadcastTerminalScreen(ctx);
}
