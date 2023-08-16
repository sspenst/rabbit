import '../styles/global.css';
import { SpotifyApi, User } from '@spotify/web-api-ts-sdk';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ThemeProvider } from 'next-themes';
import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Footer from '../components/footer';
import Header from '../components/header';
import { MainContext } from '../contexts/mainContext';

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const [spotifyApi, setSpotifyApi] = useState<SpotifyApi | null>();
  const [user, setUser] = useState<User>();

  function logOut() {
    router.push('/').then(() => {
      spotifyApi?.logOut();
      setSpotifyApi(undefined);
      setUser(undefined);
    });
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <ThemeProvider attribute='class'>
      <MainContext.Provider value={{
        logOut: logOut,
        mounted: mounted,
        setSpotifyApi: setSpotifyApi,
        setUser: setUser,
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
        <main style={{
          minHeight: 'calc(100svh - 48px)',
        }}>
          <Component {...pageProps} />
        </main>
        <Footer />
      </MainContext.Provider>
    </ThemeProvider>
  );
}
