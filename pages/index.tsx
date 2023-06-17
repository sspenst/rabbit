import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';
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
        backgroundImage: 'linear-gradient(to right, transparent 60%, black)',
      }} />
      <div className='absolute w-full h-full z-10' style={{
        backgroundImage: 'linear-gradient(to bottom, transparent 80%, black)',
      }} />
      <div className='relative top-12 left-0' style={{
        height: demoHeight * 1.2,
        width: demoWidth * 1.2,
      }}>
        <Image className='block h-auto w-full opacity-60' alt='demo' src='demo.png' width={demoWidth} height={demoHeight} />
      </div>
    </div>
    <div className='absolute flex m-2 h-10 items-center'>
      <a href='https://sspenst.com'>
        <Image alt='ss' src='/ss.svg' width={512} height={512} priority={true} className='w-8 h-8 m-2' style={{
          minHeight: 32,
          minWidth: 32,
        }} />
      </a>
    </div>
    <div className='flex flex-col text-center w-full justify-center font-medium h-screen items-center gap-8 p-20' style={{
      backgroundImage: 'radial-gradient(black 30%, transparent, transparent)',
    }}>
      <h1 className='text-8xl'>Rabbit</h1>
      <h2 className='text-3xl'>Discover new tracks using Spotify&apos;s audio features</h2>
      <button className='px-8 py-2 rounded-2xl bg-green-500 hover:bg-green-300 transition text-black text-xl' onClick={() => {
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
