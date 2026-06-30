import type { ScriptModule } from 'ascii-visual-engine';

import { paintSignal9LogoGrid } from './signal9LogoGrid.js';
import type { LogoPointerState } from './signal9LogoPointer.js';

export const SIGNAL_9_LOGO_SCRIPT_ID = 'signal9-logo';

export function createSignal9LogoScript(
  reducedMotion: boolean,
  getPointer: () => LogoPointerState,
): ScriptModule {
  return {
    id: SIGNAL_9_LOGO_SCRIPT_ID,
    name: 'Signal 9 Logo',
    init(api) {
      api.setPreset({
        id: 'signal9-logo',
        name: 'Signal 9 Logo',
        glyphSet: [' ', '_', '/', '\\', '|', '-', '(', ')', '.', ',', 'S', 'i', 'g', 'n', 'a', 'l', '9'],
        motionField: 'none',
        plugins: [
          { id: 'glitch', type: 'effect' },
          { id: 'trails', type: 'effect' },
        ],
        controls: [],
        density: 0.72,
        speed: 0.45,
        trailAmount: reducedMotion ? 0 : 0.1,
        glitchAmount: reducedMotion ? 0 : 0.1,
      });
      api.disablePlugin('noise');
      api.disablePlugin('wave');
      api.disablePlugin('burst');
      api.disablePlugin('scanline');
      api.disablePlugin('grid');
    },
    update(api, ctx) {
      const pointer = getPointer();
      if (pointer.active && !reducedMotion) {
        api.setControl('glitchAmount', 0.16);
      } else if (!reducedMotion) {
        api.setControl('glitchAmount', 0.1);
      }
      paintSignal9LogoGrid(api.getGridState(), ctx.time, reducedMotion, pointer);
    },
  };
}
