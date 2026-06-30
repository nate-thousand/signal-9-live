export interface LogoPointerState {
  /** Normalized 0–1 across the logo frame */
  x: number;
  y: number;
  active: boolean;
}

export interface LogoPointerTracker {
  getState: () => LogoPointerState;
  dispose: () => void;
}

const INACTIVE: LogoPointerState = { x: 0.5, y: 0.5, active: false };

export function trackLogoPointer(element: HTMLElement): LogoPointerTracker {
  let state: LogoPointerState = { ...INACTIVE };

  const updateFromEvent = (event: PointerEvent) => {
    const rect = element.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    state = {
      x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
      y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
      active: true,
    };
  };

  const onEnter = (event: PointerEvent) => updateFromEvent(event);
  const onMove = (event: PointerEvent) => updateFromEvent(event);
  const onLeave = () => {
    state = { ...INACTIVE };
  };

  element.addEventListener('pointerenter', onEnter);
  element.addEventListener('pointermove', onMove);
  element.addEventListener('pointerleave', onLeave);

  return {
    getState: () => state,
    dispose() {
      element.removeEventListener('pointerenter', onEnter);
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
    },
  };
}
