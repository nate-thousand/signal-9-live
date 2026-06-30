import { AsciiEngine } from 'ascii-visual-engine';

import { SIGNAL_9_TRANSMISSION_AUDIO_PATH } from '../audio/transmissionAudio.js';
import { SIGNAL_9_BRANDING } from '../content/branding.js';
import {
  SIGNAL_9_LOGO_ART,
  SIGNAL_9_LOGO_ART_COLS,
  SIGNAL_9_LOGO_ART_ROWS,
} from './signal9LogoArt.js';
import {
  createSignal9LogoScript,
  SIGNAL_9_LOGO_SCRIPT_ID,
} from './signal9LogoScript.js';
import { trackLogoPointer } from './signal9LogoPointer.js';

export const STARTUP_AUDIO_PATH = SIGNAL_9_TRANSMISSION_AUDIO_PATH;

export type AsciiLogoSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AsciiLogoOptions {
  size?: AsciiLogoSize;
  className?: string;
  ariaLabel?: string;
  asHeading?: boolean;
  headingId?: string;
}

export interface AsciiLogoHandle {
  dispose: () => void;
}

const SIGNAL_COLOR = '#a855f7';
const LOGO_DENSITY = 0.72;

/** Extra grid cells so ghost offset and glitch slices stay in frame */
const FRAME_PAD_COLS = 6;
const FRAME_PAD_ROWS = 3;

const SIZE_SCALE: Record<AsciiLogoSize, number> = {
  sm: 0.88,
  md: 0.96,
  lg: 1.05,
  xl: 1.14,
};

function gridDimensions(
  width: number,
  height: number,
  density: number,
): { cols: number; rows: number; cellHeight: number } {
  const cols = Math.max(8, Math.floor(width / (12 / density)));
  const cellWidth = width / cols;
  const cellHeight = cellWidth * 1.6;
  const rows = Math.max(4, Math.floor(height / cellHeight));
  return { cols, rows, cellHeight };
}

function viewportForSize(size: AsciiLogoSize): { width: number; height: number } {
  const scale = SIZE_SCALE[size];
  const minCols = SIGNAL_9_LOGO_ART_COLS + FRAME_PAD_COLS;
  const minRows = SIGNAL_9_LOGO_ART_ROWS + FRAME_PAD_ROWS;
  const colUnit = 12 / LOGO_DENSITY;

  let width = Math.ceil(minCols * colUnit * scale);
  let { cols, rows, cellHeight } = gridDimensions(width, 4096, LOGO_DENSITY);

  while (cols < minCols) {
    width += Math.ceil(colUnit);
    ({ cols, cellHeight } = gridDimensions(width, 4096, LOGO_DENSITY));
  }

  let height = Math.ceil(minRows * cellHeight + cellHeight * 0.75);
  ({ rows, cellHeight } = gridDimensions(width, height, LOGO_DENSITY));

  while (rows < minRows) {
    height += Math.ceil(cellHeight);
    ({ rows } = gridDimensions(width, height, LOGO_DENSITY));
  }

  return { width, height };
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Static fallback when the engine cannot mount (SSR / tests). */
export function renderAsciiLogo(options: AsciiLogoOptions = {}): string {
  const {
    size = 'lg',
    className = '',
    ariaLabel = SIGNAL_9_BRANDING.logoLabel,
    asHeading = false,
    headingId,
  } = options;
  const classes = ['s9-ascii-logo', `s9-ascii-logo--${size}`, className].filter(Boolean).join(' ');
  const idAttr = headingId ? ` id="${headingId}"` : '';
  const tag = asHeading ? 'h1' : 'div';
  const art = SIGNAL_9_LOGO_ART.join('\n');

  return `<${tag} class="${classes}"${idAttr} aria-label="${ariaLabel}"><pre class="s9-ascii-logo__output s9-ascii-logo__output--static">${art}</pre></${tag}>`;
}

export function mountAnimatedAsciiLogo(
  container: HTMLElement,
  options: AsciiLogoOptions = {},
): AsciiLogoHandle {
  const {
    size = 'lg',
    className = '',
    ariaLabel = SIGNAL_9_BRANDING.logoLabel,
    asHeading = false,
    headingId,
  } = options;

  const reduced = prefersReducedMotion();
  const viewport = viewportForSize(size);
  const classes = ['s9-ascii-logo', `s9-ascii-logo--${size}`, className].filter(Boolean).join(' ');
  const tag = asHeading ? 'h1' : 'div';
  const idAttr = headingId ? ` id="${headingId}"` : '';

  container.innerHTML = `<${tag} class="${classes}"${idAttr} aria-label="${ariaLabel}"><pre class="s9-ascii-logo__output" data-s9-logo-output></pre></${tag}>`;

  const logoRoot = container.querySelector<HTMLElement>('.s9-ascii-logo');
  const output = container.querySelector<HTMLElement>('[data-s9-logo-output]');
  if (!output || !logoRoot) {
    return { dispose: () => {} };
  }

  const pointer = trackLogoPointer(logoRoot);

  const engineCanvas = document.createElement('canvas');
  engineCanvas.width = 1;
  engineCanvas.height = 1;

  const engine = new AsciiEngine({
    canvas: engineCanvas,
    element: output,
    renderer: 'dom',
    width: viewport.width,
    height: viewport.height,
    autoStart: false,
  });

  engine.setColor(SIGNAL_COLOR);
  engine.setControl('density', LOGO_DENSITY);

  const scriptEngine = engine.getScriptEngine();
  scriptEngine.registerScript(createSignal9LogoScript(reduced, () => pointer.getState()));
  void scriptEngine.runScript(SIGNAL_9_LOGO_SCRIPT_ID).then(() => {
    engine.start();
  });

  return {
    dispose() {
      pointer.dispose();
      void scriptEngine.stopScript();
      engine.destroy();
      container.innerHTML = '';
    },
  };
}

export function mountAsciiLogo(container: HTMLElement, options: AsciiLogoOptions = {}): AsciiLogoHandle {
  return mountAnimatedAsciiLogo(container, options);
}
