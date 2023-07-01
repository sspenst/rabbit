import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { AudioFeatures, TrackWithAlbum } from '@spotify/web-api-ts-sdk/dist/mjs/types';

export interface EnrichedTrack extends TrackWithAlbum {
  audioFeatures: AudioFeatures;
  // preview url can be null https://github.com/spotify/web-api/issues/148#issuecomment-313924088
  preview: HTMLAudioElement | null;
  saved: boolean;
}

function enrichTrack(track: TrackWithAlbum, audioFeatures: AudioFeatures, saved: boolean) {
  let preview: HTMLAudioElement | null = null;

  if (track.preview_url) {
    preview = new Audio(track.preview_url);
    preview.loop = true;
    preview.preload = 'none';
  }

  return {
    audioFeatures: audioFeatures,
    preview: preview,
    saved: saved,
    ...track,
  } as EnrichedTrack;
}

export async function enrichTracks(tracks: TrackWithAlbum[] | null | undefined, spotifyApi: SpotifyApi | null | undefined): Promise<EnrichedTrack[]> {
  if (!tracks?.length || !spotifyApi) {
    return [];
  }

  const [audioFeatures, saved] = await Promise.all([
    spotifyApi.tracks.audioFeatures(tracks.map(t => t.id)),
    spotifyApi.currentUser.tracks.hasSavedTracks(tracks.map(t => t.id)) as Promise<boolean[] | null>,
  ]);

  return tracks.map((t, i) => enrichTrack(t, audioFeatures[i], saved?.at(i) ?? false));
}
