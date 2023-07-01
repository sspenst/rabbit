import { AudioFeatures } from '@spotify/web-api-ts-sdk/dist/mjs/types';
import classNames from 'classnames';
import React from 'react';
import { Tooltip } from 'react-tooltip';
import { EnrichedTrack } from '../helpers/enrichTrack';

export enum AudioFeatureState {
  NONE,
  UP,
  DOWN,
}

export interface AudioFeature {
  property: string;
  state: AudioFeatureState;
}

interface AudioFeatureInfo {
  description: string;
  svg: JSX.Element;
}

export const audioFeatureSvgMap: Record<string, AudioFeatureInfo> = {
  'danceability': {
    description: 'How suitable a track is for dancing.',
    svg:
    <svg className='w-6 h-6' viewBox='2 2 22 22' fill='none' xmlns='http://www.w3.org/2000/svg' style={{
      minHeight: 24,
      minWidth: 24,
    }}>
      <path d='M4 12H9L12 5L14 18.5L17.5 12H21.5' stroke='currentColor' strokeWidth={1.6} strokeLinecap='round' strokeLinejoin='round' />
    </svg>,
  },

  'energy': {
    description: 'Perceptual measure of intensity and activity.',
    svg:
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6' style={{
      minHeight: 24,
      minWidth: 24,
    }}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z' />
    </svg>,
  },

  'instrumentalness': {
    description: 'Confidence a track contains no vocals.',
    svg:
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 32 32' strokeWidth={1.8} stroke='currentColor' className='w-6 h-6' style={{
      minHeight: 24,
      minWidth: 24,
    }}>
      <path d='M20.4,24.8l1.5-3.9c0.4-1.1,1.3-2.1,2.4-2.7l0,0c3.2-1.7,3.7-6.1,1-8.8l-2.3-2.3c-2.7-2.7-7.1-2.2-8.8,1l0,0
    c-0.6,1.1-1.5,1.9-2.7,2.4l-3.9,1.5c-4.6,1.8-5.6,7.8-2,11.4L9,26.8C12.7,30.4,18.6,29.4,20.4,24.8z' />
      <circle cx='18.2' cy='14.3' r='2.9' />
      <line x1='9.7' y1='19.1' x2='13.4' y2='22.8' />
      <polyline points='26.3,3.5 22.9,6.9 25.6,9.6 29,6.2 ' />
    </svg>,
  },

  'loudness': {
    description: 'Overall loudness of a track in decibels.',
    svg:
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6' style={{
      minHeight: 24,
      minWidth: 24,
    }}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z' />
    </svg>,
  },

  'tempo': {
    description: 'Overall estimated tempo of a track in beats per minute.',
    svg:
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6' style={{
      minHeight: 24,
      minWidth: 24,
    }}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' />
    </svg>,
  },

  'valence': {
    description: 'Musical positiveness conveyed by a track.',
    svg:
    <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6' style={{
      minHeight: 24,
      minWidth: 24,
    }}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z' />
    </svg>,
  },
};

function AudioFeatureStateSvg({ audioFeatureState }: { audioFeatureState: AudioFeatureState }) {
  switch (audioFeatureState) {
  case AudioFeatureState.UP:
    return (
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={3} stroke='currentColor' className='w-6 h-6'>
        <path strokeLinecap='round' strokeLinejoin='round' d='M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18' />
      </svg>
    );
  case AudioFeatureState.DOWN:
    return (
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={3} stroke='currentColor' className='w-6 h-6'>
        <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3' />
      </svg>
    );
  default:
    return (
      <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={3} stroke='currentColor' className='w-6 h-6'>
        <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 12h-15' />
      </svg>
    );
  }
}

interface AudioFeatureComponentProps {
  audioFeature: AudioFeature;
  disabled: boolean;
  hideTooltip?: boolean;
  onClick: () => void;
  track: EnrichedTrack | null | undefined;
}

export default function AudioFeatureComponent({
  audioFeature,
  disabled,
  hideTooltip,
  onClick,
  track,
}: AudioFeatureComponentProps) {
  const id = `audio-feature-${audioFeature.property}`;
  let value = undefined;

  if (track && audioFeature.property in track.audioFeatures) {
    value = track.audioFeatures[audioFeature.property as keyof AudioFeatures] as number;

    if (audioFeature.property === 'tempo') {
      value = Math.round(value) + ' bpm';
    } else if (audioFeature.property === 'loudness') {
      value = Math.round(value) + ' dB';
    } else {
      value = Math.round(100 * value) + '%';
    }
  }

  return (<>
    <button
      className={classNames(
        'flex flex-col gap-0.5 items-center p-2 text-xl rounded-md enabled:cursor-pointer transition-[background-color] enabled:hover:bg-neutral-300 enabled:hover:dark:bg-neutral-700',
        { 'text-neutral-600 dark:text-neutral-400': audioFeature.state === AudioFeatureState.NONE },
        { 'text-green-500': audioFeature.state === AudioFeatureState.UP },
        { 'text-red-500': audioFeature.state === AudioFeatureState.DOWN },
      )}
      data-tooltip-content={audioFeature.property[0].toUpperCase() + audioFeature.property.slice(1)}
      data-tooltip-id={id}
      disabled={disabled}
      onClick={onClick}
    >
      <div className='flex gap-2'>
        {audioFeatureSvgMap[audioFeature.property].svg}
        <AudioFeatureStateSvg audioFeatureState={audioFeature.state} />
      </div>
      <span className='text-xs'>{value ?? '-'}</span>
    </button>
    {!hideTooltip &&
      <Tooltip id={id} place='bottom' style={{
        backgroundColor: '#666666',
        borderRadius: '0.5rem',
        fontSize: '0.75rem',
        lineHeight: '1rem',
        opacity: 100,
      }} />
    }
  </>);
}
