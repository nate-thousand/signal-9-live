import { generateBriefing } from '../../ai/index.js';
import { createMissionId, createMissionRun } from '../missionState.js';
import { startInstrumentTransmission } from '../../platform/instrumentBootstrap.js';
import type { MissionRun } from '../../ai/types.js';
import type { ScreenContext } from '../types.js';

/** Auto-launch transmission — no briefing modal */
export async function launchDefaultMission(
  navigate: ScreenContext['navigate'],
): Promise<MissionRun> {
  const briefing = await generateBriefing(createMissionId());
  const mission = createMissionRun(briefing);
  navigate('broadcast-terminal', mission);
  startInstrumentTransmission();
  return mission;
}

/** Legacy briefing screen — redirects immediately */
export function renderMissionBriefingScreen(ctx: ScreenContext): void {
  const { root, navigate } = ctx;
  root.innerHTML = '';
  void launchDefaultMission(navigate);
}
