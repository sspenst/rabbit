import React from 'react';
import Github from './icons/github';
import LinkedIn from './icons/linkedin';
import SS from './icons/ss';

export default function Footer() {
  return (
    <footer className='flex flex-col gap-6 items-center mx-8 mb-8 text-neutral-600 dark:text-neutral-400 text-sm text-center'>
      <div className='w-full h-px footer-gradient' />
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
        <a
          aria-label='sspenst github'
          className='w-8 h-8 hover:text-black hover:dark:text-white transition'
          href='https://github.com/sspenst'
          rel='noreferrer'
          style={{
            minHeight: 32,
            minWidth: 32,
          }}
          target='_blank'
        >
          <Github />
        </a>
        <a
          aria-label='sspenst linkedin'
          className='w-8 h-8 hover:text-black hover:dark:text-white transition'
          href='https://linkedin.com/in/sspenst'
          rel='noreferrer'
          style={{
            minHeight: 32,
            minWidth: 32,
          }}
          target='_blank'
        >
          <LinkedIn />
        </a>
      </div>
      <span>
        © {(new Date()).getFullYear()} Spencer Spenst
      </span>
      <div className='flex gap-4 flex-wrap justify-center text-xs'>
        <a
          className='hover:underline'
          href='https://docs.google.com/document/d/e/2PACX-1vQB3cuXUU8GNyzvgOMA19_T8xlVjCRqE6xr2M-pxgNC2j8_yfnjfCiDRUSt-N8UAhdiSgxURxU2UJmY/pub'
          rel='noreferrer'
          target='_blank'
        >
          End User Agreement
        </a>
        <a
          className='hover:underline'
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
