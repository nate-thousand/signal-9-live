import type { ApplicationConfig } from '@plantasonic/platform-types';

import { defaultWorkspaceConfig } from './workspaceConfig.js';

export const signal9AppConfig: ApplicationConfig = {
  id: 'signal-9-broadcast-terminal',
  name: 'Signal 9',
  description:
    'Signal 9 — AI-first interactive cyberpunk broadcast terminal on the Plantasonic Platform.',
  workspace: defaultWorkspaceConfig,
  initialStatus: 'idle',
};
