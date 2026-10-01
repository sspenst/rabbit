import type { AudioFeatures, SpotifyApi, Track } from '@sspenst/spotify-web-api';

export interface EnrichedTrack extends Track {
  audioFeatures: AudioFeatures | null;
  preview: HTMLAudioElement | null;
  saved: boolean;
}

export type EnrichedTrackData = Omit<EnrichedTrack, 'preview'>;

function enrichTrack(track: Track, audioFeatures: AudioFeatures | null, saved: boolean) {
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

export function hydrateTracks(tracks: EnrichedTrackData[]): EnrichedTrack[] {
  return tracks.map(track => enrichTrack(track, track.audioFeatures, track.saved));
}

export function hydrateRecommendations(tracks: EnrichedTrackData[], seedTrack: EnrichedTrack | null | undefined): EnrichedTrack[] {
  if (seedTrack?.id === tracks[0]?.id) {
    return [seedTrack, ...hydrateTracks(tracks.slice(1))];
  }

  return hydrateTracks(tracks);
}

export async function enrichPublicTracks(tracks: Track[] | null | undefined, spotifyApi: SpotifyApi): Promise<EnrichedTrackData[]> {
  if (!tracks?.length) {
    return [];
  }

  const audioFeatures = await spotifyApi.tracks.audioFeatures(tracks.map(track => track.id));

  return tracks.map((track, index) => ({
    ...track,
    audioFeatures: audioFeatures?.[index] ?? null,
    saved: false,
  }));
}

export async function enrichTracks(tracks: Track[] | null | undefined, spotifyApi: SpotifyApi | null | undefined): Promise<EnrichedTrack[]> {
  if (!tracks?.length || !spotifyApi) {
    return [];
  }

  const [audioFeatures, saved] = await Promise.all([
    spotifyApi.tracks.audioFeatures(tracks.map(t => t.id)),
    spotifyApi.currentUser.tracks.hasSavedTracks(tracks.map(t => t.id)),
  ]);

  return tracks.map((t, i) => enrichTrack(t, audioFeatures?.[i] ?? null, saved?.at(i) ?? false));
}
