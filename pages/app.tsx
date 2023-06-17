import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import FeatureControlComponent, { FeatureControl, FeatureControlState } from '../components/featureControl';
import Footer from '../components/footer';
import FormattedTrack from '../components/formattedTrack';
import HelpModal from '../components/helpModal';
import Profile from '../components/profile';
import { AppContext } from '../contexts/appContext';
import { loadTokens, redirectToAuthCodeFlow, removeTokens, spotifyFetch } from '../helpers/authCodeWithPkce';
import { parseTracks, parseUser, Track, User } from '../helpers/spotifyParsers';

export default function App() {
  const [disableGetTracks, setDisableGetTracks] = useState(false);
  const [featureControls, setFeatureControls] = useState<FeatureControl[]>([
    { property: 'tempo', state: FeatureControlState.NONE },
    { property: 'loudness', state: FeatureControlState.NONE },
    { property: 'danceability', state: FeatureControlState.NONE },
    { property: 'energy', state: FeatureControlState.NONE },
    { property: 'instrumentalness', state: FeatureControlState.NONE },
    { property: 'valence', state: FeatureControlState.NONE },
  ]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const limit = 20;
  const [savingTrackId, setSavingTrackId] = useState<string>();
  const [myTracksPage, setMyTracksPage] = useState(0);
  const [previewTrack, setPreviewTrack] = useState<Track>();
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const router = useRouter();
  const [showMyTracks, setShowMyTracks] = useState(true);
  const [user, setUser] = useState<User | null>();

  async function loadMyTracks(page: number) {
    setDisableGetTracks(true);

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

    if (!myTracks.length) {
      // if there are no tracks, we have probably reached the end of the user's saved tracks
      // load again from the beginning
      loadMyTracks(0);
    } else {
      setMyTracksPage(page);
      setRecommendations(myTracks);
      setDisableGetTracks(false);
    }
  }

  useEffect(() => {
    async function initializePageData() {
      const user = await spotifyFetch('https://api.spotify.com/v1/me', {
        method: 'GET',
      });

      setUser(parseUser(user));

      await loadMyTracks(0);
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
      loadTokens(router.query.code as string).then(async () => await initializePageData());
    }

    // remove code from the url query for clean aesthetic
    router.replace('/app', undefined, { shallow: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);

  useEffect(() => {
    function exit() {
      if (previewTrack) {
        previewTrack.preview.pause();
      }
    }

    router.events.on('routeChangeStart', exit);

    return () => {
      router.events.off('routeChangeStart', exit);
    };
  }, [previewTrack, router]);

  function logOut() {
    removeTokens();
    router.push('/');
  }

  async function getRecommendations() {
    if (!previewTrack) {
      return;
    }

    setDisableGetTracks(true);

    const features: Record<string, string> = {};

    featureControls.forEach(f => {
      if (f.state === FeatureControlState.UP) {
        features[`min_${f.property}`] = previewTrack.features[f.property];
      } else if (f.state === FeatureControlState.DOWN) {
        features[`max_${f.property}`] = previewTrack.features[f.property];
      }
    });

    const recommendations = await spotifyFetch(`https://api.spotify.com/v1/recommendations?${new URLSearchParams({
      limit: String(limit),
      seed_artists: previewTrack.artists.map(a => a.id).slice(0, 5).join(','),
      seed_genres: previewTrack.genres.slice(0, 5).join(','),
      seed_tracks: previewTrack.id,
      ...features,
    })}`, {
      method: 'GET',
    });

    const newRecommnedations = await parseTracks(recommendations?.tracks);

    // we always want previewTrack to be at the start of the recommendation list,
    // but we don't want any duplicates, so remove the track if it exists before unshifting it
    const index = newRecommnedations.findIndex(t => t.id === previewTrack.id);

    if (index !== -1) {
      newRecommnedations.splice(index, 1);
    }

    newRecommnedations.unshift({ ...previewTrack });

    setRecommendations(newRecommnedations);
    setDisableGetTracks(false);
    setShowMyTracks(false);
  }

  async function saveTrack(track: Track) {
    setSavingTrackId(track.id);

    await spotifyFetch(`https://api.spotify.com/v1/me/tracks?${new URLSearchParams({
      ids: track.id,
    })}`, {
      method: track.saved ? 'DELETE' : 'PUT',
    });

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
      <div className='flex items-center mx-2 mt-2 gap-2 h-10'>
        <Link href='/'>
          <Image alt='ss' src='/ss.svg' width={512} height={512} priority={true} className='w-8 h-8 mx-2' style={{
            minHeight: 32,
            minWidth: 32,
          }} />
        </Link>
        <span className='grow font-medium text-2xl truncate'>
          Rabbit
        </span>
        <Profile user={user} />
      </div>
      <div className='sticky top-0 p-2 bg-black'>
        <div className='bg-neutral-900 rounded-md px-2 pt-2 pb-1 flex flex-col gap-1'>
          <div className='flex justify-center w-full'>
            {!previewTrack ?
              <span className='flex items-center justify-center w-full rounded-md text-md h-14'>
                Select a track to begin
              </span>
              :
              <div className='flex items-center w-full hover:bg-neutral-700 transition py-1 pr-4 pl-2 gap-4 rounded-md h-14'>
                <FormattedTrack track={previewTrack} />
              </div>
            }
          </div>
          <div className='flex w-full gap-3 px-1 items-center'>
            <div className='flex gap-1 grow flex-wrap'>
              {featureControls.map(featureControl => (
                <FeatureControlComponent
                  featureControl={featureControl}
                  key={featureControl.property}
                  rotateState={() => setFeatureControls(prevFeatureControls => {
                    const newFeatureControls = [...prevFeatureControls];

                    const featureControlToRotate = newFeatureControls.find(f => f.property === featureControl.property);

                    if (featureControlToRotate) {
                      featureControlToRotate.state = (featureControlToRotate.state + 1) % 3;
                    }

                    return newFeatureControls;
                  })}
                  track={previewTrack}
                />
              ))}
            </div>
            <button className='text-neutral-400 hover:bg-neutral-700 rounded-full -mx-1' onClick={() => setIsHelpModalOpen(true)}>
              <svg className='w-8 h-8' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M12 17V16.9929M12 14.8571C12 11.6429 15 12.3571 15 9.85714C15 8.27919 13.6568 7 12 7C10.6567 7 9.51961 7.84083 9.13733 9' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
              </svg>
            </button>
            <button
              className='bg-green-500 disabled:bg-neutral-500 text-black p-3 text-2xl rounded-full enabled:hover:bg-green-300 transition'
              disabled={disableGetTracks || !previewTrack}
              onClick={async () => await getRecommendations()}
            >
              <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {recommendations.length ?
        <div className='flex flex-col items-center text-center w-full px-2 pb-2'>
          {recommendations.map(track => (
            <div className='w-full hover:bg-neutral-700 transition py-1 pr-4 pl-2 rounded-md' key={`recommended-track-${track.id}`}>
              <FormattedTrack track={track} />
            </div>
          ))}
          {showMyTracks &&
            <div className='flex gap-3 mt-2'>
              <button
                className='bg-green-500 disabled:bg-neutral-500 text-black p-3 text-2xl rounded-full enabled:hover:bg-green-300 transition'
                disabled={disableGetTracks || !myTracksPage}
                onClick={async () => {
                  await loadMyTracks(myTracksPage - 1);
                }}
              >
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18' />
                </svg>
              </button>
              <button
                className='bg-green-500 disabled:bg-neutral-500 text-black p-3 text-2xl rounded-full enabled:hover:bg-green-300 transition'
                disabled={disableGetTracks}
                onClick={async () => {
                  await loadMyTracks(myTracksPage + 1);
                }}
              >
                <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={1.5} stroke='currentColor' className='w-6 h-6'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3' />
                </svg>
              </button>
            </div>
          }
        </div>
        :
        <div className='flex justify-center'>
          <Image alt='loading' src='/puff.svg' width='48' height='48' />
        </div>
      }
      <Footer />
      <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
    </AppContext.Provider>
  );
}
