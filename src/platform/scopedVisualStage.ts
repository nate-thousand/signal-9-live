/**
 * Confines the persistent Plantasonic ASCII Visual Engine stage to a single
 * Home HUD panel instead of letting it paint as a full-viewport background
 * behind the entire terminal.
 *
 * The Platform mounts its stage once into `[data-s9-instrument-layer]` and
 * sizes it to fill the viewport (see `app-layout.scss` / Platform
 * `creative-workspace` CSS). This module does not touch Platform code or the
 * engine itself — it only repositions and resizes the *existing* stage DOM
 * node (`[data-ps-region="stage"]`) to match a HUD panel's on-screen bounds,
 * the same way a window manager would confine a window to a region. The
 * Platform's own resize observer (`bindVisualResize`) already watches that
 * same node, so the engine naturally re-renders at the smaller resolution.
 *
 * Used only while the Home HUD (broadcast terminal) is mounted. Other
 * screens (mission briefing/debrief, start run) keep the engine's default
 * full-bleed backdrop and never call this module.
 */

const STAGE_REGION_SELECTOR = '[data-ps-region="stage"]';
const MAX_BIND_ATTEMPTS = 240; // ~4s at 60fps — covers first-mount race with the async Platform mount

function findInstrumentStage(): HTMLElement | null {
  const instrumentRoot = document.querySelector<HTMLElement>('[data-s9-instrument-layer]');
  return instrumentRoot?.querySelector<HTMLElement>(STAGE_REGION_SELECTOR) ?? null;
}

function applyScopedBounds(stage: HTMLElement, panel: HTMLElement): void {
  const rect = panel.getBoundingClientRect();
  stage.style.position = 'fixed';
  stage.style.left = `${rect.left}px`;
  stage.style.top = `${rect.top}px`;
  stage.style.width = `${rect.width}px`;
  stage.style.height = `${rect.height}px`;
  stage.style.minWidth = '0';
  stage.style.minHeight = '0';
  stage.style.overflow = 'hidden';
}

function clearScopedBounds(stage: HTMLElement): void {
  stage.style.position = '';
  stage.style.left = '';
  stage.style.top = '';
  stage.style.width = '';
  stage.style.height = '';
  stage.style.minWidth = '';
  stage.style.minHeight = '';
  stage.style.overflow = '';
}

/**
 * Scope the Platform visual engine stage to `panel`'s bounds for as long as
 * the returned cleanup function has not been called. Calling the cleanup
 * function releases the stage back to its default full-viewport sizing.
 */
export function bindScopedVisualStage(panel: HTMLElement): () => void {
  let stage: HTMLElement | null = null;
  let attempts = 0;
  let rafId: number | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let stopped = false;

  const update = (): void => {
    if (!stage || stopped) return;
    applyScopedBounds(stage, panel);
  };

  const onWindowResize = (): void => update();

  const tryBind = (): void => {
    if (stopped) return;
    stage = findInstrumentStage();
    if (stage) {
      update();
      resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(panel);
      window.addEventListener('resize', onWindowResize);
      return;
    }
    attempts += 1;
    if (attempts >= MAX_BIND_ATTEMPTS) return;
    rafId = window.requestAnimationFrame(tryBind);
  };

  tryBind();

  return (): void => {
    stopped = true;
    if (rafId !== null) window.cancelAnimationFrame(rafId);
    resizeObserver?.disconnect();
    window.removeEventListener('resize', onWindowResize);
    if (stage) clearScopedBounds(stage);
    window.dispatchEvent(new Event('resize'));
  };
}
