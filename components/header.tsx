import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import React, { useContext } from 'react';
import { MainContext } from '../contexts/mainContext';
import Rabbit from './icons/rabbit';
import Profile from './profile';

export default function Header() {
  const { mounted } = useContext(MainContext);
  const { resolvedTheme } = useTheme();

  return (
    <header className='flex justify-between mx-4'>
      <div className='flex items-center mt-2 gap-3 h-10'>
        <Link
          aria-label='Rabbit Home'
          className='flex items-center gap-3 hover:opacity-50 transition-opacity'
          href='/'
        >
          <div
            className='w-8 h-8'
            style={{
              minHeight: 32,
              minWidth: 32,
            }}
          >
            <Rabbit />
          </div>
          <span className='font-medium text-2xl truncate'>
            Rabbit
          </span>
        </Link>
      </div>
      <div className='flex items-center mt-2 gap-4 h-10'>
        <a
          aria-label='Spotify Home'
          className='flex items-center justify-center w-7 sm:w-22.5 h-7'
          href='https://open.spotify.com/'
          rel='noreferrer'
          target='_blank'
        >
          {!mounted ? <span className='w-7 sm:w-22.5 h-7' /> : <>
            <Image
              alt=''
              className='hidden sm:block w-22.5 h-auto'
              height={708}
              priority
              src={resolvedTheme === 'dark' ? '/Spotify_Logo_RGB_White.png' : '/Spotify_Logo_RGB_Black.png'}
              width={2362}
            />
            <Image
              alt=''
              className='block sm:hidden w-7 h-7'
              height={512}
              priority
              src={resolvedTheme === 'dark' ? '/Spotify_Icon_RGB_White.png' : '/Spotify_Icon_RGB_Black.png'}
              width={512}
            />
          </>
          }
        </a>
        <Profile />
      </div>
    </header>
  );
}
