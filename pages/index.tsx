import { useRouter } from 'next/router';
import React from 'react';
import { redirectToAuthCodeFlow } from '../helpers/authCodeWithPkce';

export default function Index() {
  const router = useRouter();

  return (
    <div className='flex text-center w-full justify-center font-medium h-screen items-center gap-6'>
      <h1 className='text-2xl border-r border-neutral-500 pr-6 py-2'>Rabbit</h1>
      <button className='hover:underline' onClick={() => {
        if (localStorage.getItem('accessToken')) {
          router.push('/app');
        } else {
          redirectToAuthCodeFlow();
        }
      }}>Start</button>
    </div>
  );
}
