import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import Profile from './profile';

export default function Header() {
  return (
    <header className='flex justify-between mx-4'>
      <div className='flex items-center mt-2 gap-4 h-10'>
        <Link href='/'>
          <Image alt='Rabbit Home' src='/rabbit.svg' width={512} height={512} priority={true} className='w-8 h-8' style={{
            minHeight: 32,
            minWidth: 32,
          }} />
        </Link>
        <a
          className='w-7 h-7'
          href='https://open.spotify.com/'
          rel='noreferrer'
          style={{
            minHeight: 28,
            minWidth: 28,
          }}
          target='_blank'
        >
          <Image alt='Spotify Home' src='/spotify_icon.png' width={512} height={512} priority={true} className='w-7 h-7' style={{
            minHeight: 28,
            minWidth: 28,
          }} />
        </a>
        <span className='grow font-medium text-2xl truncate ml-1'>
          Rabbit
        </span>
      </div>
      <div className='flex items-center mt-2 -mr-2 gap-4 h-10'>
        <Profile />
      </div>
    </header>
  );
}
