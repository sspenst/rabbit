import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import React, { useContext } from 'react';
import ImageWithFallback from '../components/imageWithFallback';
import { MainContext } from '../contexts/mainContext';
import { redirectToAuthCodeFlow } from '../helpers/authCodeWithPkce';

export default function Index() {
  const demoHeight = 1568;
  const demoWidth = 1058;
  const { mounted } = useContext(MainContext);
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  return (<>
    <div className='absolute h-0 w-full overflow-hidden select-none' style={{
      minHeight: 'inherit',
      zIndex: -1,
    }}>
      <div className='absolute max-h-full' style={{
        height: demoHeight,
        width: demoWidth,
      }}>
        <div className='absolute w-full h-full z-10 demo-right-gradient' />
        <div className='absolute w-full h-full z-10 demo-bottom-gradient' />
        {!mounted ? null :
          <ImageWithFallback
            alt='Demo'
            className='opacity-50 sm:opacity-80'
            fallback={resolvedTheme === 'dark' ? 'demo_black.png' : 'demo_white.png'}
            height={demoHeight}
            src={resolvedTheme === 'dark' ? 'demo_black.webp' : 'demo_white.webp'}
            width={demoWidth}
            priority
          />
        }
      </div>
    </div>
    <div className='flex flex-col text-center w-full justify-center font-medium items-center gap-8 p-12 demo-radial-gradient' style={{
      minHeight: 'inherit',
    }}>
      <h1 className='text-8xl font-semibold'>Rabbit</h1>
      {!mounted ? <div className='h-12' /> :
        <Image alt='Spotify Logo' src={resolvedTheme === 'dark' ? '/Spotify_Logo_RGB_White.png' : '/Spotify_Logo_RGB_Black.png'} width={2362} height={708} priority style={{
          minWidth: 160,
          width: 160,
        }} />
      }
      <h2 className='text-3xl'>Discover new tracks using Spotify&apos;s audio features</h2>
      <button className='px-8 py-2 rounded-full bg-green-500 hover:bg-green-300 transition text-black text-xl' onClick={() => {
        if (localStorage.getItem('accessToken')) {
          router.push('/app');
        } else {
          redirectToAuthCodeFlow();
        }
      }}>Try it</button>
    </div>
  </>
  );
}
