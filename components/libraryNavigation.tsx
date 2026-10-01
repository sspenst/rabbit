import type { SimplifiedPlaylist, SpotifyApi } from '@sspenst/spotify-web-api';
import { Heart, ListMusic } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface LibraryNavigationProps {
  activePlaylistId?: string;
  likedActive: boolean;
  onLikedSongs: () => void;
  onPlaylist: (playlist: SimplifiedPlaylist) => void;
  signIn: () => void;
  spotifyApi: SpotifyApi | null | undefined;
}

export default function LibraryNavigation({ activePlaylistId, likedActive, onLikedSongs, onPlaylist, signIn, spotifyApi }: LibraryNavigationProps) {
  const [filter, setFilter] = useState<'all' | 'playlists'>('all');
  const [playlists, setPlaylists] = useState<SimplifiedPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [needsPermission, setNeedsPermission] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [retry, setRetry] = useState(0);
  const offset = useRef(0);
  const generation = useRef(0);
  const fetching = useRef(false);

  async function load(api: SpotifyApi, currentGeneration: number, append = false) {
    if (fetching.current) return;
    fetching.current = true;
    setLoading(true);
    setError(undefined);

    try {
      const token = await api.getAccessToken();

      if (token && 'scope' in token && typeof token.scope === 'string' && !token.scope.split(' ').includes('playlist-read-private')) {
        if (generation.current === currentGeneration) setNeedsPermission(true);

        return;
      }

      const page = await api.currentUser.playlists.playlists(50, append ? offset.current : 0);

      if (generation.current !== currentGeneration) return;
      if (!page) throw new Error('Spotify returned no playlists.');
      const items = page.items.filter(playlist => playlist?.id);

      offset.current = page.offset + page.items.length;
      setPlaylists(previous => Array.from(new Map((append ? [...previous, ...items] : items).map(playlist => [playlist.id, playlist])).values()));
      setHasMore(Boolean(page.next));
    } catch (failure) {
      if (generation.current === currentGeneration) {
        if (failure instanceof Error && failure.message.includes('403')) setNeedsPermission(true);
        else setError('Could not load your playlists. Please try again.');
      }
    } finally {
      if (generation.current === currentGeneration) {
        fetching.current = false;
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const currentGeneration = ++generation.current;

    fetching.current = false;
    // Reset the previous account’s library before fetching this session.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlaylists([]);
    setHasMore(false);
    setError(undefined);
    setNeedsPermission(false);
    setLoading(false);
    offset.current = 0;
    if (spotifyApi) void load(spotifyApi, currentGeneration);

    return () => { generation.current += 1; };
  }, [spotifyApi, retry]);

  const rowClass = 'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm';

  return <section aria-label='Your Library'>
    <h2 className='mb-3 mt-5 px-2 text-sm font-medium text-neutral-500'>Your Library</h2>
    <div aria-label='Filter library' className='mb-3 flex gap-2 px-2'>
      {(['all', 'playlists'] as const).map(value => <button
        aria-pressed={filter === value}
        className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${filter === value ? 'bg-neutral-900 text-white dark:bg-white dark:text-black' : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700'}`}
        key={value}
        onClick={() => setFilter(value)}
      >{value}</button>)}
    </div>
    {filter === 'all' && <button aria-current={likedActive ? 'page' : undefined} className={`${rowClass} ${likedActive ? 'bg-neutral-100 dark:bg-neutral-800' : 'hover:bg-neutral-100 dark:hover:bg-neutral-900'}`} onClick={onLikedSongs}>
      <span className='flex size-10 shrink-0 items-center justify-center rounded bg-gradient-to-br from-violet-600 to-indigo-300 text-white'><Heart size={19} fill='currentColor' /></span>
      <span><span className='block font-medium'>Liked Songs</span><span className='block text-xs text-neutral-500'>Your saved tracks</span></span>
    </button>}
    {playlists.map(playlist => <button
      aria-current={activePlaylistId === playlist.id ? 'page' : undefined}
      className={`${rowClass} ${activePlaylistId === playlist.id ? 'bg-neutral-100 dark:bg-neutral-800' : 'hover:bg-neutral-100 dark:hover:bg-neutral-900'}`}
      key={playlist.id}
      onClick={() => onPlaylist(playlist)}
    >
      {/* Spotify playlist artwork may use image hosts beyond album artwork's CDN. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {playlist.images?.length ? <img alt='' className='size-10 shrink-0 rounded object-cover' src={playlist.images.at(-1)?.url} /> : <span className='flex size-10 shrink-0 items-center justify-center rounded bg-neutral-100 dark:bg-neutral-800'><ListMusic size={20} /></span>}
      <span className='min-w-0'><span className='block truncate font-medium'>{playlist.name}</span><span className='block truncate text-xs text-neutral-500'>Playlist{playlist.owner.display_name ? ` · ${playlist.owner.display_name}` : ''}</span></span>
    </button>)}
    {loading && <p role='status' className='px-2 py-3 text-xs text-neutral-500'>Loading playlists…</p>}
    {spotifyApi === null || needsPermission ? <div className='px-2 py-3 text-xs text-neutral-500'>
      <p>{needsPermission ? 'Connect Spotify to allow access to your playlists.' : 'Sign in to browse your playlists.'}</p>
      <button className='mt-2 font-medium text-green-600 hover:underline dark:text-green-400' onClick={signIn}>{needsPermission ? 'Reconnect Spotify' : 'Sign in with Spotify'}</button>
    </div> : error ? <div className='px-2 py-3 text-xs text-neutral-500'>
      <p role='alert'>{error}</p>
      <button className='mt-2 font-medium hover:underline' onClick={() => offset.current && spotifyApi ? void load(spotifyApi, generation.current, true) : setRetry(value => value + 1)}>Try again</button>
    </div> : !loading && spotifyApi && !playlists.length && <p className='px-2 py-3 text-xs text-neutral-500'>No playlists in your library yet.</p>}
    {hasMore && !error && <button className='px-2 py-3 text-xs font-medium text-neutral-500 hover:underline disabled:opacity-50' disabled={loading} onClick={() => spotifyApi && void load(spotifyApi, generation.current, true)}>More playlists</button>}
  </section>;
}
