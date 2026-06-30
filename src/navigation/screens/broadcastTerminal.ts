import { mountBroadcastTerminal } from '../../ui/broadcastTerminal/mountBroadcastTerminal.js';
import { markMissionStarted } from '../missionState.js';
import { launchDefaultMission } from './missionBriefing.js';
import type { ScreenContext } from '../types.js';

/** AI-first broadcast console — primary post-entry experience */
export function renderBroadcastTerminalScreen(ctx: ScreenContext): void {
  const { root, navigate, mission } = ctx;

  if (!mission) {
    void launchDefaultMission(navigate);
    return;
  }

  markMissionStarted(mission);
  mountBroadcastTerminal(root);
}
