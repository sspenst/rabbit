import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import React, { useContext, useEffect } from 'react';
import { MainContext } from '../contexts/mainContext';
import Rabbit from './icons/rabbit';
import Profile from './profile';

export default function Header() {
  const { mounted } = useContext(MainContext);
  const { resolvedTheme, setTheme, systemTheme } = useTheme();

  // switch back to system theme if it's the same as the resolved theme
  useEffect(() => {
    if (systemTheme && resolvedTheme && systemTheme === resolvedTheme) {
      setTheme('system');
    }
  }, [resolvedTheme, setTheme, systemTheme]);

  return (
    <header className='flex justify-between mx-4'>
      <div className='flex items-center mt-2 gap-4 h-10'>
        <Link
          aria-label='Rabbit Home'
          className='w-8 h-8'
          href='/'
          style={{
            minHeight: 32,
            minWidth: 32,
          }}
        >
          <Rabbit />
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
          {!mounted ? null :
            <Image alt='Spotify Home' src={resolvedTheme === 'dark' ? '/Spotify_Icon_RGB_White.png' : '/Spotify_Icon_RGB_Black.png'} width={512} height={512} priority className='w-7 h-7' style={{
              minHeight: 28,
              minWidth: 28,
            }} />
          }
        </a>
        <span className='grow font-medium text-2xl truncate ml-1'>
          Rabbit
        </span>
      </div>
      <div className='flex items-center mt-2 gap-4 h-10'>
        {!mounted ? <div className='w-6' /> : resolvedTheme === 'dark' ?
          <button
            aria-label='Light Mode'
            className='hover:text-neutral-400 transition'
            onClick={() => setTheme(systemTheme === 'light' ? 'system' : 'light')}
          >
            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' />
            </svg>
          </button>
          :
          <button
            aria-label='Dark Mode'
            className='hover:text-neutral-400 transition'
            onClick={() => setTheme(systemTheme === 'dark' ? 'system' : 'dark')}
          >
            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z' />
            </svg>
          </button>
        }
        <Profile />
      </div>
    </header>
  );
}
