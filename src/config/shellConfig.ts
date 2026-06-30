import type { ApplicationShellConfig } from 'plantasonic-design-system/shell';

import { SIGNAL_9_BRANDING } from '../content/branding.js';

export const signal9ShellConfig: ApplicationShellConfig = {
  id: 'signal-9-broadcast-terminal',
  title: SIGNAL_9_BRANDING.appTitle,
  variant: 'instrument',
  mode: 'edit',
  theme: 'dark',
  persistState: true,
  navigation: {
    title: SIGNAL_9_BRANDING.appTitle,
    groups: [],
  },
  regions: {
    header: false,
    sidebar: false,
    inspector: false,
    dock: false,
    overlay: true,
  },
};
