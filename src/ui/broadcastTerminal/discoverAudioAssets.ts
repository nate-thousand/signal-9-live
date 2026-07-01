const AUDIO_PLAYLIST_API = '/api/signal9/audio-playlist';
const AUDIO_PLAYLIST_MANIFEST = '/assets/audio/playlist.json';

export interface AudioPlaylistManifest {
  tracks: string[];
}

function normalizePlaylist(data: unknown): string[] {
  if (!data || typeof data !== 'object') return [];
  const tracks = (data as AudioPlaylistManifest).tracks;
  if (!Array.isArray(tracks)) return [];
  return tracks.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}

/** Discover local audio URLs from the dev API or build-time manifest. */
export async function discoverAudioAssets(): Promise<string[]> {
  try {
    const response = await fetch(AUDIO_PLAYLIST_API);
    if (response.ok) {
      const tracks = normalizePlaylist(await response.json());
      if (tracks.length > 0) return tracks;
    }
  } catch {
    // Dev API unavailable — fall through to static manifest.
  }

  try {
    const response = await fetch(AUDIO_PLAYLIST_MANIFEST);
    if (response.ok) {
      return normalizePlaylist(await response.json());
    }
  } catch {
    // Manifest missing — treat as empty playlist.
  }

  return [];
}
