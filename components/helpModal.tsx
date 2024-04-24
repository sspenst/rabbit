import { Dialog, Transition } from '@headlessui/react';
import classNames from 'classnames';
import React, { Fragment, useState } from 'react';
import { EnrichedTrack } from '../helpers/enrichTrack';
import AudioFeatureComponent, { AudioFeature, audioFeatureSvgMap } from './audioFeature';
import SkeletonTrack from './skeletonTrack';
import { TrackInfo } from './trackComponent';

interface ModalProps {
  audioFeatures: AudioFeature[];
  isOpen: boolean;
  onClose: () => void;
  track: EnrichedTrack | undefined;
}

export default function HelpModal({ audioFeatures, isOpen, onClose, track }: ModalProps) {
  const [audioFeatureProperty, setAudioFeatureProperty] = useState('tempo');

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as='div'
        className='fixed inset-0 z-20 overflow-y-auto backdrop-blur-sm'
        onClose={onClose}
      >
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-200'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0' />
        </Transition.Child>
        <div className='flex min-h-full px-4 text-center items-center justify-center'>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-200'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <Dialog.Panel className='w-full max-w-fit px-6 py-4 my-8 overflow-hidden text-left align-middle transition-all transform shadow-xl rounded-xl border border-neutral-300 dark:border-neutral-700 flex flex-col gap-4 bg-white dark:bg-black'>
              <Dialog.Title as='h3' className='text-xl font-bold text-center'>
                Help
              </Dialog.Title>
              <div className='flex flex-col gap-4'>
                <span>1. Select a track to begin</span>
                {track ?
                  <div className='flex gap-4 w-full items-center truncate bg-neutral-100 dark:bg-neutral-900 rounded-md pl-2 pr-4 py-1 hover:bg-neutral-300 hover:dark:bg-neutral-700 transition'>
                    <TrackInfo track={track} />
                  </div>
                  :
                  <div className='bg-neutral-900 rounded-md'>
                    <SkeletonTrack />
                  </div>
                }
                <span>2. Discover related tracks</span>
                <button className='bg-green-500 disabled:bg-neutral-500 disabled:opacity-40 text-black p-3 rounded-full enabled:hover:bg-green-300 transition flex gap-2 font-medium w-fit'>
                  <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-6 h-6'>
                    <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' />
                  </svg>
                  <span className='hidden md:block pr-1'>Discover</span>
                </button>
                <span>
                  {'3. Refine your search with '}
                  <a
                    className='w-fit hover:underline mt-3'
                    href='https://developer.spotify.com/documentation/web-api/reference/get-audio-features'
                    rel='noreferrer'
                    target='_blank'
                  >
                    audio features
                  </a>
                </span>
                <div className='flex gap-1 flex-wrap'>
                  {audioFeatures.map(audioFeature => (
                    <div
                      className={classNames(
                        'bg-neutral-100 dark:bg-neutral-900 rounded-lg border-2 cursor-pointer',
                        audioFeature.property === audioFeatureProperty ? 'border-neutral-600 dark:border-neutral-400' : 'border-white dark:border-black',
                      )}
                      key={audioFeature.property}
                    >
                      <AudioFeatureComponent
                        audioFeature={audioFeature}
                        disabled={false}
                        hideTooltip={true}
                        onClick={() => setAudioFeatureProperty(audioFeature.property)}
                        track={track}
                      />
                    </div>
                  ))}
                </div>
                <div className='flex gap-2 items-center'>
                  {audioFeatureSvgMap[audioFeatureProperty].svg}
                  <div className='flex flex-col'>
                    <span className='italic font-medium'>
                      {audioFeatureProperty[0].toUpperCase() + audioFeatureProperty.slice(1)}
                    </span>
                    <span className='text-sm'>{audioFeatureSvgMap[audioFeatureProperty].description}</span>
                  </div>
                </div>
                <span>4. Save tracks you enjoy!</span>
                <button className='text-green-500 hover:text-green-300 w-fit'>
                  <svg width='24' height='24' viewBox='0 0 150 150' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path d='M125.784 35.0369C113.039 22.2916 92.9859 21.3682 79.1227 32.8994C79.1062 32.9135 77.318 34.3807 75 34.3807C72.6234 34.3807 70.9266 32.9416 70.8609 32.8853C57.0141 21.3682 36.9609 22.2916 24.2156 35.0369C17.6695 41.583 14.0625 50.2877 14.0625 59.5478C14.0625 68.808 17.6695 77.5127 24.0914 83.9228L64.3078 131.006C66.9844 134.14 70.882 135.938 75 135.938C79.1203 135.938 83.0156 134.14 85.6922 131.009L125.782 84.0611C139.301 70.5447 139.301 48.5533 125.784 35.0369Z' fill='currentColor' />
                  </svg>
                </button>
              </div>
              <button
                className='inline-flex justify-center px-4 py-2 mt-2 text-sm font-medium border border-transparent rounded-md bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-400 hover:dark:bg-neutral-600 transition'
                onClick={onClose}
                type='button'
              >
                Close
              </button>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
