import classNames from 'classnames';
import React from 'react';
import { Track } from '../helpers/spotifyParsers';

export enum FeatureControlState {
  NONE,
  UP,
  DOWN,
}

export interface FeatureControl {
  key: string;
  state: FeatureControlState;
}

const emojiMap: Record<string, string> = {
  'danceability': '💃',
  'energy': '⚡️',
  'instrumentalness': '🎸',
  'loudness': '🔊',
  'tempo': '⏰',
  'valence': '🙂'
};

function FeatureControlStateSvg({ featureControlState }: { featureControlState: FeatureControlState }) {
  switch (featureControlState) {
  case FeatureControlState.UP:
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
      </svg>
    );
  case FeatureControlState.DOWN:
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
      </svg>
    );
  default:
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
      </svg>
    );
  }
}

interface FeatureControlComponentProps {
  featureControl: FeatureControl;
  rotateState: () => void;
  track: Track | undefined;
}

export default function FeatureControlComponent({ featureControl, rotateState, track }: FeatureControlComponentProps) {
  let value = undefined;

  if (track && featureControl.key in track.features) {
    value = Number(track.features[featureControl.key]);

    if (featureControl.key === 'tempo') {
      value = Math.round(10 * value) / 10;
    } else {
      value = Math.round(100 * value) / 100;
    }
  }

  return (
    <button
      className={classNames(
        'flex flex-col items-center p-2 text-xl rounded-2xl enabled:cursor-pointer transition enabled:hover:bg-neutral-800',
        { 'text-neutral-500 border-neutral-500': featureControl.state === FeatureControlState.NONE },
        { 'text-green-500 border-green-500': featureControl.state === FeatureControlState.UP },
        { 'text-red-500 border-red-500': featureControl.state === FeatureControlState.DOWN },
      )}
      disabled={!track}
      onClick={rotateState}
    >
      <div className='flex gap-3'>
        {emojiMap[featureControl.key]}
        <FeatureControlStateSvg featureControlState={featureControl.state} />
      </div>
      <span className='text-xs'>{value ?? '-'}</span>
    </button>
  );
}
