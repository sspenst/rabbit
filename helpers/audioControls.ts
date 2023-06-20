import { Track } from './spotifyParsers';

export function playTrack(
  track: Track,
  setPreviewTrack: React.Dispatch<React.SetStateAction<Track | null | undefined>>,
  previewTrack?: Track | null,
) {
  track.preview?.play().then(() => {
    // if the current preview track is different than the new track, then we need to pause it
    if (previewTrack?.preview && previewTrack?.preview !== track.preview) {
      previewTrack.preview.pause();
    }

    navigator.mediaSession.metadata = new MediaMetadata({
      artist: track.artists.map(a => a.name).join(', '),
      artwork: track.images,
      title: track.name,
    });

    navigator.mediaSession.setActionHandler('pause', () => pauseTrack(track, setPreviewTrack));
    navigator.mediaSession.setActionHandler('play', () => playTrack(track, setPreviewTrack, previewTrack));

    setPreviewTrack({ ...track });
  });
}

export function pauseTrack(
  track: Track,
  setPreviewTrack: React.Dispatch<React.SetStateAction<Track | null | undefined>>,
  previewTrack?: Track | null,
) {
  previewTrack?.preview?.pause();
  track.preview?.pause();
  setPreviewTrack({ ...track });
}
