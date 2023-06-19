import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';
import Footer from '../components/footer';
import { redirectToAuthCodeFlow } from '../helpers/authCodeWithPkce';

export default function Index() {
  const router = useRouter();
  const demoWidth = 2706;
  const demoHeight = 1560;

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
        height: demoHeight * 1.2,
        width: demoWidth * 1.2,
      }}>
        <Image className='block h-auto w-full opacity-60' alt='demo' src='demo.png' width={demoWidth} height={demoHeight} />
      </div>
    </div>
    <div className='absolute flex my-2 mx-4 gap-4 h-10 items-center'>
      <a href='https://sspenst.com' rel='noreferrer' target='_blank'>
        <Image alt='ss' src='/ss.svg' width={512} height={512} priority={true} className='w-8 h-8' style={{
          minHeight: 32,
          minWidth: 32,
        }} />
      </a>
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
        <Image alt='spotify-icon' src='/spotify_icon.png' width={512} height={512} priority={true} className='w-7 h-7' style={{
          minHeight: 28,
          minWidth: 28,
        }} />
      </a>
    </div>
    <div className='flex flex-col text-center w-full justify-center font-medium min-h-screen items-center gap-8 p-12' style={{
      backgroundImage: 'radial-gradient(black 35%, transparent, transparent)',
    }}>
      <h1 className='text-8xl font-semibold'>Rabbit</h1>
      <Image alt='spotify-logo' src='/spotify_logo.png' width={2362} height={708} priority={true} style={{
        height: 708 / 15,
        minWidth: 2362 / 15,
        width: 2362 / 15,
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
