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

interface TrackInfoProps {
  track: Track;
}

export function TrackInfo({ track }: TrackInfoProps) {
  const artists = track.artists.map(a => a.name).join(', ');
  const { previewTrack, setPreviewTrack } = useContext(AppContext);

  return (
    <button className='flex gap-4 w-full items-center cursor-pointer truncate' onClick={() => {
      if (previewTrack?.preview !== track.preview) {
        // we are changing tracks
        track.preview.play().then(() => {
          // if we successfully play the track, then we need to pause the current track
          if (previewTrack) {
            previewTrack.preview.pause();
          }

          setPreviewTrack(track);
        });
      } else {
        // need to set the preview track to force a rerender after updating paused
        if (track.preview.paused) {
          track.preview.play().then(() => setPreviewTrack({ ...track }));
        } else {
          track.preview.pause();
          setPreviewTrack({ ...track });
        }
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
        <span className={classNames('truncate', { 'text-green-500': previewTrack?.preview === track.preview && !track.preview.paused })} title={track.name}>{track.name}</span>
        <span className='flex text-neutral-400 text-sm items-center gap-2'>
          {track.explicit &&
            <div className='bg-neutral-400 text-black text-xs rounded-sm w-4 h-4 text-center' style={{
              minHeight: 16,
              minWidth: 16,
            }}>
              E
            </div>
          }
          <span className='truncate' title={artists}>
            {artists}
          </span>
        </span>
      </div>
      <span className='hidden sm:block text-neutral-400 ml-4 text-sm'>
        {formatSeconds(track.seconds)}
      </span>
    </button>
  );
}

interface TrackComponentProps {
  track: Track;
}

export default function TrackComponent({ track }: TrackComponentProps) {
  const { saveTrack, savingTrackId } = useContext(AppContext);

  return (
    <div className='flex gap-4 w-full items-center'>
      <TrackInfo track={track} />
      <button
        className={classNames('disabled:text-green-600', track.saved ?
          'text-green-500 hover:text-green-300' :
          'text-neutral-500 hover:text-neutral-300'
        )}
        disabled={savingTrackId === track.id}
        onClick={() => saveTrack(track)}
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
      <a
        className='font-bold text-lg w-fit hover:underline text-neutral-500 hover:text-neutral-200'
        href={track.href}
        rel='noreferrer'
        target='_blank'
      >
        <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-5 h-5'>
          <path strokeLinecap='round' strokeLinejoin='round' d='M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25' />
        </svg>
      </a>
    </div>
  );
}
