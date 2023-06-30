import React from 'react';

export default function Rabbit() {
  return (
    <svg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg' stroke='currentColor' strokeWidth='2' strokeLinecap='round'>
      <path
        stroke='pink'
        fill='pink'
        d='M 15 27
        c -12 -26, 12 -26, 0 0'
      />
      <path
        fill='none'
        d='M 10 28
        c -16 -35, 26 -35, 10 0'
      />
      <line x1='20' y1='28' x2='24' y2='25' />
    </svg>
  );
}
