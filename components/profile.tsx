import { Menu, Transition } from '@headlessui/react';
import Image from 'next/image';
import React, { Fragment, useContext } from 'react';
import { MainContext } from '../contexts/mainContext';

export default function Profile() {
  const { logOut, user } = useContext(MainContext);
  const size = 40;

  if (!user) {
    return null;
  }

  const menuItemClassName = 'w-full text-center truncate p-2 rounded-lg hover:bg-neutral-300 hover:dark:bg-neutral-700 transition';

  return (
    <Menu>
      <Menu.Button>
        <Image
          alt={user.display_name}
          className='rounded-full hover:opacity-80 transition'
          height={size}
          src={user.images[0]?.url ?? '/avatar_default.png'}
          style={{
            minHeight: size,
            minWidth: size,
          }}
          width={size}
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
        <Menu.Items className='absolute top-12 right-0 m-2 p-1 w-28 origin-top-right rounded-xl shadow-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 flex flex-col items-center z-10'>
          <Menu.Item>
            <a
              className={menuItemClassName}
              href={user.external_urls.spotify}
              rel='noreferrer'
              target='_blank'
            >
              Profile
            </a>
          </Menu.Item>
          <Menu.Item>
            <button
              className={menuItemClassName}
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
