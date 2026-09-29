import { ArrowLeft, Menu, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import React, { useContext } from 'react';
import { MainContext } from '../contexts/mainContext';
import Rabbit from './icons/rabbit';
import Profile from './profile';

interface HeaderProps {
  title?: string;
  searchOpen?: boolean;
  search?: string;
  onSearchChange?: (query: string) => void;
  onOpenSearch?: () => void;
  onCloseSearch?: () => void;
  onOpenNavigation?: () => void;
  onGoHome?: () => void;
}

export default function Header({
  title,
  searchOpen = false,
  search = '',
  onSearchChange,
  onOpenSearch,
  onCloseSearch,
  onOpenNavigation,
  onGoHome,
}: HeaderProps) {
  const { mounted, signIn, spotifyApi } = useContext(MainContext);
  const { resolvedTheme } = useTheme();
  const hasContext = title !== undefined;

  return (
    <header className='sticky top-0 z-30 bg-white dark:bg-black'>
      <div className='mx-4 flex flex-wrap items-center justify-between md:grid md:min-h-14 md:grid-cols-[15rem_minmax(0,1fr)]'>
        <div className='flex h-14 items-center gap-2'>
          {hasContext &&
            <button aria-label='Open sources' className='rounded-lg p-1.5 md:hidden' onClick={onOpenNavigation}>
              <Menu size={21} />
            </button>
          }
          <Link
            aria-label='Rabbit Home'
            className='flex items-center gap-3 transition-opacity hover:opacity-50'
            href='/'
            onClick={event => {
              if (onGoHome) {
                event.preventDefault();
                onGoHome();
              }
            }}
          >
            <div className='size-8 shrink-0'>
              <Rabbit />
            </div>
            <span className='truncate text-2xl font-medium max-[390px]:hidden'>Rabbit</span>
          </Link>
        </div>

        {hasContext &&
          <div className='order-last flex h-10 w-full items-center justify-center md:order-0 md:col-start-2 md:row-start-1 md:ml-4 md:w-[calc(100%-12rem)] md:justify-start'>
            {searchOpen ?
              <div className='flex h-9 w-full max-w-md items-center gap-2 rounded-lg bg-neutral-100 px-2 dark:bg-neutral-900'>
                <button aria-label='Back to previous view' className='shrink-0 rounded p-1' onClick={onCloseSearch}>
                  <ArrowLeft size={18} />
                </button>
                <input
                  aria-label='Search Spotify tracks'
                  autoFocus
                  className='min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-neutral-500'
                  onChange={event => onSearchChange?.(event.target.value)}
                  onKeyDown={event => {
                    if (event.key === 'Escape') onCloseSearch?.();
                  }}
                  placeholder='Search Spotify'
                  type='search'
                  value={search}
                />
              </div>
              :
              <button
                aria-label={`Search Spotify tracks. Current view: ${title}`}
                className='flex min-w-0 max-w-full items-center gap-2 rounded-lg px-2 py-1 text-base font-medium hover:bg-neutral-100 dark:hover:bg-neutral-900'
                onClick={onOpenSearch}
                title='Search Spotify tracks'
              >
                <span className='truncate'>{title}</span>
                <Search className='shrink-0 text-neutral-500' size={17} />
              </button>
            }
          </div>
        }

        <div className='flex h-14 items-center gap-4 md:col-start-2 md:row-start-1 md:justify-self-end'>
          <a
            aria-label='Spotify Home'
            className='flex h-7 w-7 items-center justify-center sm:w-22.5'
            href='https://open.spotify.com/'
            rel='noreferrer'
            target='_blank'
          >
            {!mounted ? <span className='h-7 w-7 sm:w-22.5' /> : <>
              <Image
                alt=''
                className='hidden h-auto w-22.5 sm:block'
                height={708}
                priority
                src={resolvedTheme === 'dark' ? '/Spotify_Logo_RGB_White.png' : '/Spotify_Logo_RGB_Black.png'}
                width={2362}
              />
              <Image
                alt=''
                className='block size-7 sm:hidden'
                height={512}
                priority
                src={resolvedTheme === 'dark' ? '/Spotify_Icon_RGB_White.png' : '/Spotify_Icon_RGB_Black.png'}
                width={512}
              />
            </>}
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
      </div>
    </header>
  );
}
