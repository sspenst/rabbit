import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import { featureControlSvgMap } from './featureControl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpModal({ isOpen, onClose }: ModalProps) {
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
            <Dialog.Panel className='w-full max-w-fit px-6 py-4 my-8 overflow-hidden text-left align-middle transition-all transform shadow-xl rounded-xl border border-neutral-700 flex flex-col gap-4 bg-black'>
              <Dialog.Title as='h3' className='text-xl font-bold text-center'>
                Help
              </Dialog.Title>
              <ul className='flex flex-col list-decimal pl-5'>
                <li>Select a track to listen and view its audio features.</li>
                <li>Search for related tracks.</li>
                <li>Use audio features to narrow down your search.</li>
                <li>Save tracks you enjoy!</li>
              </ul>
              <a
                className='font-bold text-lg w-fit hover:underline'
                href='https://developer.spotify.com/documentation/web-api/reference/get-audio-features'
                rel='noreferrer'
                target='_blank'
              >
                Audio Features
              </a>
              <div className='flex flex-col gap-2'>
                {Object.keys(featureControlSvgMap).map(key => {
                  return (
                    <div className='flex gap-2 items-center' key={key}>
                      {featureControlSvgMap[key].svg}
                      <div className='flex flex-col'>
                        <span className='italic font-medium'>{key[0].toUpperCase() + key.slice(1)}</span>
                        <span>{featureControlSvgMap[key].description}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button
                className='inline-flex justify-center px-4 py-2 text-sm font-medium border border-transparent rounded-md bg-neutral-800 hover:bg-neutral-600 transition'
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
