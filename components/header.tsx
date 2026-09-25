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
          className='w-7 h-7'
          href='https://open.spotify.com/'
          rel='noreferrer'
          style={{
            minHeight: 28,
            minWidth: 28,
          }}
          target='_blank'
        >
          {!mounted ? null :
            <Image alt='Spotify Home' src={resolvedTheme === 'dark' ? '/Spotify_Icon_RGB_White.png' : '/Spotify_Icon_RGB_Black.png'} width={512} height={512} priority className='w-7 h-7' style={{
              minHeight: 28,
              minWidth: 28,
            }} />
          }
        </a>
        <Profile />
      </div>
    </header>
  );
}
