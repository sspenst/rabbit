import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { User } from '../helpers/spotifyParsers';
import Profile from './profile';

interface HeaderProps {
  title?: string;
  user?: User;
}

export default function Header({ title, user }: HeaderProps) {
  return (
    <div className='flex items-center mr-2 ml-4 mt-2 gap-4 h-10'>
      <Link href='/'>
        <Image alt='ss' src='/rabbit.svg' width={512} height={512} priority={true} className='w-8 h-8' style={{
          minHeight: 32,
          minWidth: 32,
        }} />
      </Link>
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
      {title &&
        <span className='grow font-medium text-2xl truncate ml-1'>
          {title}
        </span>
      }
      <Profile user={user} />
    </div>
  );
}
