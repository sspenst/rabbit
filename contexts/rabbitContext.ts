import { createContext } from 'react';
import { Track } from '../helpers/spotifyParsers';

interface RabbitContextInterface {
  previewTrack: Track | undefined;
  saveTrack: (track: Track) => void;
  savingTrackId: string | undefined;
  setPreviewTrack: React.Dispatch<React.SetStateAction<Track | undefined>>;
}

export const RabbitContext = createContext<RabbitContextInterface>({
  previewTrack: undefined,
  saveTrack: () => { return; },
  savingTrackId: undefined,
  setPreviewTrack: () => { return; },
});
