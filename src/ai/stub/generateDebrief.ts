import type { MissionDebrief, MissionRun } from '../types.js';

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Stub mission debrief generator.
 * Phase 4 will replace this with OpenAI structured output.
 */
export async function generateDebrief(run: MissionRun): Promise<MissionDebrief> {
  await delay(450);

  const grade = run.briefing.threatLevel === 'critical' ? 'A' : 'S';

  return {
    missionId: run.id,
    grade,
    summary: `Mission ${run.briefing.title} complete. Runner placeholder session logged. Audio-reactive bridge held through the run window.`,
    highlights: [
      `Threat level: ${run.briefing.threatLevel}`,
      `Beat profile: ${run.briefing.beatProfile}`,
      'Platform transport and reactive presets operational',
      'Full lane runner mechanics pending Phase 2',
    ],
    nextMissionHint:
      grade === 'S'
        ? 'Command recommends escalating to Emergency Glitch for the next sortie.'
        : 'Retry with tighter tempo lock before advancing threat level.',
    generatedBy: 'stub',
  };
}
