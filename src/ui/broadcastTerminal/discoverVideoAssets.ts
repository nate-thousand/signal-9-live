const VIDEO_PLAYLIST_API = '/api/signal9/video-playlist';
const VIDEO_PLAYLIST_MANIFEST = '/assets/video/playlist.json';

export interface VideoPlaylistManifest {
  videos: string[];
}

function normalizePlaylist(data: unknown): string[] {
  if (!data || typeof data !== 'object') return [];
  const videos = (data as VideoPlaylistManifest).videos;
  if (!Array.isArray(videos)) return [];
  return videos.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}

/** Discover local video URLs from the dev API or build-time manifest. */
export async function discoverVideoAssets(): Promise<string[]> {
  try {
    const response = await fetch(VIDEO_PLAYLIST_API);
    if (response.ok) {
      const videos = normalizePlaylist(await response.json());
      if (videos.length > 0) return videos;
    }
  } catch {
    // Dev API unavailable — fall through to static manifest.
  }

  try {
    const response = await fetch(VIDEO_PLAYLIST_MANIFEST);
    if (response.ok) {
      return normalizePlaylist(await response.json());
    }
  } catch {
    // Manifest missing — treat as empty playlist.
  }

  return [];
}
