# Signal 9 video assets

Place local MP4 loops in this folder. Files are auto-discovered at dev/build time into `playlist.json`.

## Current local inventory

| File | Video source id | Default ASCII preset |
|------|-----------------|----------------------|
| `blackout-void.mp4` | `blackout-void` | `blackout` |
| `organic-vs-synthetic-2.mp4` | `organic-vs-synthetic-2` | `broadcast` |

Mixtape pairings are configured in `src/config/mixtapePresets.ts` (`videoSourceId`).

Video audio is always muted — MP3 playback drives the transmission.
