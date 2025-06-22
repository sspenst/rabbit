import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';
import Image from 'next/image';
import React from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string | undefined;
}

export default function ImageModal({ isOpen, onClose, src }: ImageModalProps) {
  return (
    <Dialog
      className='relative z-50 transition duration-300 ease-out data-closed:opacity-0'
      onClose={onClose}
      open={isOpen}
      transition
    >
      <DialogBackdrop className='fixed inset-0 bg-black/50' />
      <div className='fixed inset-0 flex w-screen items-center justify-center p-4'>
        <DialogPanel className='w-full max-w-fit my-8 overflow-hidden text-left align-middle transition-all transform shadow-xl'>
          {src &&
            <Image
              alt='image preview'
              // className='w-12 h-12'
              height={300}
              src={src}
              style={{
                minWidth: '3rem',
              }}
              width={300}
            />
          }
        </DialogPanel>
      </div>
    </Dialog>
  );
}
