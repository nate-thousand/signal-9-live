import type { MissionRun } from '../ai/types.js';

let missionCounter = 0;

export function createMissionId(): string {
  missionCounter += 1;
  const stamp = Date.now().toString(36);
  return `s9-${stamp}-${missionCounter}`;
}

export function createMissionRun(briefing: MissionRun['briefing']): MissionRun {
  return {
    id: briefing.missionId,
    briefing,
    startedAt: undefined,
    completedAt: undefined,
  };
}

export function markMissionStarted(mission: MissionRun): MissionRun {
  return {
    ...mission,
    startedAt: new Date().toISOString(),
  };
}

export function markMissionCompleted(mission: MissionRun): MissionRun {
  return {
    ...mission,
    completedAt: new Date().toISOString(),
  };
}
