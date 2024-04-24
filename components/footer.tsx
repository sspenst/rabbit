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
        <a
          className='hover:text-black hover:dark:text-white transition'
          href='https://docs.google.com/document/d/e/2PACX-1vQB3cuXUU8GNyzvgOMA19_T8xlVjCRqE6xr2M-pxgNC2j8_yfnjfCiDRUSt-N8UAhdiSgxURxU2UJmY/pub'
          rel='noreferrer'
          target='_blank'
        >
          End User Agreement
        </a>
        <a
          className='hover:text-black hover:dark:text-white transition'
          href='https://docs.google.com/document/d/e/2PACX-1vRJ0iaCx98PxgXfNEnne3RX2UGvhPk0UG7sdHZipBXG3JEQsWRxuQCP7CnOyryU0EEfkCUCfa4JI28v/pub'
          rel='noreferrer'
          target='_blank'
        >
          Privacy Policy
        </a>
      </div>
    </footer>
  );
}
