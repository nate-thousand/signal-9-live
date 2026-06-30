import type { MissionRun } from '../ai/types.js';

export type AppScreen =
  | 'start-run'
  | 'mission-briefing'
  | 'beat-runner'
  | 'broadcast-terminal'
  | 'mission-debrief';

export interface NavigationState {
  screen: AppScreen;
  mission: MissionRun | null;
}

export type NavigateHandler = (screen: AppScreen, mission?: MissionRun | null) => void;

export type ScreenLayerMode = 'fullscreen' | 'dimmed' | 'hud' | 'terminal';

export interface ScreenContext {
  root: HTMLElement;
  navigate: NavigateHandler;
  mission: MissionRun | null;
}
