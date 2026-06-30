# Signal 9 Export Guide

> **Status: ⬜ Planned (ROADMAP Phase 9)** — This document describes the target export design. Signal 9 does not yet implement `src/export/` or a GIF EXPORT menu panel. The underlying visual engine supports frame capture APIs.

Record animated GIFs directly from the **Plantasia ASCII Visual Engine** stage canvas. Signal 9 does not use browser screen recording and does not run a second renderer.

## Architecture

```
ASCII Visual Engine (single renderer)
        ↓
Rendered stage canvas frames (ExportManager / TimelineRecorder)
        ↓
Signal 9 GifRecorder (`src/export/gifRecorder.ts`)
        ↓
GIF89a encode (`ascii-visual-engine` GifExporter)
        ↓
Download
```

## Workflow

1. Start a transmission (play audio + visual loop).
2. Open **Menu** (bottom center) to reveal controls.
3. In **GIF EXPORT**, choose FPS, max duration, dimensions, and quality.
4. Click **Record GIF** — capture hooks the engine render loop (playback continues).
5. Click **Stop** or wait for the max duration auto-stop.
6. When encoding completes, click **Download**.

Captured frames include everything the engine renders: ASCII glyphs, motion, audio-reactive modulation, video-to-ASCII, feedback, glitch, and CRT/post effects.

## Supported formats (now)

| Format | Status |
|--------|--------|
| **GIF** | Implemented |
| MP4 | Placeholder (engine stub) |
| PNG sequence | Placeholder |
| WebM | Placeholder (engine stub) |

## Recording settings

| Setting | Options |
|---------|---------|
| FPS | 10, 15, 24, 30 |
| Max duration | 5s, 10s, 15s, 30s |
| Dimensions | Current viewport, 1080², 1080×1920, 1920×1080 |
| Quality | Draft (0.5×), Standard, High |
| Loop | On / off |
| Transparent BG | Clears background on resize export pass |

## Metadata

Exported filenames follow:

```
signal-9-{preset}-{iso-timestamp}-engine-{version}.gif
```

Example:

```
signal-9-broadcast-2026-06-29T22-45-00-000Z-engine-0.1.0.gif
```

Embedded metadata includes:

- **Signal 9** branding (filename prefix)
- **Preset name** (active visual preset id)
- **Timestamp** (ISO, filesystem-safe)
- **Engine version** (`0.1.0` — ascii-visual-engine)

## Limitations

- GIF uses a **16-color palette** encoder built into the visual engine — high-frequency color detail is reduced.
- Capture reads the **engine stage canvas**; if the DOM renderer were active, canvas capture would not reflect DOM text (Signal 9 uses canvas renderer by default).
- Frame PNG blobs are captured asynchronously; export waits for pending blobs before encoding.
- Transparent GIF is best-effort via export resize — true alpha in GIF is limited.
- Long recordings at high FPS produce large files; use max duration and draft quality for previews.

## Future export roadmap

1. **MP4** — engine placeholder via `ExportManager.exportMP4()`
2. **PNG sequence** — extend `SequenceExporter` UI
3. **WebM** — engine placeholder via `ExportManager.exportWebM()`
4. GIF comment block metadata (preset + timestamp inside file)
5. Optional playback scrub before export

## Code map

| Path | Role |
|------|------|
| `src/export/gifRecorder.ts` | Recording session + export orchestration |
| `src/export/gifConfig.ts` | FPS, duration, dimension presets |
| `src/ui/GifRecordingControls.ts` | HUD panel |
| Platform `VisualEngineAdapter` | `startFrameCapture`, `stopFrameCapture`, `exportCapturedGif` |
| `ascii-visual-engine` `ExportManager` | Frame hook on render loop, GIF encode |

## API (platform adapter)

Thin methods on `VisualEngineAdapter` — no engine internals exposed to Signal 9 UI:

- `startFrameCapture(frameRate?)`
- `stopFrameCapture()`
- `cancelFrameCapture()`
- `getFrameCaptureStatus()`
- `exportCapturedGif(options?)`
- `getCaptureCanvas()`
