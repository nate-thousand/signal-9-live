# Signal 9 Video Assets

Pixel flower loops for **video-to-ASCII** broadcast visuals.

## Theme mapping

| File | Preset | Source flower |
|------|--------|---------------|
| `broadcast-loop.mp4` | Broadcast | `21a89395…_1.mp4` |
| `interference-static.mp4` | Interference | `21a89395…_2.mp4` |
| `jammer-pulse.mp4` | Jammer | `b1855f95…_2.mp4` |
| `uplink-data.mp4` | Uplink | `f963c5fe…_3.mp4` |
| `blackout-void.mp4` | Blackout | `f963c5fe…_3.mp4` (shared uplink loop) |

Configured in `src/config/videoSources.ts`. Each preset applies a distinct ASCII profile in `src/content/videoVisualPresets.ts`.

## Requirements

- **Format:** MP4 (H.264)
- **Loop:** Short loops work best
- **Audio:** Video is muted; mission audio comes from MP3 presets
- **CORS:** Served from `/assets/video/` on the same origin

## Routing

```
public/assets/video/*.mp4
  → VisualEngineAdapter.loadVideoSource()
  → ascii-visual-engine VideoSource
  → ASCII renderer (stage canvas)
  → Audio Reactive Bridge
```

If MP4 files are missing, a canvas demo stream is used as fallback (`src/platform/videoDemoSource.ts`).
