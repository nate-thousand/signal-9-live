import { AppShell } from '../navigation/AppShell.js';

import { mountLoadingScreen, type LoadingScreenHandle } from './LoadingScreen.js';
import { StartupAudioController } from './StartupAudioController.js';
import { mountTitleScreen, type TitleScreenHandle } from './TitleScreen.js';

export type StartupPhase = 'loading' | 'title' | 'app';

export interface StartupControllerOptions {
  minLoadingMs?: number;
}

/**
 * Orchestrates Loading → Title → main application.
 */
export class StartupController {
  private readonly root: HTMLElement;
  private readonly audio: StartupAudioController;
  private readonly minLoadingMs: number;
  private phase: StartupPhase = 'loading';
  private loadingHandle: LoadingScreenHandle | null = null;
  private titleHandle: TitleScreenHandle | null = null;
  private appShell: AppShell | null = null;

  constructor(root: HTMLElement, options: StartupControllerOptions = {}) {
    this.root = root;
    this.root.classList.add('s9-app-shell');
    this.audio = new StartupAudioController();
    this.minLoadingMs = options.minLoadingMs ?? 1800;
  }

  start(): void {
    this.showLoading();
  }

  get currentPhase(): StartupPhase {
    return this.phase;
  }

  private showLoading(): void {
    this.phase = 'loading';
    this.disposeScreens();

    this.loadingHandle = mountLoadingScreen(this.root, {
      audio: this.audio,
      minDurationMs: this.minLoadingMs,
      onComplete: () => {
        void this.transitionLoadingToTitle();
      },
      onSkip: () => {
        void this.transitionLoadingToTitle(true);
      },
    });
  }

  private async transitionLoadingToTitle(skipped = false): Promise<void> {
    this.loadingHandle?.dispose();
    this.loadingHandle = null;

    await this.audio.fadeOut(skipped ? 200 : 700);
    this.showTitle();
  }

  private showTitle(): void {
    this.phase = 'title';
    this.root.innerHTML = '';
    this.root.classList.add('s9-app-shell');

    this.titleHandle = mountTitleScreen(this.root, {
      onBegin: () => this.transitionTitleToApp(),
    });
  }

  private transitionTitleToApp(): void {
    this.titleHandle?.dispose();
    this.titleHandle = null;
    this.audio.skip();
    this.phase = 'app';

    this.root.innerHTML = '';
    this.root.classList.add('s9-app-shell', 's9-app-enter');

    this.appShell = new AppShell(this.root);
    this.appShell.start();

    window.setTimeout(() => {
      this.root.classList.remove('s9-app-enter');
    }, 800);
  }

  private disposeScreens(): void {
    this.loadingHandle?.dispose();
    this.loadingHandle = null;
    this.titleHandle?.dispose();
    this.titleHandle = null;
  }

  dispose(): void {
    this.disposeScreens();
    this.audio.dispose();
    this.appShell = null;
  }
}
