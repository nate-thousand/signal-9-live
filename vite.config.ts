import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, loadEnv, type Plugin } from 'vite';

import { handleBroadcastChat, logAiBackendStatus } from './server/broadcastChat.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const videoAssetsDir = path.resolve(__dirname, 'public/assets/video');
const audioAssetsDir = path.resolve(__dirname, 'public/assets/audio');
const VIDEO_FILE_PATTERN = /\.(mp4|mov|webm|mkv)$/i;
const AUDIO_FILE_PATTERN = /\.(mp3|wav|m4a)$/i;
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

/**
 * `configureServer` / `configurePreviewServer` are Vite **plugin** hooks —
 * they are not read when placed directly on the returned UserConfig object,
 * so the broadcast chat middleware must be registered through a real plugin
 * for the dev/preview server to ever mount `/api/broadcast/chat`.
 */
function scanLocalVideoAssets(): string[] {
  if (!existsSync(videoAssetsDir)) return [];
  return readdirSync(videoAssetsDir)
    .filter((name) => VIDEO_FILE_PATTERN.test(name))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `/assets/video/${encodeURIComponent(name)}`);
}

function scanLocalAudioAssets(): string[] {
  if (!existsSync(audioAssetsDir)) return [];
  return readdirSync(audioAssetsDir)
    .filter((name) => AUDIO_FILE_PATTERN.test(name))
    .sort((a, b) => a.localeCompare(b))
    .map((name) => `/assets/audio/${encodeURIComponent(name)}`);
}

function mountAudioPlaylistApi(
  middlewares: { use: (handler: (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, next: () => void) => void) => void },
): void {
  middlewares.use((req, res, next) => {
    if (req.url?.split('?')[0] !== '/api/signal9/audio-playlist') {
      next();
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ tracks: scanLocalAudioAssets() }));
  });
}

/** Discover audio in public/assets/audio for dev API + production manifest. */
function audioPlaylistPlugin(): Plugin {
  return {
    name: 'signal9-audio-playlist',
    generateBundle() {
      const tracks = scanLocalAudioAssets();
      this.emitFile({
        type: 'asset',
        fileName: 'assets/audio/playlist.json',
        source: JSON.stringify({ tracks }, null, 2),
      });
    },
    configureServer(server) {
      mountAudioPlaylistApi(server.middlewares);
    },
    configurePreviewServer(server) {
      mountAudioPlaylistApi(server.middlewares);
    },
  };
}

function mountVideoPlaylistApi(
  middlewares: { use: (handler: (req: import('node:http').IncomingMessage, res: import('node:http').ServerResponse, next: () => void) => void) => void },
): void {
  middlewares.use((req, res, next) => {
    if (req.url?.split('?')[0] !== '/api/signal9/video-playlist') {
      next();
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ videos: scanLocalVideoAssets() }));
  });
}

/** Discover videos in public/assets/video for dev API + production manifest. */
function videoPlaylistPlugin(): Plugin {
  return {
    name: 'signal9-video-playlist',
    generateBundle() {
      const videos = scanLocalVideoAssets();
      this.emitFile({
        type: 'asset',
        fileName: 'assets/video/playlist.json',
        source: JSON.stringify({ videos }, null, 2),
      });
    },
    configureServer(server) {
      mountVideoPlaylistApi(server.middlewares);
    },
    configurePreviewServer(server) {
      mountVideoPlaylistApi(server.middlewares);
    },
  };
}

function broadcastChatApiPlugin(apiKey?: string): Plugin {
  return {
    name: 'signal-9-broadcast-chat-api',
    configureServer(server) {
      mountBroadcastChatApi(server.middlewares, apiKey);
      logAiBackendStatus(apiKey);
    },
    configurePreviewServer(server) {
      mountBroadcastChatApi(server.middlewares, apiKey);
      logAiBackendStatus(apiKey);
    },
  };
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
  plugins: [broadcastChatApiPlugin(env.OPENAI_API_KEY), videoPlaylistPlugin(), audioPlaylistPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  };
});
