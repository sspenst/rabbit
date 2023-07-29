import { AudioFeatures, SpotifyApi, Track } from '@spotify/web-api-ts-sdk';

export interface EnrichedTrack extends Track {
  audioFeatures: AudioFeatures;
  preview: HTMLAudioElement | null;
  saved: boolean;
}

function enrichTrack(track: Track, audioFeatures: AudioFeatures, saved: boolean) {
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

export async function enrichTracks(tracks: Track[] | null | undefined, spotifyApi: SpotifyApi | null | undefined): Promise<EnrichedTrack[]> {
  if (!tracks?.length || !spotifyApi) {
    return [];
  }

  const [audioFeatures, saved] = await Promise.all([
    spotifyApi.tracks.audioFeatures(tracks.map(t => t.id)),
    spotifyApi.currentUser.tracks.hasSavedTracks(tracks.map(t => t.id)) as Promise<boolean[] | null>,
  ]);

  return tracks.map((t, i) => enrichTrack(t, audioFeatures[i], saved?.at(i) ?? false));
}
