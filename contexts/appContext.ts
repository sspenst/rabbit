import { createContext } from 'react';
import { Track } from '../helpers/spotifyParsers';

interface AppContextInterface {
  previewTrack: Track | null | undefined;
  saveTrack: (track: Track) => void;
  savingTrackId: string | undefined;
  setPreviewTrack: React.Dispatch<React.SetStateAction<Track | null | undefined>>;
}

export const AppContext = createContext<AppContextInterface>({
  previewTrack: undefined,
  saveTrack: () => { return; },
  savingTrackId: undefined,
  setPreviewTrack: () => { return; },
});
