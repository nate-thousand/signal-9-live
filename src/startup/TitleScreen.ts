import { mountAnimatedAsciiLogo, type AsciiLogoHandle } from './AsciiLogo.js';
import { renderTerminalLine, renderTerminalPrompt } from '../ui/terminal.js';

export interface TitleScreenOptions {
  onBegin: () => void;
}

export interface TitleScreenHandle {
  dispose: () => void;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function mountTitleScreen(root: HTMLElement, options: TitleScreenOptions): TitleScreenHandle {
  const { onBegin } = options;
  let disposed = false;
  let logoHandle: AsciiLogoHandle | null = null;

  root.innerHTML = `
    <section class="s9-startup s9-title s9-startup--enter" aria-labelledby="s9-title-heading">
      <div class="s9-startup__backdrop" aria-hidden="true">
        <div class="s9-startup__grid s9-startup__grid--animated"></div>
        <div class="s9-startup__noise"></div>
        <div class="s9-startup__glow"></div>
        <div class="s9-startup__sweep"></div>
        <div class="s9-startup__scanlines"></div>
      </div>

      <div class="s9-title__frame">
        <div class="s9-startup__content s9-title__content">
          <div class="s9-title__mark" data-s9-logo-mount></div>
          <div class="s9-terminal s9-terminal--static">
            ${renderTerminalLine('SIGNAL ACQUIRED // PROJECT DIGITAL HARMONY BLIND SPOT OPEN')}
            ${renderTerminalLine('MUSIC IS CIVILIZATION // MEMORY IS RESISTANCE')}
            ${renderTerminalPrompt('PRESS ENTER', { id: 's9-title-input', autofocus: true })}
          </div>
        </div>
      </div>
    </section>
  `;

  const logoMount = root.querySelector<HTMLElement>('[data-s9-logo-mount]');
  if (logoMount) {
    logoHandle = mountAnimatedAsciiLogo(logoMount, {
      size: 'xl',
      asHeading: true,
      headingId: 's9-title-heading',
    });
  }

  const input = root.querySelector<HTMLInputElement>('#s9-title-input');

  const begin = () => {
    if (disposed) return;
    const section = root.querySelector<HTMLElement>('.s9-title');
    section?.classList.add('s9-startup--exit');
    const delay = prefersReducedMotion() ? 80 : 450;
    window.setTimeout(() => onBegin(), delay);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    const target = event.target;
    if (input && target instanceof Node && (target === input || input.contains(target))) {
      return;
    }
    begin();
  };

  const onInputKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      begin();
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      if (document.activeElement !== input) {
        event.preventDefault();
        begin();
      }
    }
  };

  input?.addEventListener('keydown', onInputKeyDown);
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('keydown', onKeyDown);

  return {
    dispose() {
      disposed = true;
      logoHandle?.dispose();
      input?.removeEventListener('keydown', onInputKeyDown);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    },
  };
}
