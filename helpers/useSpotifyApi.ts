import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import { useEffect, useState } from 'react';

export default function useSpotifyApi() {
  const [spotifyApi, setSpotifyApi] = useState<SpotifyApi | null>();

  useEffect(() => {
    const clientId = 'a16d23f0a5e34c73b8719bd006b90464';
    const redirectUri = `${location.protocol}//${location.host}/app`;
    const scopes = ['user-library-read', 'user-library-modify'];
    const api = SpotifyApi.withUserAuthorization(clientId, redirectUri, scopes);

    // TODO: only set spotifyApi if user is authenticated successfully (to avoid making requests that are guaranteed to 401)
    // https://github.com/spotify/spotify-web-api-ts-sdk/issues/9
    api.authenticate().then(
      () => setSpotifyApi(api),
      () => setSpotifyApi(null),
    );
  }, []);

  return spotifyApi;
}
