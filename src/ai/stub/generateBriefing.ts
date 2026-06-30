import type { MissionBriefing } from '../types.js';

const STUB_BRIEFINGS: Omit<MissionBriefing, 'missionId' | 'generatedBy'>[] = [
  {
    title: 'Grid Breach at Sector 9',
    objective: 'Hold the pulse lane through three interference waves without dropping sync.',
    threatLevel: 'moderate',
    beatProfile: 'Signal Pulse @ 84 BPM — bass-forward, transient-reactive',
    briefingText:
      'Operator, we have a rhythmic breach along the north signal grid. Your runner will ride the Pulse preset — keep tempo locked and let transients drive your dodge windows. The bridge is hot; visuals will spike on every kick. Launch when ready.',
  },
  {
    title: 'Drift Corridor Extraction',
    objective: 'Navigate the ambient drift lane and maintain amplitude above the fade threshold.',
    threatLevel: 'low',
    beatProfile: 'Grid Drift @ 68 BPM — mids-driven, high smoothing',
    briefingText:
      'This corridor runs cold and slow. Grid Drift will carry you — lean into mids and amplitude, not transients. Interference is minimal but sync decay is real. Extract clean.',
  },
  {
    title: 'Emergency Glitch Override',
    objective: 'Survive the glitch storm; do not disable the audio-reactive bridge.',
    threatLevel: 'critical',
    beatProfile: 'Emergency Glitch @ 96 BPM — transient-heavy, max sensitivity',
    briefingText:
      'Full spectrum collapse incoming. Emergency Glitch is armed — expect violent transient spikes. The bridge must stay enabled. This is a stress test, not a joyride. Signal 9 is counting on you.',
  },
];

function pickBriefing(index: number) {
  return STUB_BRIEFINGS[index % STUB_BRIEFINGS.length];
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Stub mission briefing generator.
 * Phase 4 will replace this with OpenAI structured output.
 */
export async function generateBriefing(missionId: string): Promise<MissionBriefing> {
  await delay(500);

  const index = missionId.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const template = pickBriefing(index);

  return {
    missionId,
    ...template,
    generatedBy: 'stub',
  };
}
