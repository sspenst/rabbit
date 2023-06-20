import { spotifyFetch } from './authCodeWithPkce';

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Artist {
  id: string;
  name: string;
}

export interface Track {
  artists: Artist[];
  audioFeatures: Record<string, string>;
  explicit: boolean;
  href: string;
  id: string;
  image: string;
  name: string;
  // preview url can be null https://github.com/spotify/web-api/issues/148#issuecomment-313924088
  preview: HTMLAudioElement | null;
  saved: boolean;
  seconds: number;
  uri: string;
}

function parseTrack(track: any, audioFeature: any, saved: boolean): Track {
  const audioFeatures: Record<string, string> = {};

  let preview: HTMLAudioElement | null = null;

  if (track.preview_url) {
    preview = new Audio(track.preview_url);

    preview.loop = true;
    preview.preload = 'none';
  }

  if (audioFeature) {
    audioFeatures.acousticness = audioFeature.acousticness;
    audioFeatures.danceability = audioFeature.danceability;
    audioFeatures.energy = audioFeature.energy;
    audioFeatures.instrumentalness = audioFeature.instrumentalness;
    audioFeatures.key = audioFeature.key;
    audioFeatures.liveness = audioFeature.liveness;
    audioFeatures.loudness = audioFeature.loudness;
    audioFeatures.mode = audioFeature.mode;
    audioFeatures.speechiness = audioFeature.speechiness;
    audioFeatures.tempo = audioFeature.tempo;
    audioFeatures.time_signature = audioFeature.time_signature;
    audioFeatures.valence = audioFeature.valence;
  }

  return {
    artists: track.artists.map((a: any) => {
      return {
        id: a.id,
        name: a.name,
      };
    }),
    audioFeatures: audioFeatures,
    explicit: track.explicit,
    href: track.external_urls.spotify,
    id: track.id,
    image: track.album.images[0]?.url ?? '/music.svg',
    name: track.name,
    preview: preview,
    saved: saved,
    seconds: Math.round(track.duration_ms / 1000),
    uri: track.uri,
  } as Track;
}

export async function parseTracks(tracks: any): Promise<Track[]> {
  if (!tracks?.length) {
    return [];
  }

  const [audioFeatures, saved] = await Promise.all([
    spotifyFetch(`https://api.spotify.com/v1/audio-features?${new URLSearchParams({
      ids: tracks.map((f: any) => f.id).join(','),
    })}`, {
      method: 'GET',
    }),
    spotifyFetch(`https://api.spotify.com/v1/me/tracks/contains?${new URLSearchParams({
      ids: tracks.map((f: any) => f.id).join(','),
    })}`, {
      method: 'GET',
    }) as Promise<boolean[] | null>,
  ]);

  return tracks.map((t: any, i: number) => parseTrack(t, audioFeatures?.audio_features[i], saved?.at(i) ?? false));
}

export interface User {
  href: string;
  id: string;
  image: string;
  name: string;
}

export function parseUser(user: any): User | null {
  if (!user) {
    return null;
  }

  return {
    href: user.external_urls.spotify,
    id: user.id,
    image: user.images[0]?.url ?? '/avatar_default.png',
    name: user.display_name,
  };
}
