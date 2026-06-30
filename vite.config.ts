import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, loadEnv } from 'vite';

import { handleBroadcastChat } from './server/broadcastChat.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const platformRoot = path.resolve(__dirname, '../plantasonic-platform');
const dsRoot = path.resolve(__dirname, 'node_modules/plantasonic-design-system');
const demoRoot = path.resolve(platformRoot, 'apps/demo/src');

function mountBroadcastChatApi(
  middlewares: { use: (handler: (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, next: () => void) => void) => void },
  apiKey?: string,
): void {
  middlewares.use((req, res, next) => {
    if (!req.url?.startsWith('/api/broadcast/chat')) {
      next();
      return;
    }
    void handleBroadcastChat(req, res, apiKey);
  });
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
  root: '.',
  resolve: {
    alias: {
      '@plantasonic/platform': path.resolve(platformRoot, 'packages/sdk/src/index.ts'),
      '@plantasonic/platform-types': path.resolve(
        platformRoot,
        'packages/shared-types/src/index.ts',
      ),
      '@plantasonic/platform-demo/instrument-app': path.resolve(
        __dirname,
        'src/platform/signal9InstrumentApp.ts',
      ),
      '@plantasonic/platform-demo': demoRoot,
      'ascii-visual-engine': path.resolve(platformRoot, 'packages/visual-engine/src/index.ts'),
      'plantasonic-design-system/shell': path.resolve(dsRoot, 'src/shell/index.ts'),
      'plantasonic-design-system/instrument': path.resolve(dsRoot, 'src/instrument/index.ts'),
      'plantasonic-design-system/creative-workspace': path.resolve(
        dsRoot,
        'src/creative-workspace/index.ts',
      ),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
      },
    },
  },
  optimizeDeps: {
    include: ['tone', 'plantasia-sound-engine'],
    // Always bundle from ../visual-engine/src via alias — avoids stale dist in .vite cache.
    exclude: ['ascii-visual-engine'],
  },
  server: {
    port: 5177,
    open: true,
  },
  configureServer(server) {
    mountBroadcastChatApi(server.middlewares, env.OPENAI_API_KEY);
  },
  configurePreviewServer(server) {
    mountBroadcastChatApi(server.middlewares, env.OPENAI_API_KEY);
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  };
});
