import { Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { Fragment } from 'react';
import { removeTokens } from '../helpers/authCodeWithPkce';
import { User } from '../helpers/spotifyParsers';

interface ProfileProps {
  user: User | undefined;
}

export default function Profile({ user }: ProfileProps) {
  const router = useRouter();

  function logOut() {
    removeTokens();
    router.push('/');
  }

  if (!user) {
    return (
      <Image
        alt='profile'
        className='rounded-full select-none'
        height={48}
        src='user.svg'
        width={48}
      />
    );
  }

  return (
    <Menu>
      <Menu.Button>
        <Image
          alt={user.name}
          className='rounded-full select-none'
          height={48}
          src={user.image}
          width={48}
        />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <Menu.Items className='absolute top-16 right-0 m-2 p-1 w-32 origin-top-right rounded-lg shadow-lg border border-neutral-700 bg-neutral-800 flex flex-col items-center select-none'>
          <Menu.Item>
            <a
              className='w-full text-center text-neutral-500 hover:text-white truncate p-2 rounded-lg hover:bg-neutral-700 transition'
              href={user.href}
              style={{
                minWidth: 48,
              }}
              rel='noreferrer'
              target='_blank'
            >
              Profile
            </a>
          </Menu.Item>
          <Menu.Item>
            <button
              className='w-full text-neutral-500 hover:text-white truncate p-2 rounded-lg hover:bg-neutral-700 transition'
              onClick={logOut}
            >
              Logout
            </button>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
