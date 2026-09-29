import { SpotifyApi, User } from '@sspenst/spotify-web-api';
import { createContext } from 'react';

interface MainContextInterface {
  logOut: () => void;
  mounted: boolean;
  setSpotifyApi: React.Dispatch<React.SetStateAction<SpotifyApi | null | undefined>>;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  signIn: () => void;
  spotifyApi: SpotifyApi | null | undefined;
  user: User | undefined;
}

export const MainContext = createContext<MainContextInterface>({
  logOut: () => { return; },
  mounted: false,
  setSpotifyApi: () => { return; },
  setUser: () => { return; },
  signIn: () => { return; },
  spotifyApi: null,
  user: undefined,
});
