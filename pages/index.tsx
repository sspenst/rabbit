import { AudioFeatures, RecommendationsRequest, Track } from '@sspenst/spotify-web-api';
import { ChevronDown, ChevronUp, Heart, Pause, Play, Search, X } from 'lucide-react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AudioFeature, AudioFeatureState } from '../components/audioFeature';
import Header from '../components/header';
import HelpModal from '../components/helpModal';
import ImageModal from '../components/imageModal';
import SkeletonTrack from '../components/skeletonTrack';
import TrackComponent, { TrackActions } from '../components/trackComponent';
import { AppContext } from '../contexts/appContext';
import { MainContext } from '../contexts/mainContext';
import { pauseTrack, playTrack } from '../helpers/audioControls';
import { EnrichedTrack, EnrichedTrackData, enrichTracks, hydrateRecommendations, hydrateTracks } from '../helpers/enrichTrack';

// Development-mode Spotify apps can request at most 10 search results per page.
const searchLimit = 10;
const savedTracksLimit = 50;

interface DiscoverySession { albumArt: string; key: string; title: string; tracks: EnrichedTrack[] }
interface ViewState { key: string; kind: 'discovery' | 'liked' | 'search'; title: string }
interface SearchReturnState {
  error: string | undefined;
  hasMore: boolean;
  offset: number;
  results: EnrichedTrack[] | undefined;
  view: ViewState;
}

function featureValue(track: EnrichedTrack, property: string) {
  const value = track.audioFeatures?.[property as keyof AudioFeatures];

  if (typeof value !== 'number') return '—';
  if (property === 'tempo') return `${Math.round(value)} BPM`;
  if (property === 'loudness') return `${Math.round(value)} dB`;

  return `${Math.round(value * 100)}%`;
}

export default function Home() {
  const [audioFeatures, setAudioFeatures] = useState<AudioFeature[]>([
    { property: 'tempo', state: AudioFeatureState.NONE },
    { property: 'loudness', state: AudioFeatureState.NONE },
    { property: 'danceability', state: AudioFeatureState.NONE },
    { property: 'energy', state: AudioFeatureState.NONE },
    { property: 'instrumentalness', state: AudioFeatureState.NONE },
    { property: 'valence', state: AudioFeatureState.NONE },
  ]);
  const [isSearching, setIsSearching] = useState(true);
  const { isHelpModalOpen, setIsHelpModalOpen, setUser, signIn, spotifyApi, user } = useContext(MainContext);
  const [previewTrack, setPreviewTrack] = useState<EnrichedTrack | null>();
  const [results, setResults] = useState<EnrichedTrack[]>();
  const [view, setView] = useState<ViewState>({ key: '', kind: 'liked', title: 'Liked Songs' });
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const searchReturnRef = useRef<SearchReturnState | null>(null);
  const [history, setHistory] = useState<DiscoverySession[]>([]);
  const historyRef = useRef<DiscoverySession[]>([]);
  const resultsRef = useRef(results);
  const playerRef = useRef(previewTrack);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [playerExpanded, setPlayerExpanded] = useState(false);
  const [playerImageOpen, setPlayerImageOpen] = useState(false);
  const router = useRouter();
  const [savingTrackId, setSavingTrackId] = useState<string>();
  const [searchError, setSearchError] = useState<string>();
  const [hasMore, setHasMore] = useState(true);
  const isSearchingRef = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const searchGeneration = useRef(0);
  const searchOffset = useRef(0);
  const loadedRouteRef = useRef<string | undefined>(undefined);

  useEffect(() => { resultsRef.current = results; }, [results]);
  useEffect(() => { playerRef.current = previewTrack; }, [previewTrack]);

  const searchTracks = useCallback(async (q = '', append = false) => {
    if (spotifyApi === undefined || (append && isSearchingRef.current)) {
      return;
    }

    const generation = append ? searchGeneration.current : ++searchGeneration.current;
    const offset = append ? searchOffset.current : 0;

    isSearchingRef.current = true;
    setIsSearching(true);
    setSearchError(undefined);

    if (!append) {
      searchOffset.current = 0;
    }

    try {
      let tracks: EnrichedTrack[];
      let moreTracksAvailable: boolean;

      if (!q) {
        if (!spotifyApi) {
          setResults([]);
          setHasMore(false);

          return;
        }

        const page = await spotifyApi.currentUser.tracks.savedTracks(savedTracksLimit, offset);
        const rawTracks = page.items.map(item => item.track) as Track[];

        tracks = await enrichTracks(rawTracks, spotifyApi);
        moreTracksAvailable = page.next !== null;
      } else if (spotifyApi) {
        const response = await spotifyApi.search(q, ['track'], undefined, searchLimit, offset);
        const rawTracks = response.tracks.items as Track[];

        tracks = await enrichTracks(rawTracks, spotifyApi);
        moreTracksAvailable = response.tracks.next !== null;
      } else {
        const response = await fetch(`/api/spotify/search?${new URLSearchParams({
          offset: offset.toString(),
          q,
        })}`);

        if (!response.ok) {
          const body = await response.json() as { error?: string };

          throw new Error(body.error ?? 'Spotify search is temporarily unavailable.');
        }

        const body = await response.json() as { hasMore: boolean; tracks: EnrichedTrackData[] };

        tracks = hydrateTracks(body.tracks);
        moreTracksAvailable = body.hasMore;
      }

      // Ignore a response from a previous query if the user has searched again.
      if (generation !== searchGeneration.current) {
        return;
      }

      searchOffset.current = offset + (q ? searchLimit : savedTracksLimit);

      setResults(prevTracks => {
        const mergedTracks = append && prevTracks ? [...prevTracks, ...tracks] : tracks;

        return Array.from(new Map(mergedTracks.map(track => [track.id, track])).values());
      });

      setHasMore(moreTracksAvailable);
    } catch (error) {
      if (generation === searchGeneration.current) {
        setResults([]);
        setHasMore(false);
        const message = error instanceof Error ? error.message : '';

        setSearchError(message.includes('Unrecognised response code: 502') ?
          'Spotify search is temporarily unavailable. Please try again later.' :
          message || 'Spotify search is temporarily unavailable.');
      }
    } finally {
      if (generation === searchGeneration.current) {
        isSearchingRef.current = false;
        setIsSearching(false);
      }
    }
  }, [spotifyApi]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasMore || isSearching || results === undefined || view.kind === 'discovery') {
      return;
    }

    const observer = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) {
        void searchTracks(search, true);
      }
    }, {
      rootMargin: '400px 0px',
    });

    observer.observe(loadMoreElement);

    return () => observer.disconnect();
  }, [hasMore, isSearching, results, search, searchTracks, view.kind]);

  useEffect(() => () => clearTimeout(searchDebounce.current), []);

  function resetAudioFeatures() {
    setAudioFeatures(previous => previous.map(feature => ({ ...feature, state: AudioFeatureState.NONE })));
  }

  useEffect(() => {
    // A newly selected track starts with neutral directions.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    resetAudioFeatures();
  }, [previewTrack?.id]);

  // Space toggles the active preview unless focus is in an interactive control.
  useEffect(() => {
    function pause(event: KeyboardEvent) {
      const { code } = event;

      if (code === 'Space' && previewTrack?.preview &&
        !(event.target instanceof HTMLInputElement) &&
        !(event.target instanceof HTMLButtonElement) &&
        !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault();

        if (previewTrack.preview.paused) {
          playTrack(previewTrack, setPreviewTrack);
        } else {
          pauseTrack(previewTrack, setPreviewTrack);
        }
      }
    }

    document.addEventListener('keydown', pause);

    return () => {
      document.removeEventListener('keydown', pause);
    };
  }, [previewTrack]);

  async function getRecommendations() {
    // Prevent an in-flight search page from replacing these recommendations.
    const generation = ++searchGeneration.current;

    isSearchingRef.current = true;
    setHasMore(false);
    setIsSearching(true);
    setSearchError(undefined);

    // ensure audio features are initialized (if arriving via direct link)
    const newAudioFeatures: AudioFeature[] = [];

    for (const audioFeature of audioFeatures) {
      let state: AudioFeatureState;

      switch (router.query[audioFeature.property]) {
        case 'up':
          state = AudioFeatureState.UP;
          break;
        case 'down':
          state = AudioFeatureState.DOWN;
          break;
        default:
          state = AudioFeatureState.NONE;
          break;
      }

      newAudioFeatures.push({
        property: audioFeature.property,
        state: state,
      });
    }

    const id = router.query.id as string;
    const key = router.asPath;
    const cached = historyRef.current.find(session => session.key === key);

    if (cached) {
      setResults(cached.tracks);
      setView({ key, kind: 'discovery', title: `Recommendations from ${cached.title}` });
      setIsSearching(false);
      isSearchingRef.current = false;

      return;
    }

    const seedName = playerRef.current?.id === id ? playerRef.current.name :
      resultsRef.current?.find(result => result.id === id)?.name;

    setView({ key, kind: 'discovery', title: seedName ? `Recommendations from ${seedName}` : 'Recommendations' });
    setResults(undefined);

    try {
      if (!spotifyApi) {
        const params = new URLSearchParams({ id });

        newAudioFeatures.forEach(feature => {
          if (feature.state === AudioFeatureState.UP) {
            params.set(feature.property, 'up');
          } else if (feature.state === AudioFeatureState.DOWN) {
            params.set(feature.property, 'down');
          }
        });

        const response = await fetch(`/api/spotify/recommendations?${params}`);

        if (!response.ok) {
          const body = await response.json() as { error?: string };

          throw new Error(body.error ?? 'Spotify recommendations are temporarily unavailable.');
        }

        const body = await response.json() as { tracks: EnrichedTrackData[] };

        if (generation !== searchGeneration.current) {
          return;
        }

        // Keep the seed's Audio instance so its playing preview stays owned.
        const newRecommendations = hydrateRecommendations(body.tracks, playerRef.current);

        setResults(newRecommendations);
        recordDiscovery(key, newRecommendations[0]?.name ?? 'track', newRecommendations);

        return;
      }

      let track: EnrichedTrack;

      if (playerRef.current?.id === id) {
        track = playerRef.current;
      } else if (resultsRef.current?.some(result => result.id === id)) {
        track = resultsRef.current.find(result => result.id === id)!;
      } else {
        const trackById = await spotifyApi.tracks.get(id);

        if (!trackById) {
          await router.push('/', undefined, { shallow: true });

          return;
        }

        track = (await enrichTracks([trackById], spotifyApi))[0];
      }

      const audioFeatureParams: Record<string, number> = {};

      newAudioFeatures.forEach(feature => {
        if (track.audioFeatures) {
          const value = track.audioFeatures[feature.property as keyof AudioFeatures] as number;

          if (feature.state === AudioFeatureState.UP) {
            audioFeatureParams[`min_${feature.property}`] = value;
          } else if (feature.state === AudioFeatureState.DOWN) {
            audioFeatureParams[`max_${feature.property}`] = value;
          } else {
            audioFeatureParams[`target_${feature.property}`] = value;
          }
        }
      });

      // NB: market is inferred from the user access token.
      const recommendations = await spotifyApi.recommendations.get({
        // Leave room to prepend the seed while keeping liked-song enrichment at 50 tracks.
        limit: searchLimit - 1,
        seed_artists: track.artists.map(artist => artist.id).slice(0, 4),
        seed_tracks: [track.id],
        ...audioFeatureParams,
      } as RecommendationsRequest);

      const newRecommendations = await enrichTracks(recommendations.tracks as Track[], spotifyApi);

      if (generation !== searchGeneration.current) {
        return;
      }

      const index = newRecommendations.findIndex(recommendation => recommendation.id === track.id);

      if (index !== -1) {
        newRecommendations.splice(index, 1);
      }

      newRecommendations.unshift({ ...track });
      setResults(newRecommendations);
      recordDiscovery(key, track.name, newRecommendations);
    } catch (error) {
      if (generation === searchGeneration.current) {
        setResults([]);
        setSearchError(error instanceof Error ? error.message : 'Spotify recommendations are temporarily unavailable.');
      }
    } finally {
      if (generation === searchGeneration.current) {
        setHasMore(false);
        isSearchingRef.current = false;
        setIsSearching(false);
      }
    }
  }

  function recordDiscovery(key: string, title: string, tracks: EnrichedTrack[]) {
    const albumArt = tracks[0]?.album.images?.at(-2)?.url ?? tracks[0]?.album.images?.at(-1)?.url ?? '/music.svg';

    historyRef.current = [{ albumArt, key, title, tracks }, ...historyRef.current.filter(session => session.key !== key)].slice(0, 12);
    setHistory(historyRef.current);
    setView({ key, kind: 'discovery', title: `Recommendations from ${title}` });
  }

  // Initialize the page after both the route and optional user session are known.
  useEffect(() => {
    if (!router.isReady || spotifyApi === undefined) {
      return;
    }

    let cancelled = false;
    const routeChanged = loadedRouteRef.current !== router.asPath;

    loadedRouteRef.current = router.asPath;

    if (spotifyApi && user === undefined) {
      void spotifyApi.currentUser.profile().then(profile => {
        if (!cancelled) {
          setUser(profile);
        }
      });
    }

    if (routeChanged) {
      setSearchOpen(false);
      searchReturnRef.current = null;
      setSearch('');
      clearTimeout(searchDebounce.current);
    } else if (searchOpen) {
      if (search) {
        clearTimeout(searchDebounce.current);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void searchTracks(search);
      }

      return () => { cancelled = true; };
    }

    if (router.query.id) {
      void getRecommendations();
    } else {
      setView({ key: '', kind: 'liked', title: 'Liked Songs' });
      setResults(undefined);
      void searchTracks();
    }

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.asPath, spotifyApi]);

  async function saveTrack(track: EnrichedTrack) {
    if (!spotifyApi) {
      signIn();

      return;
    }

    setSavingTrackId(track.id);

    if (track.saved) {
      await spotifyApi?.currentUser.tracks.removeSavedTracks([track.id]);
    } else {
      await spotifyApi?.currentUser.tracks.saveTracks([track.id]);
    }

    toast.dismiss();
    toast.success(track.saved ? 'Removed from Liked Songs' : 'Added to Liked Songs');
    const saved = !track.saved;

    setPreviewTrack(prevTrack => {
      if (track.id !== prevTrack?.id) {
        return prevTrack;
      }

      const newTrack = { ...prevTrack } as EnrichedTrack;

      newTrack.saved = saved;

      return newTrack;
    });

    setResults(prevTracks => {
      if (!prevTracks) {
        return prevTracks;
      }

      return prevTracks.map(item => item.id === track.id ? { ...item, saved } : item);
    });

    if (searchReturnRef.current) {
      const previous = searchReturnRef.current;

      searchReturnRef.current = {
        ...previous,
        results: previous.results?.map(item => item.id === track.id ? { ...item, saved } : item),
      };
    }

    historyRef.current = historyRef.current.map(session => ({
      ...session,
      tracks: session.tracks.map(item => item.id === track.id ? { ...item, saved } : item),
    }));
    setHistory(historyRef.current);

    setSavingTrackId(undefined);
  }

  function openSearch() {
    setNavigationOpen(false);
    if (searchOpen) return;

    searchReturnRef.current = { error: searchError, hasMore, offset: searchOffset.current, results, view };
    searchGeneration.current += 1;
    isSearchingRef.current = false;
    clearTimeout(searchDebounce.current);
    setSearchOpen(true);
    setSearch('');
    setView({ key: '', kind: 'search', title: 'Search' });
    setResults([]);
    setHasMore(false);
    setSearchError(undefined);
    setIsSearching(false);
  }

  function closeSearch() {
    searchGeneration.current += 1;
    isSearchingRef.current = false;
    clearTimeout(searchDebounce.current);
    setSearchOpen(false);
    setSearch('');
    const previous = searchReturnRef.current;

    searchReturnRef.current = null;
    if (!previous) return;

    setView(previous.view);
    setResults(previous.results);
    setHasMore(previous.hasMore);
    setSearchError(previous.error);
    setIsSearching(false);
    searchOffset.current = previous.offset;

    if (previous.results === undefined) {
      if (previous.view.kind === 'discovery') void getRecommendations();
      else void searchTracks();
    }
  }

  function searchCatalog(q: string) {
    setSearch(q);
    searchGeneration.current += 1;
    isSearchingRef.current = false;
    clearTimeout(searchDebounce.current);
    setSearchError(undefined);

    if (!q) {
      setResults([]);
      setHasMore(false);
      setIsSearching(false);

      return;
    }

    setResults(undefined);
    setIsSearching(true);
    searchDebounce.current = setTimeout(() => void searchTracks(q), 300);
  }

  function openLikedSongs() {
    setNavigationOpen(false);
    clearTimeout(searchDebounce.current);
    searchReturnRef.current = null;
    setSearchOpen(false);
    setSearch('');

    if (router.asPath !== '/') void router.push('/', undefined, { shallow: true });
    else {
      setView({ key: '', kind: 'liked', title: 'Liked Songs' });
      setResults(undefined);
      void searchTracks();
    }
  }

  function discover() {
    if (!previewTrack) return;
    const params = new URLSearchParams({ id: previewTrack.id });

    audioFeatures.forEach(feature => {
      if (feature.state === AudioFeatureState.UP) params.set(feature.property, 'up');
      if (feature.state === AudioFeatureState.DOWN) params.set(feature.property, 'down');
    });
    setPlayerExpanded(false);
    clearTimeout(searchDebounce.current);
    searchReturnRef.current = null;
    setSearchOpen(false);
    setSearch('');
    const key = `/?${params}`;

    if (router.asPath === key) void getRecommendations();
    else void router.push(key, undefined, { shallow: true });
  }

  const isPlaying = Boolean(previewTrack?.preview && !previewTrack.preview.paused);
  const playerArt = previewTrack?.album.images?.at(-2)?.url ?? previewTrack?.album.images?.at(-1)?.url ?? '/music.svg';

  return (
    <AppContext.Provider value={{ previewTrack, saveTrack, savingTrackId, setPreviewTrack }}>
      <Head><title>{view.title} · Rabbit</title></Head>
      <Header
        onCloseSearch={closeSearch}
        onGoHome={openLikedSongs}
        onOpenNavigation={() => setNavigationOpen(true)}
        onOpenSearch={openSearch}
        onSearchChange={searchCatalog}
        search={search}
        searchOpen={searchOpen}
        title={view.title}
      />
      <div className='min-h-[calc(100svh-3.5rem)] md:flex'>
        {navigationOpen && <button aria-label='Close navigation' className='fixed inset-x-0 bottom-0 top-24 z-40 bg-black/55 md:hidden' onClick={() => setNavigationOpen(false)} />}
        <aside className={`fixed bottom-0 left-0 top-24 z-50 w-64 overflow-y-auto bg-white px-2 pb-24 pt-3 transition-transform dark:bg-black md:sticky md:bottom-auto md:top-14 md:h-[calc(100svh-3.5rem)] md:shrink-0 md:translate-x-0 ${navigationOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className='mb-7 flex items-center justify-between md:hidden'>
            <span className='font-semibold'>Sources</span>
            <button aria-label='Close navigation' onClick={() => setNavigationOpen(false)}><X size={20} /></button>
          </div>
          <button aria-current={searchOpen ? 'page' : undefined} className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm ${searchOpen ? 'bg-neutral-100 font-semibold dark:bg-neutral-800' : 'hover:bg-neutral-100 dark:hover:bg-neutral-900'}`} onClick={openSearch}>
            <Search size={18} /> Search
          </button>
          <p className='mb-2 mt-5 px-2 text-sm font-medium text-neutral-500'>Your Library</p>
          <button aria-current={!searchOpen && view.kind === 'liked' ? 'page' : undefined} className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm ${!searchOpen && view.kind === 'liked' ? 'bg-neutral-100 font-semibold dark:bg-neutral-800' : 'hover:bg-neutral-100 dark:hover:bg-neutral-900'}`} onClick={openLikedSongs}>
            <Heart size={18} /> Liked Songs
          </button>
          <p className='mb-2 mt-5 px-2 text-sm font-medium text-neutral-500'>Discovery</p>
          {history.length ? history.map(session => (
            <button
              aria-current={!searchOpen && view.key === session.key ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm ${!searchOpen && view.key === session.key ? 'bg-neutral-100 font-semibold dark:bg-neutral-800' : 'hover:bg-neutral-100 dark:hover:bg-neutral-900'}`}
              key={session.key}
              onClick={() => {
                setNavigationOpen(false);
                clearTimeout(searchDebounce.current);
                searchReturnRef.current = null;
                setSearchOpen(false);
                setSearch('');
                if (router.asPath === session.key) void getRecommendations();
                else void router.push(session.key, undefined, { shallow: true });
              }}
            >
              <Image alt='' className='size-8 shrink-0 rounded object-cover' height={32} src={session.albumArt} width={32} /><span className='truncate'>From {session.title}</span>
            </button>
          )) : <p className='px-2 pt-2 text-xs leading-5 text-neutral-500'>Your discoveries will appear here.</p>}
        </aside>

        <div className='min-w-0 flex-1 pb-36 md:pb-32'>
          <h1 className='sr-only'>{view.title}</h1>
          <div className='px-2 py-2 md:mx-4 md:px-0'>
            {results === undefined ? <div role='status' aria-label='Loading tracks'>{Array.from({ length: 12 }, (_, index) => <SkeletonTrack key={index} />)}</div> :
              searchError ? <p className='px-3 py-8 text-red-500'>{searchError}</p> :
                results.length ? <>
                  <div className='flex flex-col'>
                    {results.map(track => <div className='rounded-md py-1 pr-4 pl-2 transition-colors hover:bg-neutral-300 dark:hover:bg-neutral-700' key={track.id}><TrackComponent track={track} /></div>)}
                  </div>
                  {isSearching && <div role='status' aria-label='Loading more tracks'>{Array.from({ length: 3 }, (_, index) => <SkeletonTrack key={index} />)}</div>}
                  {hasMore && <div aria-hidden='true' className='h-px' ref={loadMoreRef} />}
                </> : view.kind === 'search' && !search ?
                  <p className='px-3 py-8 text-neutral-500'>Search Spotify to find tracks.</p> :
                  spotifyApi === null && view.kind === 'liked' ? <div className='mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-14 text-center'>
                    <Heart size={28} className='text-neutral-400' />
                    <p className='font-medium'>Your Liked Songs live here</p>
                    <p className='text-sm text-neutral-500'>Sign in to browse your library, or use Search to explore Spotify.</p>
                    <button className='rounded-full bg-green-500 px-6 py-2 font-semibold text-black hover:bg-green-400' onClick={signIn}>Sign in with Spotify</button>
                  </div> : <p className='px-3 py-8 text-neutral-500'>No tracks found</p>}
          </div>
        </div>
      </div>

      {playerExpanded && <button aria-label='Close player controls' className='fixed inset-0 z-40 bg-black/50 md:hidden' onClick={() => setPlayerExpanded(false)} />}
      <section aria-label='Active track player' className={`fixed inset-x-0 bottom-0 z-50 border-t border-neutral-200 bg-white shadow-[0_-12px_35px_rgba(0,0,0,0.08)] dark:border-neutral-800 dark:bg-neutral-950 ${playerExpanded ? 'rounded-t-2xl md:rounded-none' : ''}`}>
        {playerExpanded && <div className='mx-auto max-w-6xl border-b border-neutral-200 px-4 pb-5 pt-5 dark:border-neutral-800 sm:px-6'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='font-semibold'>Audio features</h2>
            <button aria-label='Collapse feature controls' className='rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800' onClick={() => setPlayerExpanded(false)}><ChevronDown size={20} /></button>
          </div>
          {previewTrack ? <div className='grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3 lg:grid-cols-6'>
            {audioFeatures.map(feature => (
              <div className='min-w-0' key={feature.property}>
                <div className='mb-1.5 flex items-baseline justify-between gap-1'>
                  <span className='truncate text-xs font-medium capitalize'>{feature.property}</span>
                  <span className='shrink-0 text-[11px] tabular-nums text-neutral-500 dark:text-neutral-400'>{featureValue(previewTrack, feature.property)}</span>
                </div>
                <div aria-label={`${feature.property} direction`} className='flex rounded-lg bg-neutral-200 p-0.5 dark:bg-neutral-800'>
                  {(['down', 'same', 'up'] as const).map((label, index) => {
                    const state = [AudioFeatureState.DOWN, AudioFeatureState.NONE, AudioFeatureState.UP][index];

                    return <button
                      aria-label={`${feature.property} ${label}`}
                      aria-pressed={feature.state === state}
                      className={`min-w-0 flex-1 rounded-md px-1 py-1.5 text-[11px] font-medium capitalize ${feature.state === state ? 'bg-white text-black shadow-sm dark:bg-neutral-600 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}
                      key={label}
                      onClick={() => setAudioFeatures(previous => previous.map(item => item.property === feature.property ? { ...item, state } : item))}
                    >{label}</button>;
                  })}
                </div>
              </div>
            ))}
          </div> : <p className='text-sm text-neutral-500'>Choose a track to tune its sound.</p>}
        </div>}
        <div className='mx-auto grid h-17 max-w-6xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 sm:h-18 sm:gap-4 sm:px-6'>
          <div className='flex min-w-0 max-w-96 items-center gap-2 sm:gap-3'>
            {previewTrack ? <>
              <button aria-label={`View album art for ${previewTrack.name}`} className='shrink-0 rounded-md' onClick={() => setPlayerImageOpen(true)}>
                <Image alt='' className='size-10 rounded-md object-cover sm:size-12' height={48} src={playerArt} width={48} />
              </button>
              <div className='flex min-w-0 w-fit max-w-80 flex-[0_1_auto] items-center gap-3'>
                <div className='min-w-0 w-fit max-w-56 flex-[0_1_auto]'>
                  <p className='truncate text-sm font-semibold'>{previewTrack.name}</p>
                  <p className='truncate text-xs text-neutral-500'>{previewTrack.artists.map(artist => artist.name).join(', ')}</p>
                </div>
                <div className='hidden shrink-0 items-center gap-2 sm:flex'>
                  <TrackActions track={previewTrack} />
                </div>
              </div>
            </> : <><div className='flex size-10 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-400 dark:bg-neutral-800'><Play size={18} /></div><p className='truncate text-sm text-neutral-500'>Choose a track</p></>}
          </div>
          <button aria-label={isPlaying ? 'Pause preview' : 'Play preview'} className='flex size-10 items-center justify-center rounded-full bg-black text-white disabled:opacity-30 dark:bg-white dark:text-black' disabled={!previewTrack?.preview} onClick={() => previewTrack && (isPlaying ? pauseTrack(previewTrack, setPreviewTrack) : playTrack(previewTrack, setPreviewTrack))}>{isPlaying ? <Pause size={18} fill='currentColor' /> : <Play size={18} fill='currentColor' />}</button>
          <div className='flex min-w-0 items-center justify-end gap-0.5 sm:gap-2'>
            {previewTrack && <>
              <div className='flex shrink-0 items-center gap-1 sm:hidden'>
                <TrackActions track={previewTrack} />
              </div>
              <button aria-expanded={playerExpanded} aria-label={playerExpanded ? 'Hide audio features' : 'Show audio features'} className='flex items-center gap-1 rounded-lg px-1 py-2 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 sm:px-2' onClick={() => setPlayerExpanded(!playerExpanded)}><span className='hidden sm:inline'>Features</span>{playerExpanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />}</button>
              <button aria-label='Discover' className='flex items-center justify-center rounded-full bg-green-500 px-2.5 py-2 text-xs font-semibold text-black hover:bg-green-400 max-[360px]:px-1.5 sm:px-4 sm:text-sm' onClick={discover}><Search className='min-[390px]:hidden' size={16} /><span className='max-[389px]:hidden'>Discover</span></button>
            </>}
          </div>
        </div>
      </section>
      <ImageModal isOpen={playerImageOpen && Boolean(previewTrack)} onClose={() => setPlayerImageOpen(false)} src={playerArt} />
      <HelpModal audioFeatures={audioFeatures} isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} track={previewTrack ?? results?.at(0)} />
    </AppContext.Provider>
  );
}
