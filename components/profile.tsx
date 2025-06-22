import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { LogOut, User } from 'lucide-react';
import Image from 'next/image';
import React, { useContext } from 'react';
import { MainContext } from '../contexts/mainContext';

export default function Profile() {
  const { logOut, user } = useContext(MainContext);
  const size = 40;

  if (!user) {
    return null;
  }

  const menuItemClassName = 'flex items-center gap-3 w-full text-center truncate py-2 px-3 rounded-lg hover:bg-neutral-300 dark:hover:bg-neutral-700 transition';

  return (
    <Menu>
      <MenuButton className='inline-flex items-center gap-2 rounded-md font-medium max-w-full'>
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
        className='w-fit origin-top-right rounded-xl border border-neutral-300 dark:border-neutral-700 p-1 mt-1 text-sm transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-hidden data-closed:scale-95 data-closed:opacity-0 bg-white dark:bg-black'
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
            <User className='w-4 h-4' />
            <span>Profile</span>
          </a>
        </MenuItem>
        <MenuItem>
          <button
            className={menuItemClassName}
            onClick={logOut}
          >
            <LogOut className='w-4 h-4' />
            <span>Logout</span>
          </button>
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
