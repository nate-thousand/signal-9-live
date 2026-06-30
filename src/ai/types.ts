export interface MissionBriefing {
  missionId: string;
  title: string;
  objective: string;
  threatLevel: 'low' | 'moderate' | 'high' | 'critical';
  beatProfile: string;
  briefingText: string;
  generatedBy: 'stub' | 'openai';
}

export interface MissionDebrief {
  missionId: string;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  summary: string;
  highlights: string[];
  nextMissionHint: string;
  generatedBy: 'stub' | 'openai';
}

export interface MissionRun {
  id: string;
  briefing: MissionBriefing;
  debrief?: MissionDebrief;
  startedAt?: string;
  completedAt?: string;
}
