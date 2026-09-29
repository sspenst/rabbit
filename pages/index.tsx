import { AudioFeatures, RecommendationsRequest, Track } from '@sspenst/spotify-web-api';
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
import { EnrichedTrack, EnrichedTrackData, enrichTracks, hydrateRecommendations, hydrateTracks } from '../helpers/enrichTrack';

// 50 is the highest limit that works for all endpoints. Recommendations can go
// up to 100, but then liked-song lookups would need to be batched.
const searchLimit = 50;

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
  const router = useRouter();
  const [savingTrackId, setSavingTrackId] = useState<string>();
  const [search, setSearch] = useState('');
  const [searchError, setSearchError] = useState<string>();
  const [hasMore, setHasMore] = useState(true);
  const isSearchingRef = useRef(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const searchGeneration = useRef(0);
  const searchOffset = useRef(0);

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

        const page = await spotifyApi.currentUser.tracks.savedTracks(searchLimit, offset);
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

      searchOffset.current = offset + searchLimit;

      setResults(prevTracks => {
        const mergedTracks = append && prevTracks ? [...prevTracks, ...tracks] : tracks;

        return Array.from(new Map(mergedTracks.map(track => [track.id, track])).values());
      });

      setHasMore(moreTracksAvailable);
    } catch (error) {
      if (generation === searchGeneration.current) {
        setResults([]);
        setHasMore(false);
        setSearchError(error instanceof Error ? error.message : 'Spotify search is temporarily unavailable.');
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

    setAudioFeatures(newAudioFeatures);

    const id = router.query.id as string;

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
        const newRecommendations = hydrateRecommendations(body.tracks, previewTrack);

        setPreviewTrack(newRecommendations[0]);
        setResults(newRecommendations);

        return;
      }

      let track: EnrichedTrack;

      if (previewTrack?.id !== id) {
        setPreviewTrack(undefined);

        const trackById = await spotifyApi.tracks.get(id);

        if (!trackById) {
          await router.push('/', undefined, { shallow: true });

          return;
        }

        track = (await enrichTracks([trackById], spotifyApi))[0];
        setPreviewTrack(track);
      } else {
        track = previewTrack;
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

  // Initialize the page after both the route and optional user session are known.
  useEffect(() => {
    if (!router.isReady || spotifyApi === undefined) {
      return;
    }

    let cancelled = false;

    if (spotifyApi && user === undefined) {
      void spotifyApi.currentUser.profile().then(profile => {
        if (!cancelled) {
          setUser(profile);
        }
      });
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearch('');
    setResults(undefined);

    if (router.query.id) {
      void getRecommendations();
    } else {
      resetAudioFeatures();
      setPreviewTrack(null);
      void searchTracks();
    }

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, spotifyApi]);

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
                          router.push('/', undefined, { shallow: true });
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

                router.push(`/?${new URLSearchParams({
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
          searchError ?
            <div className='flex h-12 items-center px-4 text-center text-red-500'>
              {searchError}
            </div>
            : results.length ?
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
              spotifyApi === null && !search ?
                <div className='flex flex-col items-center gap-4 px-8 py-14 text-center'>
                  <p className='text-neutral-600 dark:text-neutral-400'>
                    Sign in to browse your Liked Songs and save new discoveries to Spotify.
                  </p>
                  <button
                    className='rounded-full bg-green-500 px-6 py-2 font-medium text-black transition hover:bg-green-300'
                    onClick={signIn}
                  >
                    Sign in with Spotify
                  </button>
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
