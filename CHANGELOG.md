# Changelog

## Unreleased

### Signal 9 Radio HUD Integration

- Added live FFT, waveform, peak, RMS, signal strength, transmission quality, stereo balance, and downsampled analyzer data from the MP3 adapter for HUD use.
- Upgraded the Broadcast Deck with play, pause, previous, next, restart, seek, volume, mute, source, current track, timing, and diagnostic readouts without changing the audio engine or Platform code.
- Connected the left waveform, right spectrum analyzer, system monitor bars, center visual telemetry, status bar, and packet meters to the currently playing soundtrack.
- Added four recovered ambient tape assets to the radio deck and asset manifest, plus three alternate video ASCII source loops in the VIDEO ASCII source list.
- Preserved the panel-scoped Visual Engine mount; no full-screen ASCII background was reintroduced.

### ASCII Engine Scoped To HUD Panels

- Stopped the Plantasonic ASCII Visual Engine canvas from rendering as a full-viewport background behind the Home HUD.
- Added `src/platform/scopedVisualStage.ts`, which confines the engine's existing stage DOM node to the center visual panel's on-screen bounds while the broadcast terminal is mounted, and releases that scoping (back to full-bleed) when navigating to other screens.
- Wired the new scoping into `mountBroadcastTerminal.ts` mount/unmount lifecycle; no Platform files, engine internals, or audio behavior were changed.
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
