# Signal 9 — AI Broadcast Terminal

Underground resistance broadcast experience built on [Plantasonic Platform](https://github.com/) architecture — a **standalone** app that references the platform without living inside its monorepo.

**Chat is the game.** After the preserved startup sequence (loading → title → begin transmission), the **Broadcast Terminal** becomes the primary interface: GHOST (AI) narrates, missions evolve through conversation, and every response can retune soundtrack, video-to-ASCII, lore, and mission state.

> **Development status:** See [ROADMAP.md](ROADMAP.md) — the single source of truth for phases, completion status, and milestones.

## Current development status

| Phase | Area | Status |
|-------|------|--------|
| 1 | Foundation (Plantasonic, DS, shell) | ✅ Complete |
| 2 | Visual experience (startup, ASCII engine, video) | ✅ Complete |
| 3 | Audio engine (Broadcast Deck, MP3 presets) | 🚧 In Progress |
| 4 | AI platform (chat, structured responses) | 🚧 In Progress |
| 5 | Game (locations, lore, missions) | 🚧 In Progress |
| 6 | Retro console UI (Broadcast Terminal) | 🚧 In Progress |
| 7 | Asset library (manifest) | 🚧 In Progress |
| 8 | Visual reactivity (audio + AI driven) | ✅ Complete |
| 9 | Content creation tools | ⬜ Planned |
| 10 | Platform (cloud saves, archive, multiplayer) | ⬜ Planned |

### What works in v0.1.0

| Area | Status |
|------|--------|
| Startup / ASCII logo / title sequence | **Preserved** — permanent brand assets |
| Broadcast Deck (MP3 + preset engine) | **Live** — left panel + MENU controls |
| AI Chat Terminal | **Live** — stub AI offline; OpenAI when `OPENAI_API_KEY` set |
| ASCII Visual Display | **Live** — video-to-ASCII + audio reactive bridge |
| Image overlay | **Live** — manifest-driven background images |
| Mission / Lore panel | **Partial** — unlocks list titles; full body text pending |
| Game state persistence | **Live** — `localStorage` (`signal9-broadcast-state-v1`) |
| Structured AI JSON | **Live** — track, video, lore, choices drive UI |
| GIF export UI | **Not built** — engine-ready; see ROADMAP Phase 9 |
| Production AI API | **Not built** — dev/preview middleware only |

### Quick start (AI)

```bash
cp .env.example .env
# Add OPENAI_API_KEY — optional; stub AI works without it
pnpm dev
```

Dev server exposes `POST /api/broadcast/chat` (Vite middleware). Production static builds need a matching API host for live AI — see ROADMAP Phase 4.

### Next milestones

1. Production AI API (serverless route for `dist/`)
2. Rich lore panel (render full transmission body)
3. GIF export UI (wire engine APIs to Menu)
4. Branding cleanup (legacy "Beat Runner" labels)
5. Mission completion / debrief flow

## Experience flow

0. **Loading** → **Title** → **Start Run** → **Broadcast Terminal** (mission briefing auto-launches transmission)

Legacy screen ids (`beat-runner`) delegate to the broadcast terminal. Mission debrief remains available for future scoring loops.

### Transmission audio (MP3)

Four preset tracks live in `public/assets/audio/`:

| Preset | File |
|--------|------|
| Broadcast | `atmo-beats4.mp3` |
| Interference | `dead-wave-prime1.mp3` |
| Jammer | `ghost-sonic-shadow.mp3` |
| Uplink | `dust-data-loops.mp3` |

During missions, the active preset’s MP3 is the **only** audio source for the Platform Audio Reactive Bridge — the plantasia sound-engine synth is not started. Analysis (bass, mids, highs, amplitude, transients) is derived from the MP3 via Web Audio and mapped into the ASCII Visual Engine.

The startup sequence uses the Broadcast track for the title-screen fade, then the instrument session takes over after **BEGIN TRANSMISSION**.

### Video-to-ASCII (Visual Engine)

Place video loops in `public/assets/video/` (see `public/assets/video/README.md`).

```
video asset (public/assets/video/*.mp4)
  → VisualEngineAdapter.loadVideoSource()
  → ascii-visual-engine VideoSource
  → ASCII renderer → stage canvas
  → Audio Reactive Bridge (bass→density, mids→motion, highs→brightness, peaks→glitch)
```

Configured in `src/config/videoSources.ts`. Controlled via the **VIDEO ASCII** panel:

| Control | Engine parameter |
|---------|------------------|
| Source selector | `loadVideoSource` |
| Play / Pause / Restart | video transport |
| ASCII Intensity | `density` |
| Threshold | `postThreshold` |
| Contrast | `sourceContrast` |
| Brightness | `strength` |
| Glitch | `glitchAmount` |
| Feedback | `postFeedback` |
| Scanlines | `postScanline` |

Preset bundles still configure bridge sensitivity and visual parameters. **Blackout** is video-only (no dedicated MP3) — select it from the video source list.

No CSS or secondary canvas visualizer is used. See [ROADMAP.md](ROADMAP.md) for placeholders (webcam, image upload).

### Export (planned)

GIF and video export from the ASCII engine are **planned** (ROADMAP Phase 9). The visual engine supports frame capture; Signal 9 does not yet expose a Menu panel or `src/export/` implementation. See [EXPORT_GUIDE.md](EXPORT_GUIDE.md) for the target design.

## Requirements

- Node.js ≥ 20
- pnpm ≥ 9
- Sibling repos on disk:
  - `../plantasonic-platform` (SDK, demo mount API, engines)
  - `../plantasonic-xyz/plantasonic-design-system`

Build platform engines once if needed:

```bash
cd ../plantasonic-platform
pnpm install && pnpm build
```

## Run

```bash
pnpm install
pnpm dev
```

Opens at http://localhost:5177

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Vite dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript check |
| `pnpm validate` | Thin-app + navigation validation |

## Architecture

Follows the Plantasonic **thin app** model:

| Layer | Location |
|-------|----------|
| Platform orchestration | `../plantasonic-platform` (via Vite aliases) |
| Design System | `plantasonic-design-system` |
| **Signal 9 theme** | `src/styles/signal9-theme.css` (`--s9-*` semantic tokens, UI only) |
| App content | `src/content/`, `src/config/`, `src/appContent.ts` |
| Mission navigation | `src/navigation/` |
| Startup sequence | `src/startup/` (`LoadingScreen`, `TitleScreen`, `StartupController`) |
| **Broadcast Terminal** | `src/ui/broadcastTerminal/`, `src/navigation/screens/broadcastTerminal.ts` |
| **Game state** | `src/game/` (`BroadcastGameState`, `broadcastGameState` store) |
| **Asset manifest** | `src/assets/manifest.ts` |
| **AI layer** | `src/ai/` (`chatClient`, `applyBroadcastResponse`, `broadcastResponse`) |
| **Chat API (dev)** | `server/broadcastChat.ts` → `/api/broadcast/chat` |
| Stub briefing/debrief | `src/ai/stub/` |

### Visual rendering (sole renderer)

Signal 9 does **not** implement a local CSS, Canvas, or EQ visualizer. All stage output is rendered by the existing **Plantasia ASCII Visual Engine** (`ascii-visual-engine`) through the platform adapter:

```
MP3 playback (preset track in public/assets/audio/)
  → Web Audio analysis (MP3 sound adapter)
  → Platform Audio Reactive Bridge
  → Visual Engine adapter (ascii-visual-engine)
  → stage canvas (video-to-ASCII when video source active)
```

The app does **not** start plantasia-sound-engine synth output during missions. Preset bundles configure the **visual** engine and bridge; each preset swaps its paired MP3 track.

The app only:

- configures the Visual Engine (density, scanlines, glitch, trails, motion, contrast, etc.)
- selects **Broadcast Presets** (Broadcast, Interference, Jammer, Uplink)
- updates parameters via preset bundles
- passes audio features through the Audio Reactive Bridge
- renders UI overlays (mission flow, transmission bar)

`AppShell` mounts `mountInstrumentApp()` once in a persistent instrument layer; the **Broadcast Terminal** screen overlays the ASCII stage (status bar, deck, lore, chat, choices, footer).

### Broadcast Terminal layout

```
┌─ STATUS: SIGNAL 9 · location · mission · NET · TX ─────────────┐
│ DECK          │  ASCII / VIDEO STAGE (instrument layer)  │ LORE │
│ play · track  │  (transparent center — engine canvas)      │ objs │
├───────────────┴────────────────────────────────────────────┴──────┤
│ CHAT history + command input                                      │
│ [ AI choice ] [ AI choice ] [ AI choice ]                         │
├───────────────────────────────────────────────────────────────────┤
│ FOOTER: track · visual preset · ASCII · system · AI status        │
└───────────────────────────────────────────────────────────────────┘
```

Mobile collapses side panels; chat, visuals, soundtrack, and choices stay usable.

### AI architecture

```
Player input / AI choice
  → POST /api/broadcast/chat (structured JSON schema)
  → AiBroadcastResponse { narration, track, backgroundVideo, unlockLore, choices, ... }
  → applyBroadcastResponse()
       ├─ broadcastGameState (location, mission, lore, characters, choices)
       ├─ applySignal9Preset() — soundtrack + bridge
       ├─ loadVideoSourceById() — video-to-ASCII
       └─ background image overlay
  → Terminal UI subscribers re-render panels
```

### Game state model (`BroadcastGameState`)

| Field | Purpose |
|-------|---------|
| `currentLocation` | Status bar + AI context |
| `currentMission` | Objectives panel |
| `currentTrack` | Broadcast Deck / MP3 preset |
| `currentMood` | Narrative tone |
| `currentVisualPreset` / `currentAsciiPreset` | Footer + engine profile |
| `backgroundVideo` / `backgroundImage` | Center display layers |
| `unlockedLore` | Right panel transmissions |
| `discoveredCharacters` | Right panel character files |
| `inventory` | Future-ready hook |
| `conversationHistory` | Chat log |
| `availableChoices` | Three dynamic action buttons |

### Asset manifest (`src/assets/manifest.ts`)

Each asset includes: `id`, `title`, `description`, `tags`, `mood`, `location`, `faction`, `mission`, `relatedAssets`, `filePath` (when applicable). Kinds: `song`, `video`, `image`, `character`, `location`, `lore`. Fed to the AI system prompt for consistent id references.

### Audio-reactive bridge mapping

| Audio feature | Bridge target | Engine control |
|---------------|---------------|----------------|
| bass | density | density / scale |
| mids | motion | speed |
| highs | brightness | strength (scanline shimmer via preset) |
| amplitude | scale | sourceContrast (glow / contrast) |
| transient | glitch | glitchAmount (feedback bursts) |

Preset-specific sensitivity and base `visualParameters` live in `src/content/presetBundles.ts` and `src/content/visualPresets.ts`.

## Signal 9 theme

Signal 9 applies an **application-level semantic theme** on top of the shared Plantasonic Design System. The DS, Platform, Sound Engine, and Visual Engine are **not** modified.

### How it layers

```
plantasonic-design-system (variables, Bootstrap, components, Creative Workspace)
  → src/styles/signal9-theme.css   (--s9-* semantic tokens + color/atmosphere overrides)
  → startup.css / app-layout.scss  (layout + motion only; colors from --s9-*)
```

| Rule | Detail |
|------|--------|
| Theme file | `src/styles/signal9-theme.css` |
| Import order | **After** all DS imports in `src/styles/index.scss` |
| Activation | `.s9-themed` on `<html>` (set in `main.ts`) |
| Scope | **Color, typography, atmosphere, interaction** only |
| Layout | Creative Workspace (unchanged) |
| Components | Design System / Bootstrap (unchanged) |
| Stage | **Transparent** — ASCII Visual Engine canvas is never faked in CSS |

Do **not** duplicate Design System tokens or Bootstrap. Signal 9 bridges into DS via `--ds-*`, `--bs-*`, and `--ps-creative-*` **color overrides only**.

### Visual identity

Near-black CRT monitor, violet signal glow, broadcast terminal aesthetic, soft purple transmission accents, subtle scanlines, fine background grid, noise texture, glass panels, thin glowing borders, floating overlays. Industrial, tactical, military — not consumer-rounded or bright neon. No gradients unless extremely subtle.

### Typography

| Role | Token | Source |
|------|-------|--------|
| Display | `--s9-font-display` | DS mono (`--ds-font-family-mono`) |
| HUD / numeric | `--s9-font-hud`, `--s9-font-mono` | DS mono |
| Body | `--s9-font-body` | DS sans (`--ds-font-family-sans`) |

HUD labels: uppercase, slight letter-spacing, tabular numerals where applicable.

### Semantic tokens (`--s9-*`)

#### Background

| Token | Value | Usage |
|-------|-------|--------|
| `--s9-bg` | `#040306` | Application background |
| `--s9-stage` | `#020103` | Stage surround (UI chrome only; canvas is engine-owned) |
| `--s9-surface` | `#0D0914` | Raised surfaces, cards |
| `--s9-surface-elevated` | `#171021` | Elevated panels, track backgrounds |
| `--s9-overlay` | `rgba(12,8,20,.84)` | Glass panel fill |

#### Signal

| Token | Value | Usage |
|-------|-------|--------|
| `--s9-signal` | `#A855F7` | Primary accent, active state |
| `--s9-signal-soft` | `#C084FC` | Hover highlight |
| `--s9-signal-dim` | `#7E22CE` | Muted labels, form checked state |

#### Broadcast

| Token | Value | Usage |
|-------|-------|--------|
| `--s9-transmission` | `#8B5CF6` | HUD readouts, transmission accent |
| `--s9-interference` | `#D8B4FE` | Interference flicker, hints |
| `--s9-static` | `#8B7AAE` | Noise texture, static tone |

#### Status

| Token | Value | Usage |
|-------|-------|--------|
| `--s9-success` | `#A855F7` | Success text / Bootstrap success |
| `--s9-warning` | `#FBBF24` | Warnings, preset warnings |
| `--s9-danger` | `#FF4D6D` | Errors, platform alerts |
| `--s9-offline` | `#5F5B70` | Disabled, inactive indicators |

#### Text

| Token | Value |
|-------|-------|
| `--s9-text` | `#F8F5FF` |
| `--s9-text-secondary` | `#CFC6E6` |
| `--s9-text-muted` | `#9588B3` |

#### Borders, glow, shadow

| Token | Value / purpose |
|-------|----------------|
| `--s9-border` | `rgba(168,85,247,.28)` — default thin border |
| `--s9-border-strong` | `rgba(168,85,247,.55)` — focus / active |
| `--s9-glow-soft` | `0 0 16px rgba(168,85,247,.20)` |
| `--s9-glow` | `0 0 32px rgba(168,85,247,.35)` |
| `--s9-glow-strong` | `0 0 64px rgba(168,85,247,.50)` |
| `--s9-shadow-panel` | `0 18px 48px rgba(0,0,0,.60)` |

#### Radius & motion

| Token | Value |
|-------|-------|
| `--s9-radius-sm` | `8px` |
| `--s9-radius-md` | `14px` |
| `--s9-radius-lg` | `22px` |
| `--s9-fast` | `120ms` |
| `--s9-normal` | `220ms` |
| `--s9-slow` | `420ms` |

#### Derived atmosphere (computed in `.s9-themed`)

| Token | Purpose |
|-------|---------|
| `--s9-grid-line` | Fine background grid lines |
| `--s9-scanline-color` | CRT scanline overlay |
| `--s9-noise-dot` | Noise texture dots |
| `--s9-panel-border` | Glass panel border mix |
| `--s9-glass-bg` | Glass panel background |
| `--s9-transmission-shadow` | Cyan hover glow on presets |
| `--s9-space-panel` | Panel padding (aliases `--ds-space-4`) |

#### Design System bridges (color only)

Signal 9 re-maps these shared variables inside `.s9-themed` — no new layout tokens:

| Family | Examples |
|--------|----------|
| `--ds-*` | `--ds-color-surface-app`, `--ds-color-text-primary`, `--ds-color-accent-primary` |
| `--bs-*` | `--bs-body-bg`, `--bs-primary`, `--bs-danger` |
| `--ps-creative-*` | Stage, inspector, transport, preset-browser, HUD glass and glow |

### Themed surfaces

All styling is scoped under `.s9-themed` in `signal9-theme.css`:

| Surface | Selectors |
|---------|-----------|
| Application | `.s9-app-shell`, `.s9-app-root`, `#app` |
| Stage | `.ps-region--stage`, `[data-ps-region='stage']` (transparent) |
| HUD | `.ps-cw-hud`, `.ps-status-bar`, `.ps-metrics` |
| Transport | `.ps-transport`, `.s9-transmission-bar` |
| Preset browser | `.demo-preset-list` |
| Inspector | `.ps-inspector` |
| Cards | `.card`, `.s9-mission-flow__panel` |
| Buttons | `.btn`, transmission bar buttons |
| Progress | `.progress`, `.progress-bar` |
| Status | `.badge`, `.ps-status-dot` |
| Loading / title | `.s9-startup`, `.s9-title__crt` (motion in `startup.css`) |

### Interaction

| State | Behavior |
|-------|----------|
| Hover | Increased glow (`--s9-glow-soft` → `--s9-glow` or transmission shadow) |
| Focus | Strong border (`--s9-border-strong`) + outline |
| Pressed | Brief `s9-transmission-flash` animation |
| Disabled | Offline gray (`--s9-offline`), reduced opacity |

Respects `prefers-reduced-motion: reduce` for flicker and flash animations.


## License

Private
