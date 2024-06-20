import Link from 'next/link';
import React from 'react';
import SS from './icons/ss';

export default function Footer() {
  return (
    <footer className='flex flex-col items-center gap-6 mb-8 mx-8 text-neutral-600 dark:text-neutral-400 text-sm text-center'>
      <div className='w-full h-px footer-gradient' />
      <div className='flex flex-wrap gap-x-10 gap-y-6 items-center justify-center'>
        <div className='flex flex-wrap gap-6 items-center justify-center'>
          <a
            aria-label='sspenst home'
            className='w-8 h-8 hover:text-black hover:dark:text-white transition'
            href='https://sspenst.com'
            rel='noreferrer'
            style={{
              minHeight: 32,
              minWidth: 32,
            }}
            target='_blank'
          >
            <SS />
          </a>
          <span>
            © 2024 Spencer Spenst
          </span>
        </div>
        <Link
          className='hover:text-black hover:dark:text-white transition'
          href='/end-user-agreement'
        >
          End User Agreement
        </Link>
        <Link
          className='hover:text-black hover:dark:text-white transition'
          href='/privacy-policy'
        >
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
}
