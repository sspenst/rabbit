import { debounce } from 'debounce';
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
import { loadTokens, redirectToAuthCodeFlow, spotifyFetch } from '../helpers/authCodeWithPkce';
import { parseTracks, parseUser, Track } from '../helpers/spotifyParsers';

export default function App() {
  const [audioFeatures, setAudioFeatures] = useState<AudioFeature[]>([
    { property: 'tempo', state: AudioFeatureState.NONE },
    { property: 'loudness', state: AudioFeatureState.NONE },
    { property: 'danceability', state: AudioFeatureState.NONE },
    { property: 'energy', state: AudioFeatureState.NONE },
    { property: 'instrumentalness', state: AudioFeatureState.NONE },
    { property: 'valence', state: AudioFeatureState.NONE },
  ]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(true);
  const { logOut, setUser, user } = useContext(MainContext);
  const [previewTrack, setPreviewTrack] = useState<Track | null>();
  const [results, setResults] = useState<Track[]>();
  const router = useRouter();
  const [savingTrackId, setSavingTrackId] = useState<string>();
  const [search, setSearch] = useState('');
  const searchLimit = 20;
  const searchOffset = useRef(0);
  const [showMore, setShowMore] = useState(true);

  // get user's tracks or search for tracks with the current searchOffset
  async function getRawTracks(q: string) {
    if (!q) {
      const tracks = await spotifyFetch(`https://api.spotify.com/v1/me/tracks?${new URLSearchParams({
        limit: String(searchLimit),
        offset: String(searchOffset.current),
      })}`, {
        method: 'GET',
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return tracks?.items.map((i: any) => i.track);
    } else {
      const tracks = await spotifyFetch(`https://api.spotify.com/v1/search?${new URLSearchParams({
        limit: String(searchLimit),
        offset: String(searchOffset.current),
        q: q,
        type: 'track',
      })}`, {
        method: 'GET',
      });

      return tracks?.tracks.items;
    }
  }

  // search for tracks - only used on /app
  async function searchTracks(q = '', append = false) {
    setIsSearching(true);

    if (!append) {
      searchOffset.current = 0;
    }

    const tracks = await parseTracks(await getRawTracks(q));

    searchOffset.current += searchLimit;

    setResults(prevTracks => {
      if (!append || !prevTracks) {
        return tracks;
      } else {
        return [...prevTracks].concat(tracks);
      }
    });
    setShowMore(tracks.length === searchLimit);
    setIsSearching(false);
  }

  function resetAudioFeatures() {
    setAudioFeatures(prevAudioFeatures => {
      const newAudioFeatures = [...prevAudioFeatures];

      newAudioFeatures.forEach(f => f.state = AudioFeatureState.NONE);

      return newAudioFeatures;
    });
  }

  // initialize data when the route changes
  useEffect(() => {
    async function initializePageData() {
      // initialize user
      if (user === undefined) {
        setUser(parseUser(await spotifyFetch('https://api.spotify.com/v1/me', {
          method: 'GET',
        })));
      }

      // if the route changes we always need to reset search and get new results
      setSearch('');
      setResults(undefined);

      if (router.query.id) {
        await getRecommendations();
      } else {
        resetAudioFeatures();
        setPreviewTrack(null);
        await searchTracks();
      }
    }

    if (!router.isReady) {
      return;
    }

    // use existing accessToken if we have it, otherwise normal auth flow
    if (localStorage.getItem('accessToken')) {
      initializePageData();
    } else if (!router.query.code) {
      redirectToAuthCodeFlow();
    } else {
      loadTokens(router.query.code as string).then(() => {
        // clean up code query from the url
        // NB: causes this useEffect to rerun, which initializes the page data
        router.replace('/app', undefined, { shallow: true });
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

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

      if (code === 'KeyP' && previewTrack?.preview) {
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
    let track: Track;

    if (previewTrack?.id !== id) {
      setPreviewTrack(undefined);

      const trackById = await spotifyFetch(`https://api.spotify.com/v1/tracks/${id}`, {
        method: 'GET',
      });

      // invalid track id, go back to /app
      if (!trackById) {
        router.push('/app', undefined, { shallow: true });

        return;
      }

      track = (await parseTracks(new Array(trackById)))[0];

      setPreviewTrack(track);
    } else {
      track = previewTrack;
    }

    const audioFeatureParams: Record<string, string> = {};

    newAudioFeatures.forEach(f => {
      if (f.state === AudioFeatureState.UP) {
        audioFeatureParams[`min_${f.property}`] = track.audioFeatures[f.property];
      } else if (f.state === AudioFeatureState.DOWN) {
        audioFeatureParams[`max_${f.property}`] = track.audioFeatures[f.property];
      } else {
        audioFeatureParams[`target_${f.property}`] = track.audioFeatures[f.property];
      }
    });

    // NB: market is inferred from the access token, so we don't need to specify it here
    // maximum of 5 seed values are allowed: use the track id and up to 4 artists
    const recommendations = await spotifyFetch(`https://api.spotify.com/v1/recommendations?${new URLSearchParams({
      limit: String(searchLimit),
      seed_artists: track.artists.map(a => a.id).slice(0, 4).join(','),
      seed_tracks: track.id,
      ...audioFeatureParams,
    })}`, {
      method: 'GET',
    });

    const newRecommendations = await parseTracks(recommendations?.tracks);

    // we always want previewTrack to be at the start of the recommendation list,
    // but we don't want any duplicates, so remove the track if it exists before unshifting it
    const index = newRecommendations.findIndex(t => t.id === track.id);

    if (index !== -1) {
      newRecommendations.splice(index, 1);
    }

    newRecommendations.unshift({ ...track });

    setResults(newRecommendations);
    setShowMore(false);
  }

  async function saveTrack(track: Track) {
    setSavingTrackId(track.id);

    await spotifyFetch(`https://api.spotify.com/v1/me/tracks?${new URLSearchParams({
      ids: track.id,
    })}`, {
      method: track.saved ? 'DELETE' : 'PUT',
    });

    toast.dismiss();
    toast.success(track.saved ? 'Removed from Liked Songs' : 'Added to Liked Songs');

    setPreviewTrack(prevTrack => {
      if (track.id !== prevTrack?.id) {
        return prevTrack;
      }

      const newTrack = { ...prevTrack } as Track;

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debounceSearch = useCallback(debounce(async (q: string) => {
    await searchTracks(q);
  }, 300), []);

  if (user === null) {
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
          {' to resolve the issue.'}
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
        <div className='bg-neutral-100 dark:bg-neutral-900 rounded-md px-2 pt-2 pb-1 flex flex-col gap-1 max-w-full' style={{
          width: 768,
        }}>
          <div className='flex justify-center w-full'>
            {previewTrack === null ?
              <input
                autoFocus
                className='w-full rounded-md h-14 bg-neutral-100 dark:bg-neutral-900 text-4xl px-3'
                onChange={e => {
                  setSearch(e.target.value);
                  setResults(undefined);
                  debounceSearch(e.target.value);
                }}
                placeholder='Search'
                type='search'
                value={search}
              />
              :
              <>
                {previewTrack ?
                  <div className='flex items-center w-full hover:bg-neutral-300 hover:dark:bg-neutral-700 transition-[background-color] py-1 pr-4 pl-2 gap-4 rounded-md h-14'>
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
                      <svg className='text-neutral-500 hover:text-black hover:dark:text-white w-6 h-6 -mx-1 cursor-pointer' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
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
            <div className='flex justify-center items-center'>
              <button
                className='text-neutral-600 dark:text-neutral-400 hover:underline text-sm'
                onClick={() => setIsHelpModalOpen(true)}
              >
                Help
              </button>
            </div>
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
                <div className='w-full hover:bg-neutral-300 hover:dark:bg-neutral-700 transition-[background-color] py-1 pr-4 pl-2 rounded-md' key={`track-${track.id}`}>
                  <TrackComponent track={track} />
                </div>
              ))}
              {showMore &&
                <button
                  className='px-8 py-2 rounded-full bg-green-500 transition dark:text-black text-xl mt-2 disabled:bg-neutral-500 disabled:opacity-40 enabled:hover:bg-green-300 font-medium'
                  disabled={isSearching}
                  onClick={async () => await searchTracks(search, true)}
                >
                  More
                </button>
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
