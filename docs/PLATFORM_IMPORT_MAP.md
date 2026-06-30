# Plantasonic Platform Import Map

This map is the Phase 1.1 baseline for future Platform integration work. It records current imports and decisions without changing runtime behavior, UI, engines, content, soundtrack, lore, assets, or the Signal 9 app concept.

## Decision Legend

- `Keep`: Stable enough for Signal 9 to consume directly today.
- `Promote`: Generic enough that Plantasonic Platform or a future App Kit should expose it before Signal 9 replaces imports.
- `Replace`: Should eventually become Signal 9 product code or a product-owned persistence/API layer.
- `Defer`: No safe package surface exists yet, or the integration plan explicitly keeps it out of Phase 1.

## Platform SDK And Types

- `@plantasonic/platform`
  Current files: `src/platform/signal9InstrumentMount.ts`, `src/platform/signal9SoundIntegration.ts`, `src/platform/signal9VisualIntegration.ts`.
  Decision: `Keep`.
  Notes: Core Platform SDK dependency for app lifecycle and visual adapter creation.

- `@plantasonic/platform-types`
  Current files: `src/config/appConfig.ts`, `src/config/workspaceConfig.ts`, `src/content/plugins.ts`, `src/content/presetBundles.ts`, and `src/platform/*`.
  Decision: `Keep`.
  Notes: Shared contracts for app config, workspace config, plugins, presets, adapters, bridge, and visual snapshots.

## Platform Demo Imports

- `@plantasonic/platform-demo/instrument-app`
  Current files: `src/navigation/AppShell.ts`, `src/appContent.ts`.
  Decision: `Promote`.
  Phase 1.1 action: Keep alias to Signal 9 local mount until Platform exposes a stable product-app mount API.

- `@plantasonic/platform-demo/instrumentApp`
  Current files: `src/platform/signal9InstrumentApp.ts`, `src/platform/signal9InstrumentMount.ts`.
  Decision: `Promote`.
  Phase 1.1 action: Promote durable `InstrumentAppContent` and branding contracts to Platform/App Kit later.

- `@plantasonic/platform-demo/bridgeIntegration`
  Current file: `src/platform/signal9InstrumentMount.ts`.
  Decision: `Promote`.
  Phase 1.1 action: Bridge creation, panel rendering, and wiring are generic enough for Platform/App Kit.

- `@plantasonic/platform-demo/performanceIntegration`
  Current file: `src/platform/signal9InstrumentMount.ts`.
  Decision: `Promote`.
  Phase 1.1 action: Performance controls remain demo-coupled until a stable Platform control surface exists.

- `@plantasonic/platform-demo/pluginIntegration`
  Current file: `src/platform/signal9InstrumentMount.ts`.
  Decision: `Promote`.
  Phase 1.1 action: Plugin manager wiring should move behind a stable Platform/App Kit API.

- `@plantasonic/platform-demo/presetIntegration`
  Current file: `src/platform/signal9InstrumentMount.ts`.
  Decision: `Promote`.
  Phase 1.1 action: Registry/browser primitives should be promoted; Signal 9 preset content stays app-owned.

- `@plantasonic/platform-demo/projectIntegration`
  Current file: `src/platform/signal9InstrumentMount.ts`.
  Decision: `Replace` or `Promote`.
  Phase 1.1 action: Decide whether Signal 9 replaces this with product saves or Platform promotes generic project persistence UI.

- `@plantasonic/platform-demo/soundIntegration`
  Current file: `src/platform/signal9SoundIntegration.ts`.
  Decision: `Replace` or `Promote`.
  Phase 1.1 action: Keep demo transport/panel helpers temporarily; Signal 9 MP3 adapter remains app-owned.

- `@plantasonic/platform-demo/visualIntegration`
  Current file: `src/platform/signal9VisualIntegration.ts`.
  Decision: `Promote`.
  Phase 1.1 action: Generic stage mount and resize wiring can move to Platform/App Kit; Signal 9 video profile orchestration stays app-owned.

## Design System Imports And Tokens

- `plantasonic-design-system/css/variables.css`
  Current file: `src/main.ts`.
  Decision: `Keep`.
  Notes: Direct DS token import remains safest because Platform SDK has no DS CSS export.

- `plantasonic-design-system/scss/*`
  Current file: `src/styles/index.scss`.
  Decision: `Keep`.
  Notes: Direct DS SCSS imports remain the source of shared theme, Bootstrap, shell, instrument, and Creative Workspace styles.

- `plantasonic-design-system/shell`
  Current files: `src/config/shellConfig.ts`, `src/platform/signal9InstrumentMount.ts`.
  Decision: `Keep`.
  Notes: DS shell type and render/bind helpers are consumed directly.

- `plantasonic-design-system/instrument`
  Current file: `src/platform/signal9InstrumentMount.ts`.
  Decision: `Keep`.
  Notes: Instrument render helpers remain direct DS imports.

- `plantasonic-design-system/creative-workspace`
  Current file: `src/platform/signal9InstrumentMount.ts`.
  Decision: `Keep`.
  Notes: Creative Workspace render/bind helpers remain direct DS imports.

- `--ds-*` bridge variables
  Current files: `src/styles/signal9-theme.css`, `src/styles/preset-themes.css`.
  Decision: `Keep`.
  Notes: Signal 9 app-owned semantic tokens intentionally map into DS variables.

- `--ps-creative-*` bridge variables
  Current files: `src/styles/signal9-theme.css`, `src/styles/preset-themes.css`.
  Decision: `Keep`.
  Notes: Signal 9 app-owned theme controls Platform/Creative Workspace chrome color only.

## Engine Imports

- `ascii-visual-engine`
  Current files: `src/startup/AsciiLogo.ts`, `src/startup/signal9LogoGrid.ts`, `src/startup/signal9LogoScript.ts`.
  Decision: `Keep with boundary`.
  Notes: Startup ASCII is Signal 9 brand behavior; live stage should continue through Platform visual adapter where possible.

- `plantasia-sound-engine`
  Current files: package dependency only.
  Decision: `Defer`.
  Notes: Mission audio intentionally uses `src/platform/mp3SoundEngineAdapter.ts`; do not remove or replace engine systems in Phase 1.1.

## App-Owned Platform Shims

- `src/platform/signal9InstrumentMount.ts`
  Decision: `Defer`.
  Notes: Largest duplicated demo orchestration surface; wait for stable Platform/App Kit mount API.

- `src/platform/signal9InstrumentApp.ts`
  Decision: `Defer`.
  Notes: Local alias target for the app-specific mount entrypoint.

- `src/platform/signal9SoundIntegration.ts`
  Decision: `Keep app-owned adapter, promote helpers`.
  Notes: MP3 adapter creation is Signal 9-owned; demo transport/panel helpers are candidates for Platform/App Kit.

- `src/platform/signal9VisualIntegration.ts`
  Decision: `Keep app-owned wrapper, promote helpers`.
  Notes: Visual adapter creation is Platform SDK; video source/profile behavior stays Signal 9-owned.

- `src/platform/transmissionSession.ts`
  Decision: `Keep`.
  Notes: Product lifecycle orchestration for MP3, bridge, visual stage, and Platform lifecycle.

- `src/platform/transmissionControlState.ts`
  Decision: `Keep`.
  Notes: Product-specific transmission control mapping.

- `src/platform/applySignal9Preset.ts`
  Decision: `Keep`.
  Notes: Product preset application across audio, bridge, visual profile, and theme.

- `src/platform/instrumentBootstrap.ts`
  Decision: `Keep`.
  Notes: Product bootstrap sequencing after the instrument layer mounts.

- `src/platform/signal9AudioReactive.ts`
  Decision: `Keep`.
  Notes: Product access to active bridge reference.

- `src/platform/bassEmojiPulse.ts`
  Decision: `Keep`.
  Notes: Product-specific bass glyph scaling behavior.

## Next Safe Step

Do not replace imports yet. The next safe integration step is to define the Platform/App Kit mount API that can replace demo-source imports without changing Signal 9 runtime behavior.
