import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import AudioFeatureComponent, { AudioFeature, AudioFeatureState } from '../components/audioFeature';
import Footer from '../components/footer';
import HelpModal from '../components/helpModal';
import Profile from '../components/profile';
import SkeletonTrack from '../components/skeletonTrack';
import TrackComponent from '../components/trackComponent';
import { AppContext } from '../contexts/appContext';
import { loadTokens, redirectToAuthCodeFlow, removeTokens, spotifyFetch } from '../helpers/authCodeWithPkce';
import { parseTracks, parseUser, Track, User } from '../helpers/spotifyParsers';

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
  const limit = 20;
  const myTracksPage = useRef(0);
  const [previewTrack, setPreviewTrack] = useState<Track | null>();
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const router = useRouter();
  const [savingTrackId, setSavingTrackId] = useState<string>();
  const [showMore, setShowMore] = useState(true);
  const [user, setUser] = useState<User | null>();

  async function loadMyTracks(page: number) {
    setIsSearching(true);

    const tracks = await spotifyFetch(`https://api.spotify.com/v1/me/tracks?${new URLSearchParams({
      limit: String(limit),
      offset: String(page * limit),
    })}`, {
      method: 'GET',
    });

    if (!tracks) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const myTracks = await parseTracks(tracks.items.map((i: any) => i.track));

    if (myTracks.length) {
      setRecommendations(prevTracks => [...prevTracks].concat(myTracks));
    }

    myTracksPage.current = page;
    setShowMore(!!myTracks.length);
    setIsSearching(false);
  }

  function resetAudioFeatures() {
    setAudioFeatures(prevAudioFeatures => {
      const newAudioFeatures = [...prevAudioFeatures];

      newAudioFeatures.forEach(f => f.state = AudioFeatureState.NONE);

      return newAudioFeatures;
    });
  }

  useEffect(() => {
    async function initializePageData() {
      const user = await spotifyFetch('https://api.spotify.com/v1/me', {
        method: 'GET',
      });

      setUser(parseUser(user));

      if (router.query.id) {
        await getRecommendations();
      } else {
        resetAudioFeatures();
        setPreviewTrack(null);
        await loadMyTracks(0);
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

  useEffect(() => {
    function getRouteId(route: string) {
      if (!route.includes('?')) {
        return null;
      }

      const params = new URLSearchParams(route.split('?')[1]);

      return params.get('id');
    }

    function pausePreviewTrack(route: string) {
      setIsSearching(true);

      // if the preview track changes, we must pause the audio
      if (previewTrack && getRouteId(route) !== previewTrack.id) {
        previewTrack.preview.pause();

        // clear the preview track if it is going to be replaced
        if (route.startsWith('/app')) {
          resetAudioFeatures();
          setPreviewTrack(undefined);
        }
      }

      // clear the recommendations if they are going to be replaced
      if (route.startsWith('/app')) {
        setRecommendations([]);
      }
    }

    router.events.on('routeChangeStart', pausePreviewTrack);

    return () => {
      router.events.off('routeChangeStart', pausePreviewTrack);
    };
  }, [previewTrack, router]);

  useEffect(() => {
    function pause(event: KeyboardEvent) {
      const { code } = event;

      if (code === 'KeyP' && previewTrack) {
        if (previewTrack.preview.paused) {
          previewTrack.preview.play().then(() => setPreviewTrack({ ...previewTrack }));
        } else {
          previewTrack.preview.pause();
          setPreviewTrack({ ...previewTrack });
        }
      }
    }

    document.addEventListener('keydown', pause);

    return () => {
      document.removeEventListener('keydown', pause);
    };
  }, [previewTrack]);

  function logOut() {
    removeTokens();
    router.push('/');
  }

  async function getRecommendations() {
    function getQueryParamState(property: string) {
      switch (router.query[property]) {
      case 'up':
        return AudioFeatureState.UP;
      case 'down':
        return AudioFeatureState.DOWN;
      default:
        return AudioFeatureState.NONE;
      }
    }

    const newAudioFeatures: AudioFeature[] = [];

    for (const audioFeature of audioFeatures) {
      newAudioFeatures.push({
        property: audioFeature.property,
        state: getQueryParamState(audioFeature.property),
      });
    }

    setAudioFeatures(newAudioFeatures);

    const id = router.query.id as string;
    let track: Track;

    if (previewTrack?.id !== id) {
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
      }
    });

    // NB: market is inferred from the access token, so we don't need to specify it here
    // maximum of 5 seed values are allowed: use the track id and up to 4 artists
    const recommendations = await spotifyFetch(`https://api.spotify.com/v1/recommendations?${new URLSearchParams({
      limit: String(limit),
      seed_artists: track.artists.map(a => a.id).slice(0, 4).join(','),
      seed_tracks: track.id,
      ...audioFeatureParams,
    })}`, {
      method: 'GET',
    });

    const newRecommnedations = await parseTracks(recommendations?.tracks);

    // we always want previewTrack to be at the start of the recommendation list,
    // but we don't want any duplicates, so remove the track if it exists before unshifting it
    const index = newRecommnedations.findIndex(t => t.id === track.id);

    if (index !== -1) {
      newRecommnedations.splice(index, 1);
    }

    newRecommnedations.unshift({ ...track });

    setRecommendations(newRecommnedations);
    setIsSearching(false);
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
    toast.success(`${track.saved ? 'Removed from' : 'Added to'} Liked Songs`);

    if (track.id === previewTrack?.id) {
      setPreviewTrack(prevTrack => {
        const newTrack = { ...prevTrack } as Track;

        newTrack.saved = !newTrack.saved;

        return newTrack;
      });
    }

    const index = recommendations.findIndex(t => t.id === track.id);

    if (index !== -1) {
      setRecommendations(prevTracks => {
        const newTracks = [...prevTracks];

        newTracks[index].saved = !newTracks[index].saved;

        return newTracks;
      });
    }

    setSavingTrackId(undefined);
  }

  if (user === null) {
    return (
      <div className='flex inset-0 fixed text-center items-center p-4'>
        <p className='w-full'>
          {'An unexpected error occurred! Try '}
          <button
            className='text-blue-300'
            onClick={logOut}
          >
            logging out
          </button>
          {' or '}
          <a
            className='text-blue-300'
            href='mailto:spencerspenst@gmail.com'
            rel='noreferrer'
            target='_blank'
          >
            contact me
          </a>
          {' if you are still having issues.'}
        </p>
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
      {previewTrack && !previewTrack.preview.paused &&
        <Head>
          <title>{previewTrack.name} by {previewTrack.artists.map(a => a.name).join(', ')}</title>
        </Head>
      }
      <div className='flex items-center mr-2 ml-4 mt-2 gap-4 h-10'>
        <Link href='/'>
          <Image alt='ss' src='/ss.svg' width={512} height={512} priority={true} className='w-8 h-8' style={{
            minHeight: 32,
            minWidth: 32,
          }} />
        </Link>
        <a
          className='w-7 h-7'
          href='https://open.spotify.com/'
          rel='noreferrer'
          style={{
            minHeight: 28,
            minWidth: 28,
          }}
          target='_blank'
        >
          <Image alt='spotify-icon' src='/spotify_icon.png' width={512} height={512} priority={true} className='w-7 h-7' style={{
            minHeight: 28,
            minWidth: 28,
          }} />
        </a>
        <span className='grow font-medium text-2xl truncate ml-1'>
          Rabbit
        </span>
        <Profile user={user} />
      </div>
      <div className='sticky top-0 p-2 bg-black flex justify-center'>
        <div className='bg-neutral-900 rounded-md px-2 pt-2 pb-1 flex flex-col gap-1 max-w-full' style={{
          width: 768,
        }}>
          <div className='flex justify-center w-full'>
            {previewTrack === null ?
              <span className='flex items-center justify-center w-full rounded-md text-md h-14'>
                Select a track to begin
              </span>
              :
              <>
                {previewTrack ?
                  <div className='flex items-center w-full hover:bg-neutral-700 transition py-1 pr-4 pl-2 gap-4 rounded-md h-14'>
                    <TrackComponent track={previewTrack} />
                    <button onClick={() => {
                      if (router.query.id) {
                        router.push('/app', undefined, { shallow: true });
                      } else {
                        previewTrack.preview.pause();
                        resetAudioFeatures();
                        setPreviewTrack(null);
                      }
                    }}>
                      <svg className='text-neutral-500 hover:text-neutral-200 w-6 h-6 -mx-1 cursor-pointer' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor'>
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
              className='bg-green-500 disabled:bg-neutral-500 text-black p-3 rounded-full enabled:hover:bg-green-300 transition flex gap-2 font-medium'
              disabled={isSearching || !previewTrack}
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
              <span className='hidden md:block mr-1'>Search</span>
            </button>
            <div className='flex justify-center items-center'>
              <button
                className='text-neutral-400 hover:underline text-sm'
                onClick={() => setIsHelpModalOpen(true)}
              >
                Help
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className='flex justify-center'>
        {recommendations.length ?
          <div className='flex flex-col items-center text-center w-full px-2 max-w-3xl'>
            {recommendations.map(track => (
              <div className='w-full hover:bg-neutral-700 transition py-1 pr-4 pl-2 rounded-md' key={`recommended-track-${track.id}`}>
                <TrackComponent track={track} />
              </div>
            ))}
            {showMore &&
              <button
                className='px-8 py-2 rounded-full bg-green-500 transition text-black text-xl mt-2 disabled:bg-neutral-500 enabled:hover:bg-green-300 font-medium'
                disabled={isSearching}
                onClick={async () => await loadMyTracks(myTracksPage.current + 1)}
              >
                More
              </button>
            }
          </div>
          :
          <div className='flex flex-col w-full max-w-3xl px-2' style={{
            zIndex: -1,
          }}>
            {Array.from({ length: 20 }, (_, index) => <SkeletonTrack key={`skeleton-track-${index}`} />)}
          </div>
        }
      </div>
      <Footer />
      <HelpModal
        audioFeatures={audioFeatures}
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        track={previewTrack ?? recommendations.at(0)}
      />
    </AppContext.Provider>
  );
}
