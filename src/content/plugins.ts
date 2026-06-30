import type { PlatformPlugin } from '@plantasonic/platform-types';

import {
  SIGNAL_9_BLACKOUT_BUNDLE,
  SIGNAL_9_BROADCAST_BUNDLE,
  SIGNAL_9_INTERFERENCE_BUNDLE,
  SIGNAL_9_JAMMER_BUNDLE,
  SIGNAL_9_UPLINK_BUNDLE,
} from './presetBundles.js';

export const SIGNAL_9_PLUGINS: PlatformPlugin[] = [
  {
    manifest: {
      id: 'signal-9-beat-runner.broadcast-presets',
      name: 'Signal 9 Broadcast Presets',
      version: '0.3.0',
      description:
        'Contributes Broadcast, Interference, Jammer, Uplink, and Blackout video-to-ASCII preset bundles.',
      capabilities: ['preset-bundles'],
      defaultEnabled: true,
    },
    register(context) {
      context.registerPresetBundle(SIGNAL_9_BROADCAST_BUNDLE);
      context.registerPresetBundle(SIGNAL_9_INTERFERENCE_BUNDLE);
      context.registerPresetBundle(SIGNAL_9_JAMMER_BUNDLE);
      context.registerPresetBundle(SIGNAL_9_UPLINK_BUNDLE);
      context.registerPresetBundle(SIGNAL_9_BLACKOUT_BUNDLE);
    },
  },
];
