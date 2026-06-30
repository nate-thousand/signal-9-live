import type { VisualEngineAdapter } from '@plantasonic/platform-types';

/** Tune visual engine for responsive sliders and stable ASCII density on the stage. */
export async function applySignal9VisualPerformance(
  visual?: VisualEngineAdapter | null,
): Promise<void> {
  if (!visual) return;

  // Avoid perfQuality preset — it rescales density and fights the ASCII Scale slider.
  await visual.setControl('adaptiveQuality', 0);
  await visual.setControl('dirtyRendering', 1);
  await visual.setControl('fpsTarget', 60);
}
