import { createContext } from 'react';
import { User } from '../helpers/spotifyParsers';

interface MainContextInterface {
  setUser: React.Dispatch<React.SetStateAction<User | null | undefined>>;
  user: User | null | undefined;
}

export const MainContext = createContext<MainContextInterface>({
  setUser: () => { return; },
  user: undefined,
});
