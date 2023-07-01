import { EnrichedTrack } from './enrichTrack';

export function playTrack(
  track: EnrichedTrack,
  setPreviewTrack: React.Dispatch<React.SetStateAction<EnrichedTrack | null | undefined>>,
  previewTrack?: EnrichedTrack | null,
) {
  track.preview?.play().then(() => {
    // if the current preview track is different than the new track, then we need to pause it
    if (previewTrack?.preview && previewTrack?.preview !== track.preview) {
      previewTrack.preview.pause();
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaMetadata/MediaMetadata
    navigator.mediaSession.metadata = new MediaMetadata({
      artist: track.artists.map(a => a.name).join(', '),
      artwork: track.album.images?.map(i => {
        return {
          size: `${i.width}x${i.height}`,
          src: i.url,
          type: 'image/jpeg',
        };
      }) ?? [{
        src: '/music.svg',
        type: 'image/svg+xml',
      }],
      title: track.name,
    });

    navigator.mediaSession.setActionHandler('pause', () => pauseTrack(track, setPreviewTrack, previewTrack));
    navigator.mediaSession.setActionHandler('play', () => playTrack(track, setPreviewTrack, previewTrack));

    setPreviewTrack({ ...track });
  });
}

export function pauseTrack(
  track: EnrichedTrack,
  setPreviewTrack: React.Dispatch<React.SetStateAction<EnrichedTrack | null | undefined>>,
  previewTrack?: EnrichedTrack | null,
) {
  previewTrack?.preview?.pause();
  track.preview?.pause();
  setPreviewTrack({ ...track });
}
