import { mountAnimatedAsciiLogo, type AsciiLogoHandle } from './AsciiLogo.js';
import { renderBootSequence, animateBootLines } from '../ui/terminal.js';
import type { StartupAudioController } from './StartupAudioController.js';

export interface LoadingScreenOptions {
  audio: StartupAudioController;
  minDurationMs?: number;
  onComplete: () => void;
  onSkip: () => void;
}

export interface LoadingScreenHandle {
  dispose: () => void;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function mountLoadingScreen(
  root: HTMLElement,
  options: LoadingScreenOptions,
): LoadingScreenHandle {
  const { audio, minDurationMs = 1800, onComplete, onSkip } = options;
  const reduced = prefersReducedMotion();
  let disposed = false;
  let completed = false;
  let audioStarted = false;
  let completeTimer: number | null = null;
  let logoHandle: AsciiLogoHandle | null = null;

  root.innerHTML = `
    <section class="s9-startup s9-loading s9-startup--enter" aria-labelledby="s9-loading-title">
      <div class="s9-startup__backdrop" aria-hidden="true">
        <div class="s9-startup__grid"></div>
        <div class="s9-startup__scanlines"></div>
      </div>
      <div class="s9-startup__content s9-loading__content">
        <div class="s9-loading__mark" data-s9-logo-mount></div>
        <div class="s9-terminal s9-terminal--boot" data-s9-boot-lines>
          ${renderBootSequence()}
        </div>
      </div>
    </section>
  `;

  const logoMount = root.querySelector<HTMLElement>('[data-s9-logo-mount]');
  if (logoMount) {
    logoHandle = mountAnimatedAsciiLogo(logoMount, {
      size: 'lg',
      asHeading: true,
      headingId: 's9-loading-title',
    });
  }

  const bootEl = root.querySelector<HTMLElement>('[data-s9-boot-lines]');
  if (bootEl && !reduced) {
    animateBootLines(bootEl);
  } else if (bootEl) {
    bootEl.classList.add('s9-terminal--static');
  }

  const finish = (skip: boolean) => {
    if (disposed || completed) return;
    completed = true;
    if (completeTimer) clearTimeout(completeTimer);

    const section = root.querySelector<HTMLElement>('.s9-loading');
    section?.classList.add('s9-startup--exit');

    window.setTimeout(
      () => {
        if (skip) onSkip();
        else onComplete();
      },
      reduced ? 80 : 400,
    );
  };

  const tryStartAudio = () => {
    if (audioStarted) return;
    audioStarted = true;
    void audio.playFadeIn(reduced ? 300 : 1200);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    tryStartAudio();
    finish(true);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      tryStartAudio();
      finish(true);
    }
  };

  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('keydown', onKeyDown);

  completeTimer = window.setTimeout(
    () => finish(false),
    reduced ? Math.min(minDurationMs, 600) : minDurationMs,
  );

  return {
    dispose() {
      disposed = true;
      logoHandle?.dispose();
      if (completeTimer) clearTimeout(completeTimer);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    },
  };
}
