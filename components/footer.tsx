import React from 'react';
import Github from './icons/github';
import LinkedIn from './icons/linkedin';
import SS from './icons/ss';

export default function Footer() {
  return (
    <div className='flex flex-col gap-6 items-center m-8 text-neutral-500 text-sm'>
      <div className='flex flex-wrap gap-6 items-center justify-center'>
        <a
          className='w-8 h-8 hover:text-neutral-300 transition'
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
          className='w-8 h-8 hover:text-neutral-300 transition'
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
          className='w-8 h-8 hover:text-neutral-300 transition'
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
    </div>
  );
}
