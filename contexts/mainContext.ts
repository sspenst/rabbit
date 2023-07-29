import { SpotifyApi, User } from '@spotify/web-api-ts-sdk';
import { createContext } from 'react';

interface MainContextInterface {
  logOut: () => void;
  mounted: boolean;
  setSpotifyApi: React.Dispatch<React.SetStateAction<SpotifyApi | null | undefined>>;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  spotifyApi: SpotifyApi | null | undefined;
  user: User | undefined;
}

export const MainContext = createContext<MainContextInterface>({
  logOut: () => { return; },
  mounted: false,
  setSpotifyApi: () => { return; },
  setUser: () => { return; },
  spotifyApi: null,
  user: undefined,
});
