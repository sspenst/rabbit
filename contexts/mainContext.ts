import { SpotifyApi, User } from '@spotify/web-api-ts-sdk';
import { createContext } from 'react';

interface MainContextInterface {
  isHelpModalOpen: boolean;
  logOut: () => void;
  mounted: boolean;
  setIsHelpModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSpotifyApi: React.Dispatch<React.SetStateAction<SpotifyApi | null | undefined>>;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
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
  spotifyApi: null,
  user: undefined,
});
