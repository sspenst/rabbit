import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';
import Footer from '../components/footer';
import Header from '../components/header';
import ImageWithFallback from '../components/imageWithFallback';
import { redirectToAuthCodeFlow } from '../helpers/authCodeWithPkce';

export default function Index() {
  const router = useRouter();
  const demoWidth = 1062;
  const demoHeight = 1564;

  return (<>
    <div className='absolute max-h-screen h-screen max-w-full overflow-hidden' style={{
      zIndex: -1,
    }}>
      <div className='absolute w-full h-full z-10' style={{
        backgroundImage: 'linear-gradient(to right, transparent 50%, black)',
      }} />
      <div className='absolute w-full h-full z-10' style={{
        backgroundImage: 'linear-gradient(to bottom, transparent 70%, black)',
      }} />
      <div className='relative top-12 left-0' style={{
        height: demoHeight,
        width: demoWidth,
      }}>
        <ImageWithFallback className='block h-auto w-full opacity-60' alt='demo' src='demo.avif' fallback='demo.jpeg' width={demoWidth} height={demoHeight} />
      </div>
    </div>
    <div className='absolute h-12'>
      <Header />
    </div>
    <div className='flex flex-col text-center w-full justify-center font-medium min-h-screen items-center gap-8 p-12' style={{
      backgroundImage: 'radial-gradient(black 35%, transparent, transparent)',
    }}>
      <h1 className='text-8xl font-semibold'>Rabbit</h1>
      <Image alt='spotify logo' src='/spotify_logo.png' width={2362} height={708} priority={true} style={{
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
    <Footer />
  </>
  );
}
