import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';
import ImageWithFallback from '../components/imageWithFallback';
import { redirectToAuthCodeFlow } from '../helpers/authCodeWithPkce';

export default function Index() {
  const router = useRouter();
  const demoWidth = 1062;
  const demoHeight = 1564;

  return (<>
    <div className='absolute h-0 w-full overflow-hidden select-none' style={{
      minHeight: 'inherit',
      zIndex: -1,
    }}>
      <div className='absolute w-full h-full z-10' style={{
        backgroundImage: 'linear-gradient(to right, transparent 50%, black)',
      }} />
      <div className='absolute w-full h-full z-10' style={{
        backgroundImage: 'linear-gradient(to bottom, transparent 70%, black)',
      }} />
      <div style={{
        height: demoHeight,
        width: demoWidth,
      }}>
        <ImageWithFallback className='opacity-70' alt='Demo' src='demo.avif' fallback='demo.jpg' width={demoWidth} height={demoHeight} priority />
      </div>
    </div>
    <div className='flex flex-col text-center w-full justify-center font-medium items-center gap-8 p-12' style={{
      backgroundImage: 'radial-gradient(black 25%, transparent)',
      minHeight: 'inherit',
    }}>
      <h1 className='text-8xl font-semibold'>Rabbit</h1>
      <Image alt='Spotify Logo' src='/spotify_logo.png' width={2362} height={708} priority={true} style={{
        minWidth: 160,
        width: 160,
      }} />
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
