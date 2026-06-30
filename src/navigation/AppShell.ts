import { mountInstrumentApp } from '@plantasonic/platform-demo/instrument-app';

import type { MissionRun } from '../ai/types.js';
import { signal9AppContent } from '../appContent.js';
import {
  bootstrapInstrumentSession,
} from '../platform/instrumentBootstrap.js';

import { renderBeatRunnerScreen } from './screens/beatRunner.js';
import { renderBroadcastTerminalScreen } from './screens/broadcastTerminal.js';
import { renderMissionBriefingScreen } from './screens/missionBriefing.js';
import { renderMissionDebriefScreen } from './screens/missionDebrief.js';
import { renderStartRunScreen } from './screens/startRun.js';
import type { AppScreen, NavigationState, ScreenContext, ScreenLayerMode } from './types.js';

const SCREEN_RENDERERS: Record<AppScreen, (ctx: ScreenContext) => void> = {
  'start-run': renderStartRunScreen,
  'mission-briefing': renderMissionBriefingScreen,
  'beat-runner': renderBeatRunnerScreen,
  'broadcast-terminal': renderBroadcastTerminalScreen,
  'mission-debrief': renderMissionDebriefScreen,
};

function screenLayerMode(screen: AppScreen): ScreenLayerMode {
  switch (screen) {
    case 'beat-runner':
    case 'broadcast-terminal':
      return 'terminal';
    case 'start-run':
      return 'dimmed';
    default:
      return 'fullscreen';
  }
}

/**
 * Mission navigation shell over a persistent Plantasia ASCII Visual Engine mount.
 *
 * MP3 / Sound Engine → audio analysis → Audio Reactive Bridge → Visual Engine → stage canvas
 */
export class AppShell {
  private readonly root: HTMLElement;
  private instrumentLayer: HTMLElement | null = null;
  private screenLayer: HTMLElement | null = null;
  private state: NavigationState = { screen: 'broadcast-terminal', mission: null };
  private instrumentMounted = false;

  constructor(root: HTMLElement) {
    this.root = root;
    this.root.classList.add('s9-app-root');
    this.root.dataset.s9ScreenMode = 'terminal';
  }

  start(): void {
    this.ensureLayout();
    this.mountInstrumentOnce();
    this.renderScreen();
  }

  private ensureLayout(): void {
    if (this.instrumentLayer && this.screenLayer) return;

    this.root.innerHTML = '';

    this.instrumentLayer = document.createElement('div');
    this.instrumentLayer.className = 's9-instrument-layer';
    this.instrumentLayer.setAttribute('data-s9-instrument-layer', '');

    this.screenLayer = document.createElement('div');
    this.screenLayer.className = 's9-screen-layer';
    this.screenLayer.setAttribute('data-s9-screen-layer', '');

    this.root.append(this.instrumentLayer, this.screenLayer);
  }

  private mountInstrumentOnce(): void {
    if (this.instrumentMounted || !this.instrumentLayer) return;
    this.instrumentMounted = true;

    void mountInstrumentApp(this.instrumentLayer, signal9AppContent)
      .then(() => bootstrapInstrumentSession(this.instrumentLayer!))
      .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      this.instrumentLayer!.innerHTML = `<p class="text-danger p-3" role="alert">Platform failed to start: ${message}</p>`;
      console.error('[signal-9-beat-runner]', error);
    });
  }

  private navigate(screen: AppScreen, mission: MissionRun | null = this.state.mission): void {
    this.state = { screen, mission };
    this.renderScreen();
  }

  private renderScreen(): void {
    if (!this.screenLayer) return;

    const mode = screenLayerMode(this.state.screen);
    this.root.dataset.s9ScreenMode = mode;
    this.screenLayer.className = `s9-screen-layer s9-screen-layer--${mode}`;
    this.screenLayer.innerHTML = '';

    const ctx: ScreenContext = {
      root: this.screenLayer,
      navigate: (screen, mission) => {
        this.navigate(screen, mission ?? null);
      },
      mission: this.state.mission,
    };

    SCREEN_RENDERERS[this.state.screen](ctx);
  }
}
