# Plantasonic Platform Integration Plan

Signal 9 is an independent product application. It should consume the frozen Plantasonic Platform as a reusable foundation without moving into `plantasonic-platform`, redesigning the UI, replacing runtime behavior, or changing engine internals.

This plan is documentation-only. It inventories current coupling and defines the first integration phase before any import, file, or behavior changes.

## Current App Structure

Signal 9 is a standalone Vite + TypeScript application with product-specific startup, navigation, AI, game, audio, visual, and broadcast UI layers.

| Area | Current location | Notes |
|------|------------------|-------|
| Entry and app bootstrap | `src/main.ts`, `src/navigation/AppShell.ts` | Startup flow mounts a persistent instrument layer and overlays product screens. |
| Startup identity | `src/startup/` | Loading, title, ASCII logo, and title audio are brand assets and stay app-owned. |
| Platform integration layer | `src/platform/` | Local shims around Platform SDK, demo wiring, MP3 audio, video-to-ASCII, and transmission state. |
| Product content | `src/content/`, `src/config/`, `src/appContent.ts` | Presets, shell config, plugins, mappings, video sources, and product metadata. |
| Broadcast Terminal UI | `src/ui/`, `src/navigation/screens/` | Product interface, chat, deck, lore panel, choices, control menu, and video controls. |
| AI and game state | `src/ai/`, `src/game/`, `server/` | Product-specific chat contract, local game state, Vite middleware, and stub/live AI. Game loop contract: `docs/CHAT_GAME_LOOP.md`. |
| Assets | `public/assets/`, `src/assets/manifest.ts`, `src/audio/` | Product media and manifest context for AI responses. |
| Theme layer | `src/styles/`, `src/theme/` | Signal 9 semantic tokens, preset themes, startup styling, and terminal layout. |
| Planned export work | `src/export/` | Empty today; `EXPORT_GUIDE.md` describes the target state. |

## Ownership Boundaries

### Signal 9 Should Own

- Product identity: broadcast resistance narrative, GHOST voice, copy, lore, characters, missions, and terminal tone.
- Startup sequence: loading screen, title screen, ASCII logo, startup audio fade, and begin-transmission flow.
- Application navigation: `AppShell`, route/screen IDs, Broadcast Terminal overlays, and mission/debrief screens.
- Product content: preset bundles, video sources, asset manifest, game state, AI response schema, game loop contract (`docs/CHAT_GAME_LOOP.md`), and prompt context.
- App-specific theme: `--s9-*` semantic tokens, preset theme overrides, terminal atmosphere, and Signal 9 layout/motion.
- Mission audio behavior: MP3 transmission tracks, Web Audio analysis, and the app decision to bypass synth playback during missions.
- Video-to-ASCII creative direction: source selection, preset profiles, transmission controls, and AI-driven visual source changes.
- Dev-only AI middleware until a product-owned production API is added.

### Plantasonic Platform Should Provide

- Platform SDK lifecycle, event bus, workspace region contract, preset bundle registry, plugin manager, project persistence, and performance controls.
- Design System shell, Creative Workspace, instrument components, token foundation, Bootstrap bridge, and reusable UI contracts.
- Visual Engine adapter contract and ASCII rendering engine integration.
- Audio Reactive Bridge contract and parameter mapping surface.
- Future stable mount API that replaces direct imports from `@plantasonic/platform-demo/*`.
- Shared validation expectations for thin applications without owning Signal 9 product behavior.

### Intentionally Replaced By Signal 9

- `plantasia-sound-engine` synth output is declared as a dependency but not used for mission playback. `src/platform/mp3SoundEngineAdapter.ts` supplies the sound adapter for MP3 transmission audio and analyzer features.
- `@plantasonic/platform-demo/instrument-app` is aliased to `src/platform/signal9InstrumentApp.ts`, which routes mounting through the Signal 9 forked instrument mount.
- Demo sound integration is partially replaced by `src/platform/signal9SoundIntegration.ts` while re-exporting shared demo panel helpers.
- Platform visual integration is reused, but Signal 9 adds video source loading, preset video profiles, and transmission control state.

### App-Specific Code That Should Stay

- `src/startup/`
- `src/navigation/`
- `src/ui/broadcastTerminal/`
- `src/ai/`, `src/game/`, and `server/broadcastChat.ts`
- `src/assets/manifest.ts`, `public/assets/`, and `src/audio/transmissionTracks.ts`
- `src/styles/signal9-theme.css`, `src/styles/preset-themes.css`, `src/styles/broadcast-terminal.scss`, and `src/theme/`
- Product content in `src/content/` and product config in `src/config/`

## Current Platform Dependencies

`package.json`, `vite.config.ts`, and `tsconfig.json` currently require sibling repositories on disk:

| Dependency or alias | Current source | Integration note |
|---------------------|----------------|------------------|
| `@plantasonic/platform` | `../plantasonic-platform/packages/sdk/src/index.ts` | Keep as the SDK foundation. Later switch to a stable workspace, package, or release import when available. |
| `@plantasonic/platform-types` | `../plantasonic-platform/packages/shared-types/src/index.ts` | Keep for contracts. |
| `@plantasonic/platform-demo/*` | `../plantasonic-platform/apps/demo/src/*` | High-risk demo-source coupling. Inventory and replace/promote in a later phase. |
| `@plantasonic/platform-demo/instrument-app` | `src/platform/signal9InstrumentApp.ts` | Local fork entrypoint; keep unchanged in Phase 1. |
| `plantasonic-design-system/*` | `node_modules/plantasonic-design-system/src/*` | Consume DS shell/instrument/creative-workspace APIs. Do not copy DS assets locally. |
| `ascii-visual-engine` | `../plantasonic-platform/packages/visual-engine/src/index.ts` | Keep as the stage renderer through Platform visual adapter. |
| `plantasia-sound-engine` | `../plantasonic-platform/packages/sound-engine` | Declared and optimized, but mission runtime uses MP3 adapter. Document this until dependency cleanup is approved. |

## Import Inventory And Classification

This inventory is the first pass for the future implementation phase. It does not authorize import replacement yet.

| Current import surface | Signal 9 usage | Classification | Proposed next step |
|------------------------|----------------|----------------|--------------------|
| `@plantasonic/platform` | `createApplication()`, `createVisualEngineAdapter()`, `PlatformApplication` types | Keep | Continue consuming as the core Platform SDK. |
| `@plantasonic/platform-types` | App config, workspace config, preset bundles, plugins, sound/visual adapters, bridge, snapshots | Keep | Continue consuming as the shared contract package. |
| `@plantasonic/platform-demo/instrument-app` | AppShell mount import and `InstrumentAppContent` type surface, aliased to Signal 9 local mount | Replace/promote | Replace only when Platform exposes a stable product-app mount API or App Kit entrypoint. |
| `@plantasonic/platform-demo/instrumentApp` | Type re-export from the upstream demo module | Promote | Move durable `InstrumentAppContent`/branding contracts into Platform/App Kit later. |
| `@plantasonic/platform-demo/bridgeIntegration` | Demo bridge creation, panel render, and wiring | Promote | Promote generic bridge wiring to Platform/App Kit; keep Signal 9 tuning in app code. |
| `@plantasonic/platform-demo/performanceIntegration` | Demo performance controls and panel | Promote | Promote reusable controls if they remain part of product app chrome. |
| `@plantasonic/platform-demo/pluginIntegration` | Demo plugin manager and panel | Promote | Promote plugin manager wiring or remove from Signal 9 if not product-facing. |
| `@plantasonic/platform-demo/presetIntegration` | Preset bundle registry, browser panel, wiring | Promote | Promote registry/browser primitives; keep Signal 9 preset content app-owned. |
| `@plantasonic/platform-demo/projectIntegration` | Demo project persistence controls | Replace/promote | Replace with Signal 9 saves later or promote generic project persistence into Platform. |
| `@plantasonic/platform-demo/soundIntegration` | Transport handlers, parameter panel, demo wiring re-exported by `signal9SoundIntegration.ts` | Replace/promote | Keep temporarily; replace sound creation with app-owned MP3 adapter remains intentional. |
| `@plantasonic/platform-demo/visualIntegration` | Stage mount, resize, visual controls re-exported by `signal9VisualIntegration.ts` | Promote | Promote generic visual stage wiring; keep video source/profile orchestration in Signal 9. |
| `plantasonic-design-system/*` | Shell, Creative Workspace, instrument components, CSS variables, Bootstrap bridge, SCSS | Keep | Continue consuming DS directly; do not copy DS token or Bootstrap source into Signal 9. |
| `ascii-visual-engine` | Startup logo scripts/types and live visual engine package dependency | Keep with boundary | Prefer access through Platform visual adapter for live stage; startup ASCII branding can remain app-owned. |
| `plantasia-sound-engine` | Package dependency and Vite optimize include, not mission runtime audio | Candidate cleanup | Defer removal until a runtime validation baseline confirms no hidden dependency. |

## Duplicated Or Coupled Areas Found

### Forked Platform Mount

- `src/platform/signal9InstrumentMount.ts` closely follows `plantasonic-platform/apps/demo/src/instrumentApp.ts`. It duplicates the demo orchestration surface for shell rendering, region binding, inspector panels, metrics, event logging, adapter creation, bridge setup, presets, plugins, performance controls, and project persistence.
- `src/platform/signal9InstrumentApp.ts` acts as the app-specific replacement for `@plantasonic/platform-demo/instrument-app`.
- This should not be removed yet. First document each demo import as `keep`, `promote to platform`, or `replace with app module`.

### Copied Platform-Like Code

- `src/platform/signal9SoundIntegration.ts` replaces demo sound adapter creation with the Signal 9 MP3 adapter while re-exporting demo transport and parameter-panel helpers.
- `src/platform/signal9VisualIntegration.ts` wraps Platform visual adapter creation while re-exporting demo stage, resize, and visual-control helpers.
- `src/platform/transmissionSession.ts` owns app-level play/stop lifecycle calls across MP3 playback, visual engine, bridge, and Platform lifecycle.
- `src/platform/transmissionControlState.ts` maps Signal 9 transmission controls into visual engine parameters.
- `src/platform/applySignal9Preset.ts` applies product preset decisions to audio, bridge, visual profile, and theme state.
- `src/platform/instrumentBootstrap.ts` coordinates Signal 9 bootstrap sequencing after the Platform instrument layer mounts.
- `src/platform/signal9AudioReactive.ts` stores the active bridge reference for app-owned preset/application code.
- `src/platform/bassEmojiPulse.ts` feeds product-specific bass glyph scaling into the visual adapter.

These are app orchestration shims over Platform services. Some may remain product-specific, but anything generic to engine/session lifecycle should be evaluated for future Platform promotion.

### Engines

- No local copy of `ascii-visual-engine` or `plantasia-sound-engine` source was found under `src/`.
- `node_modules/ascii-visual-engine` resolves to the sibling `../plantasonic-platform/packages/visual-engine` file dependency.
- Signal 9 uses the Platform visual adapter for the live stage and keeps startup ASCII logo behavior app-owned.
- Mission audio intentionally replaces synth runtime with `src/platform/mp3SoundEngineAdapter.ts`, which implements the shared `SoundEngineAdapter` contract.

### Design System Code

No local copy of Design System token files or Bootstrap theme files was found in `src/`. `scripts/validate-app.mjs` already guards against local `variables.css` and `bootstrap-theme.scss` copies.

Signal 9 does maintain an app semantic layer:

- `src/styles/signal9-theme.css`
- `src/styles/preset-themes.css`
- `src/theme/presetAsciiThemes.ts`
- `src/theme/applyPresetTheme.ts`

This should stay app-owned as long as `--s9-*` variables layer over Design System variables instead of replacing them.

### Hardcoded Tokens

Hardcoded color values exist in app-owned theme and visual identity files:

- `src/styles/signal9-theme.css`
- `src/styles/preset-themes.css`
- `src/styles/broadcast-terminal.scss`
- `src/theme/presetAsciiThemes.ts`
- `src/startup/AsciiLogo.ts`
- `src/platform/videoDemoSource.ts`

These are acceptable for the current product layer, but the integration phase should classify each value as either a Signal 9 semantic token, preset-specific identity value, or temporary fallback.

### Duplicated Utilities

- `clamp01()` exists in both `src/platform/mp3SoundEngineAdapter.ts` and `src/config/transmissionControls.ts`.
- `escapeHtml()` exists locally in `src/ui/broadcastTerminal/mountBroadcastTerminal.ts`.
- No shared `src/utils/` or copied utility package was found in the current app structure.

Do not refactor these in the first phase. Track them as candidates for local app utilities or future shared helpers only after runtime behavior is protected by validation.

### Templates And Shared Components

- No copied Platform template directory was found under `src/`.
- Shared UI is consumed from `plantasonic-design-system` imports rather than copied into app source.
- Product-specific UI lives in `src/ui/`, `src/ui/broadcastTerminal/`, and `src/navigation/screens/`; this should stay app-owned unless a component becomes broadly reusable across products.

### Audio, Visual, And ASCII Systems

Signal 9 currently has two ASCII contexts:

| Context | Current files | Ownership |
|---------|---------------|-----------|
| Startup branding | `src/startup/AsciiLogo.ts`, `src/startup/signal9Logo*.ts` | Signal 9 brand asset. |
| Live stage | `src/platform/signal9VisualIntegration.ts`, `src/platform/videoAsciiSession.ts` | Platform visual adapter plus Signal 9 video-to-ASCII orchestration. |

Signal 9 also has three audio contexts:

| Context | Current files | Ownership |
|---------|---------------|-----------|
| Startup title audio | `src/startup/StartupAudioController.ts` | Signal 9 startup brand behavior. |
| Mission playback | `src/platform/mp3SoundEngineAdapter.ts`, `src/audio/transmissionTracks.ts` | Signal 9 MP3 broadcast deck. |
| Audio reactivity | `src/platform/signal9AudioReactive.ts`, `src/config/audioReactiveConfig.ts`, `src/content/presetBundles.ts` | Platform bridge with Signal 9 tuning. |

## Import Strategy

Phase 1 should not change imports. It should establish an approved import map for later work:

1. Keep `@plantasonic/platform` and `@plantasonic/platform-types` as the primary reusable foundation.
2. Keep `plantasonic-design-system` imports for shell, instrument, Creative Workspace, CSS, and SCSS layers.
3. Keep `ascii-visual-engine` only through Platform visual adapter flows where possible.
4. Keep the MP3 sound adapter as the product-owned sound adapter unless a separate product decision reintroduces synth playback.
5. Inventory every `@plantasonic/platform-demo/*` import and decide whether it should become:
   - a Platform SDK/App Kit export,
   - a Signal 9 app module,
   - or a temporary demo dependency retained until Platform v1.0 packaging.
6. Defer package-path cleanup until the Platform has a stable package or app-kit import for the mount API.

## Risk Areas

| Risk | Why it matters | Phase 1 action |
|------|----------------|----------------|
| Demo-source coupling | `@plantasonic/platform-demo/*` points at demo source, not a stable package. | Create an import inventory and migration table. |
| Forked instrument mount | `signal9InstrumentMount.ts` is the largest duplicated orchestration surface. | Freeze behavior and document ownership before refactor. |
| Sound-engine ambiguity | `plantasia-sound-engine` is installed, but MP3 adapter is the runtime source. | Document MP3 adapter as intentional product replacement. |
| Dual control surfaces | Platform inspector/transport coexist with Signal 9 controls. | Map UI ownership before redesign. |
| Dual ASCII contexts | Startup ASCII and live stage ASCII have different lifecycles. | Keep both documented to avoid accidental consolidation. |
| Sibling path dependencies | Local development requires `../plantasonic-platform` and `../plantasonic-xyz/plantasonic-design-system`. | Keep until package strategy is approved. |
| Hardcoded colors | Some values are product identity, others may be fallbacks. | Classify; do not mass-replace. |
| Production AI gap | Vite middleware does not provide a static deployment API. | Keep as product roadmap item, not Platform integration work. |
| Export docs mismatch | `EXPORT_GUIDE.md` is aspirational while `src/export/` is empty. | Keep separate from Platform integration phase. |

## First Implementation Phase

### Milestone: Plantasonic Platform Integration

Goal: prepare Signal 9 to consume the frozen Platform cleanly while preserving current runtime behavior.

Scope:

1. Create an import inventory for all Platform, Platform Demo, Design System, engine, and local platform shim imports.
2. Add a boundary matrix to distinguish product-owned code from Platform-owned code.
3. Mark all `@plantasonic/platform-demo/*` imports for `keep`, `promote`, or `replace` decisions.
4. Document MP3 sound adapter behavior as the approved Signal 9 sound source for missions.
5. Document Signal 9 theme tokens as app-owned semantic tokens layered over Design System variables.
6. Run existing checks: `pnpm typecheck`, `pnpm build`, and `pnpm validate`.
7. Make no runtime, navigation, UI, engine, or import changes until the inventory is reviewed.

Out of scope:

- Rebuilding or redesigning UI.
- Moving files into `plantasonic-platform`.
- Replacing imports.
- Modifying `plantasonic-platform` or `plantasonic-xyz`.
- Rewriting audio, visual, or ASCII engines.
- Changing product navigation.

## Proposed Integration Path

1. **Documentation and inventory** — complete this plan and update roadmap.
2. **Validation baseline** — run existing app validation and record current warnings.
3. **Import inventory PR** — add a machine-readable or markdown import map without changing imports.
4. **Mount API decision** — wait for or define a stable Platform app-kit/mount import before replacing demo-source imports.
5. **Sound adapter decision** — keep MP3 adapter as product-owned unless a product milestone explicitly changes mission audio.
6. **Theme audit** — classify hardcoded colors into `--s9-*`, preset identity, or fallback categories.
7. **Incremental runtime migration** — only after tests cover current startup, Broadcast Terminal, MP3 playback, video-to-ASCII, and AI response application.
