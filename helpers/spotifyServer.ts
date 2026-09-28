import { SpotifyApi } from '@sspenst/spotify-web-api';

let spotifyApi: SpotifyApi | undefined;

export function getSpotifyServerApi() {
  if (spotifyApi) {
    return spotifyApi;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be configured.');
  }

  spotifyApi = SpotifyApi.withClientCredentials(clientId, clientSecret);

  return spotifyApi;
}
