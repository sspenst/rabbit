import Link from 'next/link';
import React from 'react';

export default function Index() {
  return (
    <div className='flex text-center w-full justify-center font-medium h-screen items-center gap-6'>
      <h1 className='text-2xl border-r border-neutral-500 pr-6 py-2'>Rabbit</h1>
      <Link className='hover:underline' href='/rabbit'>Start</Link>
    </div>
  );
}
