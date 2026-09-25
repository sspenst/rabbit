import { AudioFeatures, RecommendationsRequest, SpotifyApi, Track } from '@sspenst/spotify-web-api';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import AudioFeatureComponent, { AudioFeature, AudioFeatureState } from '../components/audioFeature';
import HelpModal from '../components/helpModal';
import SkeletonTrack from '../components/skeletonTrack';
import TrackComponent from '../components/trackComponent';
import { AppContext } from '../contexts/appContext';
import { MainContext } from '../contexts/mainContext';
import { pauseTrack, playTrack } from '../helpers/audioControls';
import { EnrichedTrack, enrichTracks } from '../helpers/enrichTrack';

// 50 is the highest limit that works for all endpoints. Recommendations can go
// up to 100, but then liked-song lookups would need to be batched.
const searchLimit = 50;

export default function App() {
  const [audioFeatures, setAudioFeatures] = useState<AudioFeature[]>([
    { property: 'tempo', state: AudioFeatureState.NONE },
    { property: 'loudness', state: AudioFeatureState.NONE },
    { property: 'danceability', state: AudioFeatureState.NONE },
    { property: 'energy', state: AudioFeatureState.NONE },
    { property: 'instrumentalness', state: AudioFeatureState.NONE },
    { property: 'valence', state: AudioFeatureState.NONE },
  ]);
  const [isSearching, setIsSearching] = useState(true);
  const { isHelpModalOpen, logOut, setIsHelpModalOpen, setSpotifyApi, setUser, spotifyApi, user } = useContext(MainContext);
  const [previewTrack, setPreviewTrack] = useState<EnrichedTrack | null>();
  const [results, setResults] = useState<EnrichedTrack[]>();
  const router = useRouter();
  const [savingTrackId, setSavingTrackId] = useState<string>();
  const [search, setSearch] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const isSearchingRef = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const searchGeneration = useRef(0);
  const searchOffset = useRef(0);

  // search for tracks - only used on /app
  const searchTracks = useCallback(async (q = '', append = false) => {
    if (!spotifyApi || (append && isSearchingRef.current)) {
      return;
    }

    const generation = append ? searchGeneration.current : ++searchGeneration.current;
    const offset = append ? searchOffset.current : 0;

    isSearchingRef.current = true;
    setIsSearching(true);

    if (!append) {
      searchOffset.current = 0;
    }

    try {
      let rawTracks: Track[];
      let moreTracksAvailable: boolean;

      if (!q) {
        const page = await spotifyApi.currentUser.tracks.savedTracks(searchLimit, offset);

        rawTracks = page.items.map(item => item.track) as Track[];
        moreTracksAvailable = page.next !== null;
      } else {
        const response = await spotifyApi.search(q, ['track'], undefined, searchLimit, offset);
        const page = response.tracks;

        rawTracks = page.items as Track[];
        moreTracksAvailable = page.next !== null;
      }

      const tracks = await enrichTracks(rawTracks, spotifyApi);

      // Ignore a response from a previous query if the user has searched again.
      if (generation !== searchGeneration.current) {
        return;
      }

      searchOffset.current = offset + searchLimit;

      setResults(prevTracks => {
        const mergedTracks = append && prevTracks ? [...prevTracks, ...tracks] : tracks;

        return Array.from(new Map(mergedTracks.map(track => [track.id, track])).values());
      });

      setHasMore(moreTracksAvailable);
    } finally {
      if (generation === searchGeneration.current) {
        isSearchingRef.current = false;
        setIsSearching(false);
      }
    }
  }, [spotifyApi]);

  useEffect(() => {
    const loadMoreElement = loadMoreRef.current;

    if (!loadMoreElement || !hasMore || isSearching || results === undefined) {
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
  }, [hasMore, isSearching, results, search, searchTracks]);

  useEffect(() => () => clearTimeout(searchDebounce.current), []);

  function resetAudioFeatures() {
    setAudioFeatures(prevAudioFeatures => {
      const newAudioFeatures = [...prevAudioFeatures];

      newAudioFeatures.forEach(f => f.state = AudioFeatureState.NONE);

      return newAudioFeatures;
    });
  }

  // if the route changes we always need to initialize the page
  useEffect(() => {
    // avoid flashing empty page when query id is passed in
    if (!router.isReady) {
      return;
    }

    if (spotifyApi === undefined) {
      const clientId = 'a16d23f0a5e34c73b8719bd006b90464';
      const redirectUri = `${location.protocol}//${location.host}/app`;
      const scopes = ['user-library-read', 'user-library-modify'];
      const api = SpotifyApi.withUserAuthorization(clientId, redirectUri, scopes);

      api.authenticate().then(
        async () => {
          const accessToken = await api.getAccessToken();

          // don't set the spotify api until we have confirmed we are actually logged in
          setSpotifyApi(accessToken ? api : undefined);
        },
        () => setSpotifyApi(null),
      );

      return;
    }

    // an error occurred authenticating the spotify api
    if (spotifyApi === null) {
      return;
    }

    if (user === undefined) {
      spotifyApi.currentUser.profile().then(user => setUser(user));
    }

    // reset search and get new results
    setSearch('');
    setResults(undefined);

    if (router.query.id) {
      getRecommendations();
    } else {
      resetAudioFeatures();
      setPreviewTrack(null);
      searchTracks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, spotifyApi]);

  // ensure audio is paused when leaving the page
  useEffect(() => {
    function getRouteId(route: string) {
      if (!route.includes('?')) {
        return null;
      }

      const params = new URLSearchParams(route.split('?')[1]);

      return params.get('id');
    }

    function pausePreviewTrack(route: string) {
      // if the preview track changes, we must pause the audio
      if (previewTrack?.preview && getRouteId(route) !== previewTrack.id) {
        pauseTrack(previewTrack, setPreviewTrack);
      }
    }

    router.events.on('routeChangeStart', pausePreviewTrack);

    return () => {
      router.events.off('routeChangeStart', pausePreviewTrack);
    };
  }, [previewTrack, router]);

  // pause/play preview track with P
  useEffect(() => {
    function pause(event: KeyboardEvent) {
      const { code } = event;

      if (code === 'Space' && previewTrack?.preview) {
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
    searchGeneration.current += 1;
    isSearchingRef.current = true;
    setHasMore(false);
    setIsSearching(true);

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

    setAudioFeatures(newAudioFeatures);

    const id = router.query.id as string;
    let track: EnrichedTrack;

    if (previewTrack?.id !== id) {
      setPreviewTrack(undefined);

      const trackById = await spotifyApi?.tracks.get(id);

      // invalid track id, go back to /app
      if (!trackById) {
        router.push('/app', undefined, { shallow: true });

        return;
      }

      track = (await enrichTracks([trackById], spotifyApi))[0];

      setPreviewTrack(track);
    } else {
      track = previewTrack;
    }

    const audioFeatureParams: Record<string, number> = {};

    newAudioFeatures.forEach(f => {
      if (track.audioFeatures) {
        const value = track.audioFeatures[f.property as keyof AudioFeatures] as number;

        if (f.state === AudioFeatureState.UP) {
          audioFeatureParams[`min_${f.property}`] = value;
        } else if (f.state === AudioFeatureState.DOWN) {
          audioFeatureParams[`max_${f.property}`] = value;
        } else {
          audioFeatureParams[`target_${f.property}`] = value;
        }
      }
    });

    // NB: market is inferred from the access token, so we don't need to specify it here
    // maximum of 5 seed values are allowed: use the track id and up to 4 artists
    const recommendations = await spotifyApi?.recommendations.get({
      limit: searchLimit,
      seed_artists: track.artists.map(a => a.id).slice(0, 4),
      seed_tracks: [track.id],
      ...audioFeatureParams,
    } as RecommendationsRequest);

    const newRecommendations = await enrichTracks(recommendations?.tracks as Track[] | undefined, spotifyApi);

    // we always want previewTrack to be at the start of the recommendation list,
    // but we don't want any duplicates, so remove the track if it exists before unshifting it
    const index = newRecommendations.findIndex(t => t.id === track.id);

    if (index !== -1) {
      newRecommendations.splice(index, 1);
    }

    newRecommendations.unshift({ ...track });

    setResults(newRecommendations);
    setHasMore(false);
    isSearchingRef.current = false;
    setIsSearching(false);
  }

  async function saveTrack(track: EnrichedTrack) {
    setSavingTrackId(track.id);

    if (track.saved) {
      await spotifyApi?.currentUser.tracks.removeSavedTracks([track.id]);
    } else {
      await spotifyApi?.currentUser.tracks.saveTracks([track.id]);
    }

    toast.dismiss();
    toast.success(track.saved ? 'Removed from Liked Songs' : 'Added to Liked Songs');

    setPreviewTrack(prevTrack => {
      if (track.id !== prevTrack?.id) {
        return prevTrack;
      }

      const newTrack = { ...prevTrack } as EnrichedTrack;

      newTrack.saved = !newTrack.saved;

      return newTrack;
    });

    setResults(prevTracks => {
      if (!prevTracks) {
        return prevTracks;
      }

      const index = prevTracks.findIndex(t => t.id === track.id);

      if (index === -1) {
        return prevTracks;
      }

      const newTracks = [...prevTracks];

      newTracks[index].saved = !newTracks[index].saved;

      return newTracks;
    });

    setSavingTrackId(undefined);
  }

  if (spotifyApi === null) {
    return (
      <div className='flex flex-col text-center justify-center p-8 gap-8' style={{
        minHeight: 'inherit'
      }}>
        <div className='text-xl font-medium'>
          Error fetching user information
        </div>
        <div>
          {'Try '}
          <button
            className='text-blue-500 hover:text-blue-300 transition'
            onClick={logOut}
          >
            logging out
          </button>
          {' or refreshing to resolve the issue.'}
        </div>
        <div>
          {'If you are still seeing this error, you can '}
          <a
            className='text-blue-500 hover:text-blue-300 transition'
            href='https://github.com/sspenst/rabbit/issues/new'
            rel='noreferrer'
            target='_blank'
          >
            report an issue
          </a>
          {' or '}
          <a
            className='text-blue-500 hover:text-blue-300 transition'
            href='mailto:spencerspenst@gmail.com'
            rel='noreferrer'
            target='_blank'
          >
            contact me
          </a>
          {'.'}
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      previewTrack: previewTrack,
      saveTrack: saveTrack,
      savingTrackId: savingTrackId,
      setPreviewTrack: setPreviewTrack,
    }}>
      {previewTrack?.preview && !previewTrack.preview.paused &&
        <Head>
          <title>{previewTrack.name} by {previewTrack.artists.map(a => a.name).join(', ')}</title>
        </Head>
      }
      <div className='sm:sticky top-0 p-2 bg-white dark:bg-black flex justify-center'>
        <div className='bg-neutral-100 dark:bg-neutral-900 rounded-md px-2 pt-2 pb-1 flex flex-col gap-1 max-w-full w-3xl'>
          <div className='flex justify-center w-full'>
            {previewTrack === null ?
              <input
                autoFocus
                className='w-full rounded-md h-14 bg-neutral-100 dark:bg-neutral-900 text-4xl px-3'
                onChange={e => {
                  const q = e.target.value;

                  searchGeneration.current += 1;
                  setSearch(q);
                  setResults(undefined);
                  clearTimeout(searchDebounce.current);
                  searchDebounce.current = setTimeout(() => void searchTracks(q), 300);
                }}
                placeholder='Search'
                type='search'
                value={search}
              />
              :
              <>
                {previewTrack ?
                  <div className='flex items-center w-full hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-[background-color] py-1 pr-4 pl-2 gap-4 rounded-md h-14'>
                    <TrackComponent track={previewTrack} />
                    <button
                      aria-label='clear'
                      onClick={async () => {
                        previewTrack.preview?.pause();
                        setPreviewTrack(null);
                        resetAudioFeatures();

                        if (router.query.id) {
                          router.push('/app', undefined, { shallow: true });
                        } else if (search) {
                          setSearch('');
                          setResults(undefined);
                          await searchTracks();
                        }
                      }}
                    >
                      <svg className='text-neutral-500 hover:text-black dark:hover:text-white w-6 h-6 -mx-1 cursor-pointer' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
                        <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                      </svg>
                    </button>
                  </div>
                  :
                  <SkeletonTrack />
                }
              </>
            }
          </div>
          <div className='flex w-full gap-3 px-1 items-center'>
            <div className='flex gap-1 flex-wrap grow'>
              {audioFeatures.map(audioFeature => (
                <AudioFeatureComponent
                  audioFeature={audioFeature}
                  disabled={!previewTrack}
                  key={audioFeature.property}
                  onClick={() => setAudioFeatures(prevAudioFeatures => {
                    const newAudioFeatures = [...prevAudioFeatures];
                    const audioFeatureToRotate = newAudioFeatures.find(f => f.property === audioFeature.property);

                    if (audioFeatureToRotate) {
                      audioFeatureToRotate.state = (audioFeatureToRotate.state + 1) % 3;
                    }

                    return newAudioFeatures;
                  })}
                  track={previewTrack}
                />
              ))}
            </div>
            <button
              aria-label='discover'
              className='bg-green-500 disabled:bg-neutral-500 disabled:opacity-40 text-black p-3 rounded-full enabled:hover:bg-green-300 transition flex gap-2 font-medium'
              disabled={!previewTrack || !results}
              onClick={() => {
                if (!previewTrack) {
                  return;
                }

                const audioFeatureParams: Record<string, string> = {};

                audioFeatures.forEach(f => {
                  if (f.state === AudioFeatureState.UP) {
                    audioFeatureParams[f.property] = 'up';
                  } else if (f.state === AudioFeatureState.DOWN) {
                    audioFeatureParams[f.property] = 'down';
                  }
                });

                router.push(`/app?${new URLSearchParams({
                  id: previewTrack.id,
                  ...audioFeatureParams,
                })}`, undefined, { shallow: true });
              }}
            >
              <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-6 h-6'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' />
              </svg>
              <span className='hidden md:block mr-1'>Discover</span>
            </button>
          </div>
        </div>
      </div>
      <div className='flex justify-center mb-4'>
        {results === undefined ?
          <div className='flex flex-col w-full max-w-3xl px-2' style={{
            zIndex: -1,
          }}>
            {Array.from({ length: 20 }, (_, index) => <SkeletonTrack key={`skeleton-track-${index}`} />)}
          </div>
          :
          results.length ?
            <div className='flex flex-col items-center text-center w-full px-2 max-w-3xl'>
              {results.map(track => (
                <div className='w-full hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-[background-color] py-1 pr-4 pl-2 rounded-md' key={`track-${track.id}`}>
                  <TrackComponent track={track} />
                </div>
              ))}
              {isSearching &&
                <div className='w-full' role='status' aria-label='Loading more tracks'>
                  {Array.from({ length: 3 }, (_, index) => <SkeletonTrack key={`more-skeleton-track-${index}`} />)}
                </div>
              }
              {hasMore &&
                <div aria-hidden='true' className='h-px w-full' ref={loadMoreRef} />
              }
            </div>
            :
            <div className='flex h-12 items-center'>
              No tracks found
            </div>
        }
      </div>
      <HelpModal
        audioFeatures={audioFeatures}
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        track={previewTrack ?? results?.at(0)}
      />
    </AppContext.Provider>
  );
}
