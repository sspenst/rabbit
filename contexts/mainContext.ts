import { SpotifyApi, User } from '@sspenst/spotify-web-api';
import { createContext } from 'react';

interface MainContextInterface {
  isHelpModalOpen: boolean;
  logOut: () => void;
  mounted: boolean;
  setIsHelpModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSpotifyApi: React.Dispatch<React.SetStateAction<SpotifyApi | null | undefined>>;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  signIn: () => void;
  spotifyApi: SpotifyApi | null | undefined;
  user: User | undefined;
}

export const MainContext = createContext<MainContextInterface>({
  isHelpModalOpen: false,
  logOut: () => { return; },
  mounted: false,
  setIsHelpModalOpen: () => { return; },
  setSpotifyApi: () => { return; },
  setUser: () => { return; },
  signIn: () => { return; },
  spotifyApi: null,
  user: undefined,
});
