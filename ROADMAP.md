# Signal 9 Roadmap

**Single source of truth for Signal 9 development.**

Signal 9 is an **AI-first interactive cyberpunk broadcast terminal** built on the Plantasonic platform. Chat drives the game, the soundtrack, and the visual experience. The ASCII branding, startup sequence, and retro console identity are permanent — everything after entry evolves through conversation.

**Last audited:** June 2026 · **Version:** 0.1.0

---

## Current snapshot

| Phase | Name | Status | Completion |
|-------|------|--------|------------|
| 1 | Foundation | ✅ Complete | ~95% |
| 2 | Visual Experience | ✅ Complete | ~90% |
| 3 | Audio Engine | 🚧 In Progress | ~78% |
| 4 | AI Platform | 🚧 In Progress | ~65% |
| 5 | Signal 9 Game | 🚧 In Progress | ~40% |
| 6 | Retro Console UI | 🚧 In Progress | ~88% |
| 7 | Asset Library | 🚧 In Progress | ~60% |
| 8 | Visual Reactivity | ✅ Complete | ~85% |
| 9 | Content Creation Tools | ⬜ Planned | ~0% |
| 10 | Signal 9 Platform | ⬜ Planned | ~15% |
| 11 | Plantasonic Platform Integration | 🚧 Phase 1.1 | ~40% |

### What works today

After **Cold boot → Signal authentication → Press ENTER**, the player enters the **Home Terminal**: a permanent resistance communications HUD with chat on the left, the live ASCII/video stage in the center, Signal 9 Radio on the right, and a bottom telemetry bar. GHOST (AI) returns structured JSON that can retune soundtrack, video-to-ASCII, mission state, lore unlocks, character discoveries, and player choices. Game state persists in `localStorage`. Stub AI works without an API key; OpenAI works in dev/preview when `OPENAI_API_KEY` is set.

### Immediate next milestones

1. **Production AI API** — serverless route for static `dist/` deployments
2. **Plantasonic Platform Integration implementation prep** — review the import map and approve the future Platform/App Kit mount API before runtime import changes
3. **External radio ingest** — connect Mixcloud, SoundCloud, and streaming radio modes beyond prototype source selection
4. **Rich lore panel** — render full transmission body text, not just titles
5. **GIF export UI** — wire engine export APIs to Menu panel (documented but not built)
6. **Mission completion flow** — wire debrief or remove dead navigation paths

---

## Phase 1 — Foundation

**Status:** ✅ Complete

### Goal

Establish Signal 9 as a standalone thin app on Plantasonic — correct repo layout, platform aliases, design system layering, and persistent application shell without modifying upstream engines.

### Description

Signal 9 references `../plantasonic-platform` and `plantasonic-design-system` via Vite aliases. The app follows the Plantasonic thin-app model: platform orchestration lives in the SDK; Signal 9 owns content, theme, navigation, and overlays.

### Deliverables

| Deliverable | Status | Location |
|-------------|--------|----------|
| Vite + TypeScript project setup | ✅ | `package.json`, `vite.config.ts`, `tsconfig.json` |
| Plantasonic SDK integration | ✅ | `src/platform/signal9InstrumentMount.ts` |
| Design System import order | ✅ | `src/styles/index.scss` |
| Signal 9 semantic tokens (`--s9-*`) | ✅ | `src/styles/signal9-theme.css` |
| DS color bridges (no layout duplication) | ✅ | `.s9-themed` overrides |
| Application shell (dual-layer) | ✅ | `src/navigation/AppShell.ts` |
| Instrument + screen layer layout | ✅ | `src/styles/app-layout.scss` |
| App content injection | ✅ | `src/appContent.ts`, `src/content/plugins.ts` |
| Shell config (instrument mode) | ✅ | `src/config/shellConfig.ts` |
| Structural validation script | ✅ | `scripts/validate-app.mjs` |
| Sibling repo documentation | ✅ | `README.md` |

### Dependencies

- Node.js ≥ 20
- `../plantasonic-platform` (SDK, visual-engine, sound-engine)
- `../plantasonic-xyz/plantasonic-design-system`

### Future expansion

- CI pipeline and automated validation in PR checks
- `ARCHITECTURE.md` split from README for contributor onboarding
- Environment-specific config (staging vs production API hosts)

---

## Phase 2 — Visual Experience

**Status:** ✅ Complete

### Goal

Deliver the Signal 9 visual identity: preserved ASCII branding, boot animation, startup sequence, and a live ASCII Visual Engine stage as the sole renderer.

### Description

All stage output is rendered by `ascii-visual-engine` through the Plantasonic `VisualEngineAdapter`. Signal 9 does not fake visuals in CSS or a secondary canvas. The startup sequence (loading screen, ASCII logo art, title screen, click-to-start) is treated as permanent brand assets and must not be redesigned.

### Deliverables

| Deliverable | Status | Location |
|-------------|--------|----------|
| ASCII logo art + grid + animation script | ✅ | `src/startup/signal9Logo*.ts`, `AsciiLogo.ts` |
| Loading screen | ✅ | `src/startup/LoadingScreen.ts` |
| Title screen + CRT treatment | ✅ | `src/startup/TitleScreen.ts` |
| Startup controller flow | ✅ | `src/startup/StartupController.ts` |
| Startup audio fade | ✅ | `src/startup/StartupAudioController.ts` |
| ASCII Visual Engine mount | ✅ | `src/platform/signal9VisualIntegration.ts` |
| Video-to-ASCII pipeline | ✅ | `src/platform/videoAsciiSession.ts` |
| Per-preset video ASCII profiles | ✅ | `src/content/videoVisualPresets.ts` |
| Video source configuration | ✅ | `src/config/videoSources.ts` |
| Demo canvas fallback (no video file) | ✅ | `src/platform/videoDemoSource.ts` |
| Video background on/off toggle | ✅ | `VideoTransmissionControls.ts` |
| Preset theme overlays | ✅ | `src/theme/`, `preset-themes.css` |
| Responsive app layout modes | ✅ | `app-layout.scss`, `broadcast-terminal.scss` |
| Background image overlay (AI-driven) | ✅ | `applyBroadcastResponse.ts` |
| Per-preset unique video loops | 🚧 | Same demo loop may back multiple presets |
| Webcam source UI | ⬜ | Engine-ready; no Signal 9 UI |
| Image upload source UI | ⬜ | Engine-ready; no Signal 9 UI |
| Procedural-only mode UI | ⬜ | `setVideoBackgroundEnabled(false)` exists |

### Dependencies

- Phase 1
- Video assets in `public/assets/video/`
- Visual engine built in plantasonic-platform

### Future expansion

- Unique MP4 per preset (currently profile-differentiated loops)
- Webcam / image / canvas capture panels in VIDEO ASCII menu
- Full-screen immersive mode (hide console chrome)

---

## Phase 3 — Audio Engine

**Status:** 🚧 In Progress

### Goal

Reframe the transmission player as the **Signal 9 Radio** — preset-bound soundtracks and future external relays that react to mission, location, mood, and AI state.

### Description

Mission audio uses local MP3 files analyzed via Web Audio (`mp3SoundEngineAdapter.ts`). The plantasia sound-engine synth is intentionally not started during missions. Each preset bundle pairs a track, bridge sensitivity, and video ASCII profile. AI responses can switch presets via `applySignal9Preset()`.

### Deliverables

| Deliverable | Status | Location |
|-------------|--------|----------|
| Four preset MP3 tracks | ✅ | `public/assets/audio/`, `transmissionTracks.ts` |
| MP3 sound adapter + Web Audio analysis | ✅ | `mp3SoundEngineAdapter.ts` |
| Audio Reactive Bridge integration | ✅ | `signal9AudioReactive.ts`, `presetBundles.ts` |
| Signal 9 Radio panel | ✅ | `mountBroadcastTerminal.ts` |
| Waveform / spectrum / progress / volume UI | ✅ | `mountBroadcastTerminal.ts`, `mp3SoundEngineAdapter.ts` |
| Full deck in MENU (presets + transport) | ✅ | `TransmissionControls.ts`, `ControlMenu.ts` |
| AI-driven track switching | ✅ | `applyBroadcastResponse.ts` |
| Preset theme + bridge on switch | ✅ | `applySignal9Preset.ts` |
| Bass-reactive glyph scale pulse | ✅ | `bassEmojiPulse.ts` |
| Blackout video-only preset (no dedicated MP3) | ✅ | Documented intentional behavior |
| `startup.mp3` on disk | 🚧 | Present but not wired in code |
| Playlist / queue support | ⬜ | — |
| Crossfade between tracks | ⬜ | — |
| Mixcloud integration | 🚧 | Source selector exists; ingest/auth pending |
| SoundCloud integration | 🚧 | Source selector exists; ingest/auth pending |
| Streaming radio mode | 🚧 | Source selector exists; stream URL handling pending |
| Asset manifest (songs) | ✅ | `src/assets/manifest.ts` |

### Dependencies

- Phase 1, Phase 2
- Phase 4 (AI drives track changes)

### Future expansion

- Live streaming ingest (Icecast, HLS)
- External playlist URLs with manifest registration
- Dedicated Blackout carrier track
- Audio-reactive stem layers (procedural music)

---

## Phase 4 — AI Platform

**Status:** 🚧 In Progress

### Goal

Make chat the game engine. GHOST acts as narrator, game master, mission generator, character controller, and lore keeper — returning structured JSON that drives the entire interface.

### Description

The player explores the resistance grid entirely through the command terminal. AI responses follow `AiBroadcastResponse` schema and are applied via `applyBroadcastResponse()` to game state, soundtrack, video, ASCII profile, lore, and choices.

### Deliverables

| Deliverable | Status | Location |
|-------------|--------|----------|
| Typed `BroadcastGameState` | ✅ | `src/game/types.ts` |
| Game state store + localStorage | ✅ | `src/game/gameState.ts` |
| Structured AI response schema | ✅ | `src/ai/broadcastResponse.ts` |
| Chat client | ✅ | `src/ai/chatClient.ts` |
| Response → interface applier | ✅ | `src/ai/applyBroadcastResponse.ts` |
| Dev API route (`POST /api/broadcast/chat`) | ✅ | `server/broadcastChat.ts`, `vite.config.ts` |
| OpenAI structured JSON output | ✅ | When `OPENAI_API_KEY` set |
| Stub AI (keyword branches) | ✅ | `server/broadcastChat.ts` |
| Asset manifest in system prompt | ✅ | `manifestContextForAi()` |
| Dynamic player choices (1–3 buttons) | ✅ | Broadcast Terminal UI |
| Conversation history | ✅ | `conversationHistory` in game state |
| Production serverless API | ⬜ | Required for static `dist/` deploy |
| API auth / rate limiting | ⬜ | — |
| Procedural mission graph | ⬜ | — |
| NPC-specific prompt fragments | ⬜ | — |
| Voice input | ⬜ | — |
| TTS narration | ⬜ | — |
| Stub briefing/debrief generators | 🚧 | `src/ai/stub/` — exist but UI bypassed |

### Dependencies

- Phase 1, Phase 3, Phase 7 (manifest IDs)
- `.env` with `OPENAI_API_KEY` for live AI

### Future expansion

- Mission graph state machine (nodes, conditions, flags)
- Multi-model routing (fast narrator vs deep planner)
- Conversation memory summarization for long sessions
- Tool calls (search manifest, roll dice, update inventory)

---

## Phase 5 — Signal 9 Game

**Status:** 🚧 In Progress

### Goal

Build the narrative game layer on top of chat — locations, characters, lore, factions, missions, inventory, and persistent progression.

### Description

`BroadcastGameState` models the world. AI unlocks lore and characters over time; the right panel surfaces discoveries. Full mission systems, branching narrative graphs, scoring, and save slots are not yet implemented. Legacy `MissionRun` / debrief screens exist but are disconnected from the main flow.

### Deliverables

| Deliverable | Status | Location |
|-------------|--------|----------|
| Game state model (all core fields) | ✅ | `src/game/types.ts` |
| Lore unlock storage | ✅ | `gameState.unlockLore()` |
| Character discovery storage | ✅ | `gameState.discoverCharacters()` |
| Inventory field (typed, unused) | 🚧 | `inventory: InventoryItem[]` |
| Mission objective in UI | ✅ | Right panel + status bar |
| AI-driven location/mission updates | ✅ | Via `applyBroadcastResponse` |
| Lore panel (titles only) | 🚧 | `body` text stored, not rendered |
| Formal location system | 🚧 | Manifest entries; no map UI |
| Faction reputation | ⬜ | — |
| Inventory UI + mechanics | ⬜ | — |
| Branching narrative graph | ⬜ | Emergent from chat only |
| Mission database | ⬜ | Ephemeral `MissionRun` only |
| Mission completion / debrief flow | ⬜ | `missionDebrief.ts` unreachable |
| Beat Runner lane mechanics | ⬜ | Referenced in stubs only |
| Scoring / grades | ⬜ | Stub debrief exists |
| Multiple save slots | ⬜ | Single `localStorage` key |
| Save export / import | ⬜ | — |

### Dependencies

- Phase 4 (AI generates and unlocks content)
- Phase 7 (manifest defines world entities)

### Future expansion

- Mission editor output format consumed by game state
- Faction standing affecting AI tone and available choices
- Rhythm/scoring layer optional on top of chat missions (Beat Runner Phase)

---

## Phase 6 — Retro Console UI

**Status:** 🚧 In Progress

### Goal

The application must feel like operating an underground resistance broadcast system — not a SaaS dashboard. Minimal, black, violet, monochrome, CRT-inspired, terminal typography.

### Description

The Broadcast Terminal is the primary post-entry UI: status bar, deck, transparent center (engine stage), lore panel, chat terminal, AI choice buttons, and footer telemetry. Platform chrome (MENU, VIDEO ASCII, transmission bar) remains accessible at the bottom. Design system components are reused; Signal 9 adds layout and atmosphere via `--s9-*` tokens only.

### Deliverables

| Deliverable | Status | Location |
|-------------|--------|----------|
| Home Terminal HUD layout | ✅ | `mountBroadcastTerminal.ts` |
| Terminal screen layer mode | ✅ | `AppShell`, `app-layout.scss` |
| Header status bar (SIGNAL 9, location, mission, NET, TX) | ✅ | Home Terminal |
| Command terminal + chat history | ✅ | Left panel |
| Three dynamic AI choice buttons | ✅ | Left panel |
| Center ASCII Visual Engine frame | ✅ | Transparent over Platform stage |
| Signal 9 Radio panel | ✅ | Right panel |
| Mission / Memory / Echo panels | ✅ | Right panel |
| Bottom HUD telemetry | ✅ | Frequency, signal, Echo, memory, TX, CPU, FPS, mission, district, time |
| Responsive console (mobile collapse) | ✅ | `broadcast-terminal.scss` |
| Terminal primitives (boot lines, prompts) | ✅ | `src/ui/terminal.ts` |
| Control Menu (collapsible) | ✅ | `ControlMenu.ts` |
| VIDEO ASCII panel | ✅ | `VideoTransmissionControls.ts` |
| Transmission debug overlay (`?debug`) | ✅ | `transmissionDebugOverlay.ts` |
| Official Signal 9 design language | ✅ | `docs/VISUAL_LANGUAGE.md` |
| Art direction doctrine | ✅ | `docs/ART_DIRECTION.md` |
| UI principles | ✅ | `docs/UI_PRINCIPLES.md` |
| v0 / Figma design guidelines | ✅ | `docs/V0_DESIGN_GUIDELINES.md` |
| Radio interface | ⬜ | — |
| Transmission browser | ⬜ | — |
| ASCII progress bars | ⬜ | — |
| Dedicated mission console screen | ⬜ | Merged into Broadcast Terminal |
| Lore detail expansion UI | ⬜ | — |
| Inventory panel | ⬜ | — |

### Dependencies

- Phase 1 (tokens), Phase 2 (stage), Phase 4 (chat data)

### Future expansion

- Scanline intensity tied to `networkStatus`
- Glitch transitions on mission change
- Keyboard shortcuts (vim-style command mode)
- Second screen / cast layout for streamers

---

## Phase 7 — Asset Library

**Status:** 🚧 In Progress

### Goal

Centralize all broadcast assets in a structured manifest that feeds the AI, the UI, and future content tools.

### Description

`SIGNAL_9_ASSET_MANIFEST` defines songs, videos, images, characters, locations, and lore with shared metadata: `id`, `title`, `description`, `tags`, `mood`, `location`, `faction`, `mission`, `relatedAssets`, `filePath`. The manifest is serialized into the AI system prompt for consistent ID references.

### Deliverables

| Deliverable | Status | Location |
|-------------|--------|----------|
| Manifest type system | ✅ | `src/assets/manifest.ts` |
| Song entries (4 presets) | ✅ | Derived from `transmissionTracks.ts` |
| Video entries (5 sources) | ✅ | Derived from `videoSources.ts` |
| Character entries (3) | ✅ | Manifest |
| Location entries (3) | ✅ | Manifest |
| Lore entries (3) | ✅ | Manifest |
| Image entries (2 SVG placeholders) | 🚧 | `public/assets/images/` |
| `getManifestAsset()` lookup | ✅ | Manifest |
| `manifestContextForAi()` | ✅ | Manifest |
| Tag-based search / filter | ⬜ | — |
| Automatic asset discovery (filesystem scan) | ⬜ | Manual config today |
| Asset validation at build time | 🚧 | `validate-app.mjs` checks audio paths only |
| CDN / optimized delivery pipeline | ⬜ | — |
| Rich image library | ⬜ | 2 placeholder SVGs |

### Dependencies

- Phase 1
- Assets on disk in `public/assets/`

### Future expansion

- Build step that generates manifest from folder scan
- Thumbnail generation for videos
- Related-asset graph visualization in debug tools
- User-uploaded assets registered at runtime

---

## Phase 8 — Visual Reactivity

**Status:** ✅ Complete

### Goal

The ASCII stage must breathe with the broadcast — reacting to music, AI state changes, and gameplay events.

### Description

Audio features from the MP3 analyzer feed the Platform Audio Reactive Bridge, which modulates engine parameters (density, motion, brightness, glitch). Bass drives glyph scale pulses. AI responses switch video sources, ASCII profiles, and preset themes. Slider controls map through `transmissionControlState.ts` with tuned 25%–75% threshold bands.

### Deliverables

| Deliverable | Status | Location |
|-------------|--------|----------|
| Bridge mapping (bass→density, etc.) | ✅ | `presetBundles.ts` |
| Per-preset bridge sensitivity | ✅ | Preset bundles |
| Audio reactive boost tuning | ✅ | `audioReactiveConfig.ts` |
| Bass emoji / glyph scale pulse | ✅ | `bassEmojiPulse.ts`, `AsciiEngine` |
| AI-driven preset + video switch | ✅ | `applyBroadcastResponse.ts` |
| AI-driven ASCII profile apply | ✅ | `applyVideoAsciiProfileForPreset` |
| Transmission control sliders (sync) | ✅ | `transmissionControlState.ts` |
| Threshold / effect 25%–75% bands | ✅ | `transmissionControls.ts` |
| Video post passes (threshold, feedback, scanlines, glitch) | ✅ | Engine + adapter |
| Background image blend on AI signal | ✅ | `[data-s9-bg-image]` overlay |
| ASCII reacts to explicit gameplay events | 🚧 | Only via AI preset changes |
| Video sync to beat clock | ⬜ | — |
| Image crossfade transitions | ⬜ | Instant opacity today |
| Particle systems | ⬜ | — |
| Camera effects | ⬜ | — |
| Screen glitch on NET degraded | ⬜ | Status exists; no visual hook |
| Broadcast interference bursts | 🚧 | Glitch slider + transients |

### Dependencies

- Phase 2, Phase 3, Phase 4

### Future expansion

- Mood → default slider profiles
- `networkStatus: degraded` triggers interference shader pass
- Gameplay event bus → visual engine (inventory pickup, mission fail)

---

## Phase 9 — Content Creation Tools

**Status:** ⬜ Planned

### Goal

Give operators and developers in-app tools to author missions, lore, characters, assets, and broadcasts without editing source files.

### Description

No content creation UI exists today. All lore, characters, and missions are defined in `manifest.ts` or generated ephemerally by AI. Platform inspector/sidebar are disabled in shell config but underlying mount code could support future panels.

### Deliverables

| Deliverable | Status |
|-------------|--------|
| Mission editor | ⬜ |
| Lore editor | ⬜ |
| Character editor | ⬜ |
| Asset browser | ⬜ |
| Broadcast editor | ⬜ |
| Playlist editor | ⬜ |
| Developer tools panel | 🚧 | Debug overlay only (`?debug`) |
| GIF / frame export UI | ⬜ | Engine APIs exist; `src/export/` empty |
| MP4 / WebM export UI | ⬜ | See `EXPORT_GUIDE.md` (aspirational) |

### Dependencies

- Phase 7 (manifest as save format)
- Phase 5 (game state schema)

### Future expansion

- Export authored content to manifest JSON
- Live preview against ASCII stage
- Version control friendly mission files in `content/`

---

## Phase 10 — Signal 9 Platform

**Status:** ⬜ Planned (~15% — local persistence + lore unlocks only)

### Goal

Signal 9 becomes a living broadcast archive — the website grows richer as the player progresses, with persistent identity, unlockable lore, and a path to multiplayer and live radio.

### Description

Today, progression is local-only (`signal9-broadcast-state-v1` in `localStorage`). Unlocked lore and characters populate the terminal automatically. Cloud saves, player journal, broadcast archive browser, multiplayer, and voice interaction are roadmap goals aligned with the original platform vision.

### Deliverables

| Deliverable | Status | Location |
|-------------|--------|----------|
| Auto-unlock lore in UI | 🚧 | Titles only |
| Auto-discover characters in UI | ✅ | Right panel |
| localStorage game persistence | ✅ | `gameState.ts` |
| AI-generated website content | ⬜ | — |
| Player journal | ⬜ | — |
| Broadcast archive browser | ⬜ | — |
| Cloud save / sync | ⬜ | — |
| Progress tracking / achievements | ⬜ | — |
| Multiplayer architecture | ⬜ | — |
| Voice interaction | ⬜ | — |
| Live radio / shared broadcast | ⬜ | — |
| Auth / operator accounts | ⬜ | — |

### Dependencies

- Phases 4, 5, 7, 9
- Production API hosting

### Future expansion

- Shared session spectating (read-only terminal sync)
- Operator vs listener roles
- Scheduled broadcast events
- Procedural world generation from seed + AI

---

## Phase 11 — Plantasonic Platform Integration

**Status:** 🚧 Phase 1.1 (~40% — import map and git baseline established)

### Goal

Prepare Signal 9 to consume the frozen Plantasonic Platform as an independent product application without rebuilding the UI, redesigning navigation, rewriting engines, or moving product code into the Platform.

### Description

Plantasonic Platform is the reusable AI First Application Platform foundation. Signal 9 remains a separate product app that owns its broadcast identity, startup sequence, AI/game layer, MP3 transmission deck, video-to-ASCII direction, `--s9-*` semantic theme, and product content.

The first milestone connected explicit Signal 9 dependencies on the frozen Platform SDK and shared types while preserving runtime behavior, imports, navigation, and engine behavior. Phase 1.1 adds a concrete import map and tracks the app runtime/source baseline in git. Design System imports remain direct because the current Platform SDK does not expose replacement shell, instrument, Creative Workspace, CSS, or token entrypoints.

### Deliverables

| Deliverable | Status | Location |
|-------------|--------|----------|
| Integration plan | ✅ | `docs/PLATFORM_INTEGRATION_PLAN.md` |
| Ownership boundary matrix | ✅ | `docs/PLATFORM_INTEGRATION_PLAN.md` |
| Platform/demo/design/engine dependency inventory | ✅ | `docs/PLATFORM_INTEGRATION_PLAN.md` |
| `@plantasonic/platform-demo/*` import classification | ✅ | Keep / promote / replace table documented |
| Import map | ✅ | `docs/PLATFORM_IMPORT_MAP.md` |
| Git app baseline | ✅ | Runtime/source files tracked; handoff note and stale pnpm lock ignored |
| Platform SDK dependency wiring | ✅ | `package.json`, `package-lock.json` |
| Safe Design System import replacement | ⏸️ Deferred | No Platform package DS export surface exists yet |
| MP3 sound adapter boundary documented | ✅ | `docs/PLATFORM_INTEGRATION_PLAN.md`, Phase 3 |
| Signal 9 theme token boundary documented | ✅ | `docs/PLATFORM_INTEGRATION_PLAN.md`, README theme section |
| Validation baseline | ✅ | `npm install`, `npm run typecheck`, `npm run build`, `npm run validate` |
| Runtime import replacement | ⬜ | Explicitly deferred |

### First implementation phase

1. ✅ Inventory every import from `@plantasonic/platform`, `@plantasonic/platform-types`, `@plantasonic/platform-demo/*`, `plantasonic-design-system`, `ascii-visual-engine`, and local `src/platform/*` shims.
2. ✅ Classify each `@plantasonic/platform-demo/*` dependency as `keep`, `promote to Platform/App Kit`, or `replace with Signal 9 module`.
3. ✅ Add explicit local package dependencies for `@plantasonic/platform` and `@plantasonic/platform-types`.
4. ✅ Preserve `src/platform/mp3SoundEngineAdapter.ts` as the product-owned mission audio adapter unless a separate product milestone changes audio direction.
5. ✅ Keep `src/styles/signal9-theme.css`, `src/styles/preset-themes.css`, and `src/theme/` as app-owned theme identity layered over Design System variables.
6. ⏸️ Defer Design System import replacement until Platform exposes safe DS entrypoints.
7. ✅ Add validation evidence before any runtime changes.
8. ✅ Add `docs/PLATFORM_IMPORT_MAP.md` as the current import decision source for Phase 1.1.
9. ✅ Establish a git baseline for app runtime/source files.

### Out of scope

- UI rebuild or redesign
- Navigation changes
- Engine rewrites
- Moving Signal 9 into `plantasonic-platform`
- Modifying `plantasonic-platform` or `plantasonic-xyz`
- Replacing imports before the inventory is approved

### Risks

- `@plantasonic/platform-demo/*` imports couple the product app to demo source rather than stable Platform package APIs.
- `src/platform/signal9InstrumentMount.ts` duplicates demo orchestration and is the largest migration surface.
- `plantasia-sound-engine` is installed while mission audio intentionally uses the MP3 adapter.
- Startup ASCII and live stage ASCII have separate lifecycles and should not be accidentally merged.
- Hardcoded product colors need classification before any token cleanup.
- Local npm config disables dependency scripts and bin links today to avoid running sibling package prepare scripts or installing the unused Design System CLI bin.
- Typecheck required a browser timer handle annotation in `src/startup/LoadingScreen.ts`; runtime behavior is unchanged.
- Runtime import replacement remains blocked on a stable Platform/App Kit mount API.

---

## Architecture reference

### System diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  STARTUP (preserved)                                            │
│  Loading → Title → ASCII Logo → Begin Transmission              │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  AppShell                                                       │
│  ┌──────────────────────────────┐  ┌──────────────────────────┐ │
│  │ instrument-layer (z:1)       │  │ screen-layer (z:2)       │ │
│  │ Plantasonic mount            │  │ Broadcast Terminal         │ │
│  │ ├─ ASCII Visual Engine     │  │ ├─ Status / Deck / Lore    │ │
│  │ ├─ Video-to-ASCII          │  │ ├─ Chat + AI choices       │ │
│  │ ├─ MP3 → Web Audio → Bridge│  │ └─ Footer telemetry        │ │
│  │ └─ MENU / VIDEO ASCII      │  │ (transparent center)       │ │
│  └──────────────────────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                             ▲
                             │ applyBroadcastResponse()
┌────────────────────────────┴────────────────────────────────────┐
│  POST /api/broadcast/chat → AiBroadcastResponse (JSON)          │
│  OpenAI (live) or stub AI (offline)                             │
└─────────────────────────────────────────────────────────────────┘
```

### Key paths

| Concern | Path |
|---------|------|
| Entry | `src/main.ts` |
| Startup | `src/startup/` |
| Navigation | `src/navigation/AppShell.ts` |
| Broadcast Terminal | `src/ui/broadcastTerminal/` |
| Game state | `src/game/` |
| AI | `src/ai/`, `server/broadcastChat.ts` |
| Manifest | `src/assets/manifest.ts` |
| Platform mount | `src/platform/signal9InstrumentMount.ts` |
| Theme | `src/styles/signal9-theme.css` |
| Assets | `public/assets/{audio,video,images}/` |

### AI response contract

See `src/ai/broadcastResponse.ts`. Fields map to game state and engine hooks in `applyBroadcastResponse.ts`:

`narration` · `location` · `mission` · `mood` · `track` · `visualPreset` · `asciiPreset` · `backgroundVideo` · `backgroundImage` · `unlockLore` · `discoverCharacters` · `choices`

---

## Known gaps and technical debt

| Item | Severity | Notes |
|------|----------|-------|
| Legacy "Beat Runner" branding | Low | `index.html`, `branding.ts`, `appConfig.ts` |
| GIF export documented but missing | Medium | `EXPORT_GUIDE.md` references non-existent `src/export/` |
| Mission debrief unreachable | Low | `missionDebrief.ts` — wire or remove |
| Lore body not rendered | Medium | Quick win in Phase 6 |
| Production API missing | High | Blocks live AI on static deploy |
| `startup.mp3` unused | Low | On disk, not wired |
| Single localStorage save | Medium | No reset UI, no slots |
| Blackout shares broadcast MP3 | Low | Intentional for now |

---

## Document index

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Setup, architecture overview, theme tokens |
| [ROADMAP.md](ROADMAP.md) | **This file** — development phases and status |
| [docs/VISUAL_LANGUAGE.md](docs/VISUAL_LANGUAGE.md) | Official Signal 9 visual operating philosophy |
| [docs/ART_DIRECTION.md](docs/ART_DIRECTION.md) | Art direction and reference language |
| [docs/UI_PRINCIPLES.md](docs/UI_PRINCIPLES.md) | Screen, component, panel, interaction, and interface rules |
| [docs/V0_DESIGN_GUIDELINES.md](docs/V0_DESIGN_GUIDELINES.md) | v0 prompt templates and Figma guidance |
| [EXPORT_GUIDE.md](EXPORT_GUIDE.md) | Aspirational export docs (UI not implemented) |
| [public/assets/video/README.md](public/assets/video/README.md) | Video asset mapping |
| [.env.example](.env.example) | OpenAI configuration |

---

## Version history

| Version | Focus |
|---------|-------|
| 0.1.0 | Foundation, visual experience, Broadcast Terminal MVP, AI chat, manifest, audio/video engine integration |
