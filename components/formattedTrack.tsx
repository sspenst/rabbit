import classNames from 'classnames';
import Image from 'next/image';
import React, { useContext } from 'react';
import { AppContext } from '../contexts/appContext';
import { Track } from '../helpers/spotifyParsers';

function formatSeconds(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

interface FormattedTrackProps {
  track: Track;
}

export default function FormattedTrack({ track }: FormattedTrackProps) {
  const { previewTrack, saveTrack, savingTrackId, setPreviewTrack } = useContext(AppContext);

  return (
    <div className='flex gap-4 w-full items-center cursor-pointer truncate select-none' onClick={() => {
      if (previewTrack?.preview !== track.preview) {
        // if we are changing tracks
        if (previewTrack) {
          previewTrack.preview.pause();
        }

        track.preview.play();
        setPreviewTrack(track);
      } else {
        if (track.preview.paused) {
          track.preview.play();
        } else {
          track.preview.pause();
        }

        // need to set the preview track again to force a rerender
        setPreviewTrack({ ...track });
      }
    }}>
      <Image
        alt={track.name}
        className='shadow-lg w-12 h-12'
        height={48}
        src={track.image}
        style={{
          minWidth: '3rem',
        }}
        width={48}
      />
      <div className='grow flex flex-col gap-1 truncate text-left'>
        <span className={classNames('truncate', { 'text-green-500': previewTrack?.preview === track.preview && !track.preview.paused })}>{track.name}</span>
        <span className='text-neutral-400 text-sm truncate'>{track.artists.map(a => a.name).join(', ')}</span>
      </div>
      <span className='text-neutral-400 ml-4 text-sm'>
        {formatSeconds(track.seconds)}
      </span>
      <button
        className={classNames('disabled:text-green-600', track.saved ?
          'text-green-500 hover:text-green-300' :
          'text-neutral-500 hover:text-neutral-300'
        )}
        disabled={savingTrackId === track.id}
        onClick={e => {
          e.stopPropagation();
          saveTrack(track);
        }}
      >
        {track.saved || savingTrackId === track.id ?
          <svg width='24' height='24' viewBox='0 0 150 150' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M125.784 35.0369C113.039 22.2916 92.9859 21.3682 79.1227 32.8994C79.1062 32.9135 77.318 34.3807 75 34.3807C72.6234 34.3807 70.9266 32.9416 70.8609 32.8853C57.0141 21.3682 36.9609 22.2916 24.2156 35.0369C17.6695 41.583 14.0625 50.2877 14.0625 59.5478C14.0625 68.808 17.6695 77.5127 24.0914 83.9228L64.3078 131.006C66.9844 134.14 70.882 135.938 75 135.938C79.1203 135.938 83.0156 134.14 85.6922 131.009L125.782 84.0611C139.301 70.5447 139.301 48.5533 125.784 35.0369Z' fill='currentColor' />
          </svg>
          :
          <svg width='24' height='24' viewBox='0 0 150 150' fill='none' strokeWidth='6' stroke='currentColor' xmlns='http://www.w3.org/2000/svg'>
            <path d='M125.784 35.0369C113.039 22.2916 92.9859 21.3682 79.1227 32.8994C79.1062 32.9135 77.318 34.3807 75 34.3807C72.6234 34.3807 70.9266 32.9416 70.8609 32.8853C57.0141 21.3682 36.9609 22.2916 24.2156 35.0369C17.6695 41.583 14.0625 50.2877 14.0625 59.5478C14.0625 68.808 17.6695 77.5127 24.0914 83.9228L64.3078 131.006C66.9844 134.14 70.882 135.938 75 135.938C79.1203 135.938 83.0156 134.14 85.6922 131.009L125.782 84.0611C139.301 70.5447 139.301 48.5533 125.784 35.0369ZM122.346 80.8807L82.1297 127.964C80.3461 130.05 77.7469 131.25 75 131.25C72.2531 131.25 69.6562 130.053 67.8703 127.964L27.532 80.7447C21.8695 75.0822 18.75 67.5541 18.75 59.5478C18.75 51.5392 21.8695 44.0135 27.5297 38.351C33.3961 32.4822 41.0555 29.5127 48.7336 29.5127C55.4742 29.5127 62.2289 31.8025 67.7977 36.4338C68.0977 36.7033 70.8586 39.0682 75 39.0682C79.0266 39.0682 81.8578 36.7314 82.1367 36.49C94.1109 26.5291 111.45 27.3307 122.47 38.351C134.159 50.0393 134.159 69.0564 122.346 80.8807Z' />
          </svg>
        }
      </button>
    </div>
  );
}
