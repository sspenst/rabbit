import classNames from 'classnames';
import React from 'react';
import { Track } from '../helpers/spotifyParsers';

export enum FeatureControlValue {
  NONE,
  UP,
  DOWN,
}

export interface FeatureControl {
  key: string;
  value: FeatureControlValue;
}

const emojiMap: Record<string, string> = {
  'danceability': '💃',
  'energy': '⚡️',
  'loudness': '🔊',
  'tempo': '⏰',
  'valence': '🙂'
};

function FeatureControlValueSvg({ featureControlValue }: { featureControlValue: FeatureControlValue }) {
  switch (featureControlValue) {
  case FeatureControlValue.UP:
    return (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
      </svg>
    );
  case FeatureControlValue.DOWN:
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
  rotateValue: () => void;
  track: Track | undefined;
}

export default function FeatureControlComponent({ featureControl, rotateValue, track }: FeatureControlComponentProps) {
  return (
    <button
      className={classNames(
        'flex flex-col items-center p-2 text-xl rounded-2xl enabled:cursor-pointer transition enabled:hover:bg-neutral-800',
        { 'text-neutral-500 border-neutral-500': featureControl.value === FeatureControlValue.NONE },
        { 'text-green-500 border-green-500': featureControl.value === FeatureControlValue.UP },
        { 'text-red-500 border-red-500': featureControl.value === FeatureControlValue.DOWN },
      )}
      disabled={!track}
      onClick={rotateValue}
    >
      <div className='flex gap-3'>
        {emojiMap[featureControl.key]}
        <FeatureControlValueSvg featureControlValue={featureControl.value} />
      </div>
      <span className='text-xs'>{track?.features[featureControl.key] ?? '-'}</span>
    </button>
  );
}
