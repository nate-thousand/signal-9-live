import { launchDefaultMission } from './missionBriefing.js';
import type { ScreenContext } from '../types.js';

/** Skipped — auto-launches transmission */
export function renderStartRunScreen(ctx: ScreenContext): void {
  const { root, navigate } = ctx;
  root.innerHTML = '';
  void launchDefaultMission(navigate);
}
