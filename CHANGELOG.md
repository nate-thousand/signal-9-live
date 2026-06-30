# Changelog

## Unreleased

### Live OpenAI Backend For Local Dev And Vercel

- Fixed a bug where `/api/broadcast/chat` returned 404 on the dev/preview server: `configureServer`/`configurePreviewServer` were defined as plain properties on the Vite config object, but those are **plugin hooks** and were silently ignored by Vite. Moved them into a real `broadcastChatApiPlugin` registered via `plugins: []` in `vite.config.ts` — the chat endpoint now actually mounts locally.
- Added `api/broadcast/chat.ts`, a Vercel serverless Function that calls the same `handleBroadcastChat` handler used by the dev server, so production deployments get a working `/api/broadcast/chat` route for the first time (previously the static build had no backend at all for this path).
- Added `logAiBackendStatus()` to `server/broadcastChat.ts`: logs `✓ OpenAI configured` or `⚠ Running in Stub Mode` on dev/preview server start and on each Vercel cold start — never logs the key itself.
- Updated `.env.example`, `README.md` with local (`.env.local`) and Vercel (Project Settings → Environment Variables) setup instructions for `OPENAI_API_KEY`; confirmed `.gitignore` already excludes `.env`, `.env.local`, and `.env.*` (with an explicit `.env.example` exception).
- No gameplay, UI, engine, or audio behavior changed; `OPENAI_API_KEY` remains the only required variable name, identical locally and on Vercel.

### Broadcast Terminal Global ASCII Background Removed

- Removed the Broadcast Terminal's active scoped-stage binding and deleted the temporary `scopedVisualStage.ts` implementation.
- Disabled the Platform instrument/stage layer entirely in terminal mode so the full-screen ASCII Visual Engine canvas cannot render behind chat, radio, mission, header, or footer HUD panels.
- Added `src/platform/scopedHudVisuals.ts` as the TODO placeholder for future panel-owned visual engine mounts; scoped HUD visuals are intentionally not implemented yet.
- Preserved startup screens, app shell mounting, chat, HUD panels, audio playback, MP3 analysis, and existing lightweight ASCII HUD widgets.

### Signal 9 Radio HUD Integration

- Added live FFT, waveform, peak, RMS, signal strength, transmission quality, stereo balance, and downsampled analyzer data from the MP3 adapter for HUD use.
- Upgraded the Broadcast Deck with play, pause, previous, next, restart, seek, volume, mute, source, current track, timing, and diagnostic readouts without changing the audio engine or Platform code.
- Connected the left waveform, right spectrum analyzer, system monitor bars, center visual telemetry, status bar, and packet meters to the currently playing soundtrack.
- Added four recovered ambient tape assets to the radio deck and asset manifest, plus three alternate video ASCII source loops in the VIDEO ASCII source list.
- Preserved the audio-reactive HUD widgets; the global Visual Engine stage is now disabled in the Broadcast Terminal.

### ASCII Engine Scoped To HUD Panels

- Stopped the Plantasonic ASCII Visual Engine canvas from rendering as a full-viewport background behind the Home HUD.
- Superseded the temporary scoped-stage approach with a full terminal-mode stage disable and a future `scopedHudVisuals.ts` TODO placeholder.
- Confirmed the existing lightweight HUD ASCII modules (waveform, spectrum, Echo portrait, network map, telemetry bars, memory node preview) were already panel-scoped and clipped via `overflow: hidden` on their own classes — no glyphs float over unrelated panels.

### Version 0.1 Functional Prototype

- Upgraded the entry flow into a cold Resistance terminal boot with diagnostics, signal acquisition, broadcast authentication, CRT interference, and press-ENTER transition.
- Rebuilt the Broadcast Terminal as the v0.1 Home Terminal HUD: left chat terminal, center ASCII Visual Engine frame, right Signal 9 Radio and mission console, and bottom telemetry bar.
- Wired Signal 9 Radio controls to the existing MP3/audio-reactive/video ASCII session path, including local soundtrack presets, play/stop/restart, waveform, spectrum, playback progress, and volume telemetry.
- Added live HUD telemetry for frequency, signal strength, Echo status, Memory Nodes, broadcast state, CPU estimate, FPS, current mission, district, and system time.
- Kept Platform packages, engines, app content, soundtrack, and lore intact while refining only app-owned startup, terminal, adapter telemetry, and documentation.

### Signal 9 Design Language

- Added the official documentation-only Signal 9 visual operating philosophy in `docs/VISUAL_LANGUAGE.md`.
- Added supporting art direction, UI principles, and v0/Figma guidelines for future screens, prompts, and design work.
- Updated README and ROADMAP references without modifying application code, engines, runtime behavior, content, assets, soundtrack, lore, or app concept.

### Plantasonic Platform Integration

- Added explicit local dependencies for `@plantasonic/platform` and `@plantasonic/platform-types` so Signal 9 consumes the frozen Platform SDK and shared contracts as product-app dependencies.
- Kept Signal 9 theme files app-owned: `src/styles/signal9-theme.css`, `src/styles/preset-themes.css`, and `src/theme/`.
- Deferred Design System import replacement because the current Platform SDK does not expose shell, instrument, Creative Workspace, CSS, SCSS, or token entrypoints.
- Deferred engine, demo mount, soundtrack, lore, content, and runtime import changes per `docs/PLATFORM_INTEGRATION_PLAN.md`.
- Added repo-local npm config so `npm install` avoids sibling package prepare scripts and unused Design System CLI bin links.
- Updated npm scripts to call local TypeScript and Vite entrypoints directly so validation works with npm installs that skip bin links.
- Fixed a browser timer type annotation in `src/startup/LoadingScreen.ts` so the Phase 1 typecheck baseline passes without changing runtime behavior.
- Added `docs/PLATFORM_IMPORT_MAP.md` with keep / promote / replace / defer decisions for Platform, demo, Design System, engine, and local shim imports.
- Established the Signal 9 app git baseline while excluding the handoff RTF and stale pnpm lock from source control.
