import { createContext } from 'react';
import { User } from '../helpers/spotifyParsers';

interface MainContextInterface {
  logOut: () => void;
  mounted: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
  user: User | null | undefined;
}

export const MainContext = createContext<MainContextInterface>({
  logOut: () => { return; },
  mounted: false,
  setUser: () => { return; },
  user: undefined,
});
