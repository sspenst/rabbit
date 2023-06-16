import Image from 'next/image';
import React from 'react';
import { User } from '../helpers/spotifyParsers';

interface FormattedUserProps {
  user: User | undefined;
}

export default function FormattedUser({ user }: FormattedUserProps) {
  if (!user) {
    return null;
  }

  return (
    <a
      className='flex items-center gap-3 truncate rounded-full hover:bg-neutral-700 transition h-min'
      href={user.href}
      style={{
        minWidth: 48,
      }}
      rel='noreferrer'
      target='_blank'
    >
      <Image
        alt={user.name}
        className='shadow-lg w-12 h-12 rounded-full'
        height={48}
        src={user.image}
        style={{
          minWidth: '3rem',
        }}
        width={48}
      />
      <span className='text-lg font-medium truncate mr-4'>
        {user.name}
      </span>
    </a>
  );
}
