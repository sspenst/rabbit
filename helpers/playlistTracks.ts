import type { PlaylistedItem, Track, TrackItem } from '@sspenst/spotify-web-api';

// Local files, episodes, and unavailable entries cannot seed Spotify discovery.
export function playlistTracks(items: PlaylistedItem<TrackItem>[]): Track[] {
  return items.flatMap(entry => {
    const track = entry.item;

    return track?.type === 'track' && track.id && !entry.is_local && !('is_local' in track && track.is_local) ? [track as Track] : [];
  });
}
