import React from 'react';

export default function SkeletonTrack() {
  return (
    <div className='py-1 pr-4 pl-2 flex gap-4 w-full items-center animate-pulse' style={{
      zIndex: 'inherit',
    }}>
      <div className='shadow-lg w-12 h-12 bg-neutral-500 dark:bg-neutral-600 rounded-md' />
      <div className='flex flex-col gap-3'>
        <div className='w-24 h-4 bg-neutral-400 dark:bg-neutral-500 rounded-xs' />
        <div className='w-36 h-3 bg-neutral-500 dark:bg-neutral-600 rounded-xs' />
      </div>
    </div>
  );
}
