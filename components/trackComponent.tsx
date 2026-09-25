import classNames from 'classnames';
import Image from 'next/image';
import React, { useContext, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { AppContext } from '../contexts/appContext';
import { pauseTrack, playTrack } from '../helpers/audioControls';
import { EnrichedTrack } from '../helpers/enrichTrack';
import ImageModal from './imageModal';

function formatDurationMs(ms: number) {
  const seconds = Math.round(ms / 1000);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

interface TrackInfoProps {
  track: EnrichedTrack;
}

export function TrackInfo({ track }: TrackInfoProps) {
  const artists = track.artists.map(a => a.name).join(', ');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { previewTrack, setPreviewTrack } = useContext(AppContext);

  function getImageSrc() {
    if (!track.album.images?.length) {
      return '/music.svg';
    } else {
      // get second smallest image if available (the very smallest is 64x64 which looks blurry at 48x48)
      const index = Math.max(track.album.images.length - 2, 0);

      return track.album.images[index].url;
    }
  }

  const imageSrc = getImageSrc();

  return (<>
    <ImageModal
      isOpen={isImageModalOpen}
      onClose={() => setIsImageModalOpen(false)}
      src={imageSrc}
    />
    <button className='flex gap-4 w-full items-center cursor-pointer truncate select-none' onClick={() => {
      // pause if the track has no preview or is already playing
      if (!track.preview?.paused) {
        pauseTrack(track, setPreviewTrack, previewTrack);
      } else {
        playTrack(track, setPreviewTrack, previewTrack);
      }
    }}>
      <Image
        alt={track.name}
        className='w-12 h-12 rounded'
        height={48}
        onClick={e => {
          e.stopPropagation();
          setIsImageModalOpen(true);
        }}
        src={getImageSrc()}
        style={{
          minWidth: '3rem',
        }}
        width={48}
      />
      <div className='grow flex flex-col gap-1 truncate text-left'>
        <div className='flex items-center gap-2'>
          {!track.preview && <>
            <svg data-tooltip-content='Only playable on Spotify' data-tooltip-id={`warning-${track.id}`} className='text-yellow-500 w-5 h-5 focus:outline-hidden' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' style={{
              minWidth: 20,
            }}>
              <path strokeLinecap='round' strokeLinejoin='round' d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' />
            </svg>
            <Tooltip
              id={`warning-${track.id}`}
              opacity={1}
              place='top'
              style={{
                backgroundColor: '#666666',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                lineHeight: '1rem',
              }}
            />
          </>}
          <span
            className={classNames(
              'truncate',
              { 'text-green-500': track.preview && previewTrack?.preview === track.preview && !track.preview.paused },
            )}
            title={track.name}
          >
            {track.name}
          </span>
        </div>
        <span className='flex text-neutral-600 dark:text-neutral-400 text-sm items-center gap-2'>
          {track.explicit &&
            <div className='bg-neutral-600 dark:bg-neutral-400 text-white dark:text-black text-[10px] rounded-xs w-4 h-4 flex items-center justify-center' style={{
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
      <span className='hidden sm:block text-neutral-600 dark:text-neutral-400 ml-4 text-sm'>
        {formatDurationMs(track.duration_ms)}
      </span>
    </button>
  </>);
}

interface TrackComponentProps {
  track: EnrichedTrack;
}

export default function TrackComponent({ track }: TrackComponentProps) {
  const { saveTrack, savingTrackId } = useContext(AppContext);

  return (
    <div className='flex gap-4 grow items-center truncate'>
      <TrackInfo track={track} />
      <button
        aria-label={track.saved ? 'remove from liked songs' : 'add to liked songs'}
        className={classNames('disabled:text-green-600', track.saved ?
          'text-green-500 hover:text-green-300' :
          'text-neutral-500 hover:text-black dark:hover:text-white'
        )}
        disabled={savingTrackId === track.id}
        onClick={() => saveTrack(track)}
      >
        {track.saved || savingTrackId === track.id ?
          <svg aria-hidden='true' width='20' height='20' viewBox='0 0 135 135' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M5.625 67.5C5.625 33.3281 33.3281 5.625 67.5 5.625C101.672 5.625 129.375 33.3281 129.375 67.5C129.375 101.672 101.672 129.375 67.5 129.375C33.3281 129.375 5.625 101.672 5.625 67.5ZM97.8638 54.1125C98.8631 53.0468 99.4086 51.6342 99.3848 50.1735C99.3611 48.7128 98.77 47.3186 97.7367 46.2859C96.7033 45.2533 95.3087 44.6632 93.8479 44.6405C92.3872 44.6178 90.975 45.1643 89.91 46.1644L56.0981 79.9706L45.4444 69.3225C44.3835 68.2979 42.9626 67.7309 41.4877 67.7437C40.0129 67.7565 38.6021 68.3481 37.5591 69.391C36.5162 70.4339 35.9247 71.8448 35.9118 73.3196C35.899 74.7945 36.466 76.2154 37.4906 77.2763L56.0981 95.8838L97.8638 54.1181V54.1125Z' fill='currentColor' />
          </svg>
          :
          <svg aria-hidden='true' width='20' height='20' viewBox='0 0 135 135' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M67.4941 16.875C60.846 16.875 54.2629 18.1845 48.1208 20.7286C41.9787 23.2727 36.3978 27.0018 31.6969 31.7027C26.9959 36.4037 23.2669 41.9845 20.7227 48.1267C18.1786 54.2688 16.8691 60.8518 16.8691 67.5C16.8691 74.1482 18.1786 80.7312 20.7227 86.8734C23.2669 93.0155 26.9959 98.5963 31.6969 103.297C36.3978 107.998 41.9787 111.727 48.1208 114.271C54.2629 116.816 60.846 118.125 67.4941 118.125C80.9207 118.125 93.7974 112.791 103.291 103.297C112.785 93.8032 118.119 80.9266 118.119 67.5C118.119 54.0734 112.785 41.1967 103.291 31.7027C93.7974 22.2087 80.9207 16.875 67.4941 16.875ZM5.61914 67.5C5.61914 33.3281 33.3223 5.625 67.4941 5.625C101.666 5.625 129.369 33.3281 129.369 67.5C129.369 101.672 101.666 129.375 67.4941 129.375C33.3223 129.375 5.61914 101.672 5.61914 67.5Z' fill='currentColor' />
            <path d='M101.244 67.5C101.244 68.9918 100.651 70.4226 99.5966 71.4775C98.5417 72.5324 97.111 73.125 95.6191 73.125H73.1191V95.625C73.1191 97.1168 72.5265 98.5476 71.4716 99.6025C70.4167 100.657 68.986 101.25 67.4941 101.25C66.0023 101.25 64.5715 100.657 63.5167 99.6025C62.4618 98.5476 61.8691 97.1168 61.8691 95.625V73.125H39.3691C37.8773 73.125 36.4466 72.5324 35.3917 71.4775C34.3368 70.4226 33.7441 68.9918 33.7441 67.5C33.7441 66.0082 34.3368 64.5774 35.3917 63.5225C36.4466 62.4676 37.8773 61.875 39.3691 61.875H61.8691V39.375C61.8691 37.8832 62.4618 36.4524 63.5167 35.3975C64.5715 34.3426 66.0023 33.75 67.4941 33.75C68.986 33.75 70.4167 34.3426 71.4716 35.3975C72.5265 36.4524 73.1191 37.8832 73.1191 39.375V61.875H95.6191C97.111 61.875 98.5417 62.4676 99.5966 63.5225C100.651 64.5774 101.244 66.0082 101.244 67.5Z' fill='currentColor' />
          </svg>
        }
      </button>
      <a
        aria-label='listen on Spotify'
        className='font-bold text-lg w-fit hover:underline text-neutral-500 hover:text-black dark:hover:text-white'
        href={track.external_urls.spotify}
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
