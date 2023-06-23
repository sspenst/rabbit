import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { User } from '../helpers/spotifyParsers';
import Profile from './profile';

interface HeaderProps {
  title?: string;
  user?: User;
}

export default function Header({ title, user }: HeaderProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function handleBeforeInstallPromptEvent(event: any) {
      event.preventDefault();
      setDeferredPrompt(event);
    }

    function handleAppInstalledEvent() {
      setDeferredPrompt(null);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPromptEvent);
    window.addEventListener('appinstalled', handleAppInstalledEvent);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPromptEvent);
      window.removeEventListener('appinstalled', handleAppInstalledEvent);
    };
  }, []);

  function installPWA() {
    deferredPrompt.prompt();
    setDeferredPrompt(null);
  }

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
        {title &&
          <span className='grow font-medium text-2xl truncate ml-1'>
            {title}
          </span>
        }
      </div>
      <div className='flex items-center mt-2 gap-4 h-10'>
        {deferredPrompt &&
          <button className='text-neutral-300 hover:text-white transition' onClick={installPWA}>
            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25' />
            </svg>
          </button>
        }
        <Profile user={user} />
      </div>
    </header>
  );
}
