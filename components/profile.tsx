import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import Image from 'next/image';
import React, { useContext } from 'react';
import { MainContext } from '../contexts/mainContext';

export default function Profile() {
  const { logOut, user } = useContext(MainContext);
  const size = 40;

  if (!user) {
    return null;
  }

  const menuItemClassName = 'block w-full text-center truncate p-2 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 transition';

  return (
    <Menu>
      <MenuButton className='inline-flex items-center gap-2 rounded-md text-sm font-medium max-w-full'>
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
      </MenuButton>
      <MenuItems
        anchor='bottom end'
        className='w-28 origin-top-right rounded-xl border border-neutral-200 bg-white p-1 mt-1 text-sm/6 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-hidden data-closed:scale-95 data-closed:opacity-0'
        modal={false}
        transition
      >
        <MenuItem>
          <a
            className={menuItemClassName}
            href={user.external_urls.spotify}
            rel='noreferrer'
            target='_blank'
          >
            Profile
          </a>
        </MenuItem>
        <MenuItem>
          <button
            className={menuItemClassName}
            onClick={logOut}
          >
            Logout
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
