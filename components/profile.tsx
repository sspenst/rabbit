import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { CircleHelp, EllipsisVertical, FileText, LogOut, Monitor, Moon, Shield, Sun, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import React, { useContext } from 'react';
import { MainContext } from '../contexts/mainContext';
import SS from './icons/ss';

export default function Profile() {
  const { logOut, setIsHelpModalOpen, user } = useContext(MainContext);
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const avatarSize = 36;
  const menuItemClassName = 'grid grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-3 w-full min-w-full box-border text-left truncate py-2 px-3 rounded-lg hover:bg-neutral-300 data-focus:bg-neutral-300 dark:hover:bg-neutral-700 dark:data-focus:bg-neutral-700 transition outline-hidden';
  const themeOptions = [
    { icon: Monitor, label: 'System', value: 'system' },
    { icon: Sun, label: 'Light', value: 'light' },
    { icon: Moon, label: 'Dark', value: 'dark' },
  ];

  return (
    <Menu>
      <MenuButton
        aria-label={user ? 'Open account menu' : 'Open menu'}
        className='group inline-flex size-10 shrink-0 items-center justify-center rounded-full font-medium focus-visible:outline-2 focus-visible:outline-offset-2'
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
        {user &&
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
        }
        {router.pathname === '/app' &&
          <MenuItem>
            <button
              className={menuItemClassName}
              onClick={() => setIsHelpModalOpen(true)}
            >
              <CircleHelp className='w-4 h-4' />
              <span>Help</span>
            </button>
          </MenuItem>
        }
        {(user !== undefined || router.pathname === '/app') &&
          <div className='h-px bg-neutral-200 dark:bg-neutral-800 my-1' />
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
            <span>© 2026</span>
          </a>
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
