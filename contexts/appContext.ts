import { createContext } from 'react';
import { EnrichedTrack } from '../helpers/enrichTrack';

interface AppContextInterface {
  previewTrack: EnrichedTrack | null | undefined;
  saveTrack: (track: EnrichedTrack) => void;
  savingTrackId: string | undefined;
  setPreviewTrack: React.Dispatch<React.SetStateAction<EnrichedTrack | null | undefined>>;
}

export const AppContext = createContext<AppContextInterface>({
  previewTrack: undefined,
  saveTrack: () => { return; },
  savingTrackId: undefined,
  setPreviewTrack: () => { return; },
});
