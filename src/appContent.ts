import type { InstrumentAppContent } from '@plantasonic/platform-demo/instrument-app';

import { signal9AppConfig } from './config/appConfig.js';
import { signal9ShellConfig } from './config/shellConfig.js';
import { SIGNAL_9_BRANDING } from './content/branding.js';
import { SIGNAL_9_DEFAULT_TEMPO } from './content/mappings.js';
import { SIGNAL_9_PRESET_BUNDLES, SIGNAL_9_STARTER_BUNDLE } from './content/presetBundles.js';
import { SIGNAL_9_PLUGINS } from './content/plugins.js';

/** App-owned content injected into platform orchestration */
export const signal9AppContent: InstrumentAppContent = {
  application: signal9AppConfig,
  shell: signal9ShellConfig,
  presetBundles: SIGNAL_9_PRESET_BUNDLES,
  browserSeedBundles: [SIGNAL_9_STARTER_BUNDLE],
  plugins: SIGNAL_9_PLUGINS,
  branding: {
    eventSource: 'signal-9-beat-runner',
    presetBrowserLabel: SIGNAL_9_BRANDING.presetBrowserLabel,
    transportTempo: SIGNAL_9_DEFAULT_TEMPO,
  },
};
