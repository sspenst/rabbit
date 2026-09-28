import '../styles/global.css';
import { SpotifyApi, User } from '@sspenst/spotify-web-api';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ThemeProvider } from 'next-themes';
import React, { useEffect, useRef, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from '../components/header';
import { MainContext } from '../contexts/mainContext';

const spotifyClientId = 'a16d23f0a5e34c73b8719bd006b90464';
const spotifyScopes = ['user-library-read', 'user-library-modify'];

export default function App({ Component, pageProps }: AppProps) {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const spotifyAuthApi = useRef<SpotifyApi | undefined>(undefined);
  const [spotifyApi, setSpotifyApi] = useState<SpotifyApi | null>();
  const [user, setUser] = useState<User>();

  function logOut() {
    router.push('/').then(() => {
      spotifyAuthApi.current?.logOut();
      setSpotifyApi(null);
      setUser(undefined);
    });
  }

  function signIn() {
    sessionStorage.setItem('rabbit:sign-in-return', router.asPath);
    void spotifyAuthApi.current?.authenticate();
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const redirectUri = `${location.protocol}//${location.host}/`;
    const api = SpotifyApi.withUserAuthorization(spotifyClientId, redirectUri, spotifyScopes);

    spotifyAuthApi.current = api;

    async function restoreSession() {
      try {
        const isAuthorizationCallback = Boolean(router.query.code);
        const accessToken = isAuthorizationCallback ?
          (await api.authenticate()).accessToken :
          await api.getAccessToken();

        setSpotifyApi(accessToken ? api : null);

        if (accessToken && isAuthorizationCallback) {
          const returnPath = sessionStorage.getItem('rabbit:sign-in-return');

          sessionStorage.removeItem('rabbit:sign-in-return');

          if (returnPath?.startsWith('/') && !returnPath.startsWith('//')) {
            await router.replace(returnPath, undefined, { shallow: true });
          }
        }
      } catch (error) {
        console.error('Spotify authentication failed', error);
        setSpotifyApi(null);
      }
    }

    void restoreSession();
  }, [router, router.isReady, router.query.code]);

  return (
    <ThemeProvider attribute='class' enableSystem>
      <MainContext.Provider value={{
        isHelpModalOpen: isHelpModalOpen,
        logOut: logOut,
        mounted: mounted,
        setIsHelpModalOpen: setIsHelpModalOpen,
        setSpotifyApi: setSpotifyApi,
        setUser: setUser,
        signIn: signIn,
        spotifyApi: spotifyApi,
        user: user,
      }}>
        <Head>
          <title>Rabbit</title>
          <meta name='description' content='Discover new tracks using Spotify&apos;s audio features' />
        </Head>
        <Toaster position='bottom-center' toastOptions={{
          icon: null,
          style: {
            backgroundColor: 'rgb(59 130 246)',
            borderRadius: '0.75rem',
            color: 'white',
            paddingLeft: '20px',
            paddingRight: '20px',
          },
        }} />
        <Header />
        <main style={{ minHeight: router.pathname === '/' ? 'calc(100svh - 48px)' : undefined }}>
          <Component {...pageProps} />
        </main>
      </MainContext.Provider>
    </ThemeProvider>
  );
}
