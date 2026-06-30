import { createVisualEngineAdapter, type PlatformApplication } from '@plantasonic/platform';
import type { VisualEngineAdapter } from '@plantasonic/platform-types';

export {
  bindVisualResize,
  mountVisualStage,
  renderVisualParameterPanel,
  wireVisualControls,
} from '@plantasonic/platform-demo/visualIntegration';

let visualAdapter: VisualEngineAdapter | null = null;

export function getSignal9VisualAdapter(): VisualEngineAdapter | null {
  return visualAdapter;
}

/** Signal 9 visual adapter — ascii-visual-engine with video source pipeline. */
export async function createDemoVisualAdapter(
  app: PlatformApplication,
): Promise<VisualEngineAdapter> {
  visualAdapter = createVisualEngineAdapter({ eventBus: app.eventBus });
  await visualAdapter.init();
  return visualAdapter;
}
