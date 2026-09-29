import { Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import React, { useContext } from 'react';
import { MainContext } from '../contexts/mainContext';
import Rabbit from './icons/rabbit';
import Profile from './profile';

export default function Header() {
  const { mounted, search, setSearch, signIn, spotifyApi } = useContext(MainContext);
  const router = useRouter();
  const { resolvedTheme } = useTheme();

  return (
    <header className='mx-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-2 sm:mx-6'>
      <div className='flex h-10 items-center gap-3'>
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
      {router.pathname === '/' &&
        <div className='order-last flex w-full items-center gap-2 rounded-lg bg-neutral-100 px-3 dark:bg-neutral-900 md:order-none md:mx-auto md:w-auto md:max-w-md md:flex-1'>
          <Search aria-hidden='true' className='shrink-0 text-neutral-500' size={17} />
          <input
            aria-label='Search Spotify tracks'
            className='h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-500'
            onChange={event => setSearch(event.target.value)}
            placeholder='Search Spotify'
            type='search'
            value={search}
          />
        </div>
      }
      <div className='flex h-10 items-center gap-4'>
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
        {spotifyApi === null &&
          <button
            className='rounded-full bg-green-500 px-4 py-1.5 font-medium text-black transition hover:bg-green-300'
            onClick={signIn}
          >
            Sign in
          </button>
        }
        <Profile />
      </div>
    </header>
  );
}
