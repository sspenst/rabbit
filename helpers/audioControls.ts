import type { EnrichedTrack } from './enrichTrack';

let activePreview: HTMLAudioElement | null = null;
let playbackRequest = 0;

export function playTrack(
  track: EnrichedTrack,
  setPreviewTrack: React.Dispatch<React.SetStateAction<EnrichedTrack | null | undefined>>,
  previewTrack?: EnrichedTrack | null,
) {
  const audio = track.preview;

  if (!audio) {
    return;
  }

  const request = ++playbackRequest;

  // Stop the previous preview before starting another. React state may still
  // refer to an older track when clicks or play() promises happen quickly.
  if (activePreview && activePreview !== audio) {
    activePreview.pause();
  }

  if (previewTrack?.preview && previewTrack.preview !== audio) {
    previewTrack.preview.pause();
  }

  activePreview = audio;

  void audio.play().then(() => {
    if (request !== playbackRequest) {
      // The same audio may already have been played again after a pause.
      if (activePreview !== audio) {
        audio.pause();
      }

      return;
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
  }).catch(() => {
    if (request === playbackRequest) {
      activePreview = null;
    }
  });
}

export function pauseTrack(
  track: EnrichedTrack,
  setPreviewTrack: React.Dispatch<React.SetStateAction<EnrichedTrack | null | undefined>>,
  previewTrack?: EnrichedTrack | null,
) {
  playbackRequest += 1;
  activePreview?.pause();
  previewTrack?.preview?.pause();
  track.preview?.pause();
  activePreview = null;
  setPreviewTrack({ ...track });
}
