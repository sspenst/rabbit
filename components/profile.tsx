import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { CircleHelp, EllipsisVertical, FileText, LogOut, Monitor, Moon, Shield, Sun } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import React, { useContext } from 'react';
import { MainContext } from '../contexts/mainContext';
import SS from './icons/ss';

function ExternalLinkIcon() {
  return (
    <svg aria-hidden='true' className='w-4 h-4' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' xmlns='http://www.w3.org/2000/svg'>
      <path strokeLinecap='round' strokeLinejoin='round' d='M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25' />
    </svg>
  );
}

export default function Profile() {
  const { logOut, setIsHelpModalOpen, user } = useContext(MainContext);
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const avatarSize = 36;
  const menuItemClassName = 'grid grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-3 w-full min-w-full box-border text-left truncate py-2 px-3 rounded-lg hover:bg-neutral-300 data-focus:bg-neutral-300 dark:hover:bg-neutral-700 dark:data-focus:bg-neutral-700 outline-hidden';
  const themeOptions = [
    { icon: Monitor, label: 'System', value: 'system' },
    { icon: Sun, label: 'Light', value: 'light' },
    { icon: Moon, label: 'Dark', value: 'dark' },
  ];

  return (
    <Menu>
      <MenuButton
        aria-label={user ? 'Open account menu' : 'Open menu'}
        className='group inline-flex size-10 shrink-0 items-center justify-center rounded-full font-medium focus:outline-none'
      >
        {user ?
          <Image
            alt={user.display_name}
            className='rounded-full object-cover ring-2 ring-neutral-200 transition-shadow group-hover:ring-neutral-400 dark:ring-neutral-700 dark:group-hover:ring-neutral-500'
            height={avatarSize}
            src={user.images[0]?.url ?? '/avatar_default.png'}
            style={{
              minHeight: avatarSize,
              minWidth: avatarSize,
            }}
            width={avatarSize}
          />
          :
          <EllipsisVertical className='w-6 h-6' />
        }
      </MenuButton>
      <MenuItems
        anchor='bottom end'
        className='w-max origin-top-right rounded-xl border border-neutral-300 dark:border-neutral-700 p-1 mt-1 text-sm transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-hidden data-closed:scale-95 data-closed:opacity-0 bg-white dark:bg-black z-50'
        modal={false}
        transition
      >
        {router.pathname === '/' &&
          <>
            <MenuItem>
              <button
                className={menuItemClassName}
                onClick={() => setIsHelpModalOpen(true)}
              >
                <CircleHelp className='w-4 h-4' />
                <span>Help</span>
              </button>
            </MenuItem>
            <div className='h-px bg-neutral-200 dark:bg-neutral-800 my-1' />
          </>
        }
        {themeOptions.map(({ icon: Icon, label, value }) => (
          <MenuItem key={value}>
            <button
              aria-pressed={theme === value}
              className={menuItemClassName}
              onClick={() => setTheme(value)}
            >
              <Icon className='w-4 h-4' />
              <span className='grow'>{label}</span>
              {theme === value && <span aria-hidden='true'>✓</span>}
            </button>
          </MenuItem>
        ))}
        <div className='h-px bg-neutral-200 dark:bg-neutral-800 my-1' />
        {user &&
          <MenuItem>
            <a
              className={menuItemClassName}
              href={user.external_urls.spotify}
              rel='noreferrer'
              target='_blank'
            >
              <Image
                alt=''
                className='w-4 h-4 dark:invert'
                height={16}
                src='/Spotify_Icon_RGB_Black.png'
                width={16}
              />
              <span>Profile</span>
              <ExternalLinkIcon />
            </a>
          </MenuItem>
        }
        <MenuItem>
          <a
            className={menuItemClassName}
            href='https://sspenst.com'
            rel='noreferrer'
            target='_blank'
          >
            <span className='w-4 h-4 text-black dark:text-white'>
              <SS />
            </span>
            <span>Spencer Spenst</span>
            <ExternalLinkIcon />
          </a>
        </MenuItem>
        <MenuItem>
          <Link className={menuItemClassName} href='/privacy-policy'>
            <Shield className='w-4 h-4' />
            <span>Privacy Policy</span>
          </Link>
        </MenuItem>
        <MenuItem>
          <Link className={menuItemClassName} href='/end-user-agreement'>
            <FileText className='w-4 h-4' />
            <span>End User Agreement</span>
          </Link>
        </MenuItem>
        {user && <>
          <div className='h-px bg-neutral-200 dark:bg-neutral-800 my-1' />
          <MenuItem>
            <button
              className={menuItemClassName}
              onClick={logOut}
            >
              <LogOut className='w-4 h-4' />
              <span>Logout</span>
            </button>
          </MenuItem>
        </>}
      </MenuItems>
    </Menu>
  );
}
