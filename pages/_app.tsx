import '../styles/global.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Footer from '../components/footer';
import Header from '../components/header';
import { MainContext } from '../contexts/mainContext';
import { User } from '../helpers/spotifyParsers';

export default function App({ Component, pageProps }: AppProps) {
  const [user, setUser] = useState<User | null>();

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js');
    }
  }, []);

  return (
    <MainContext.Provider value={{
      setUser: setUser,
      user: user,
    }}>
      <Head>
        <title>Rabbit</title>
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
        minHeight: 'calc(100 * 1svh - 48px)',
      }}>
        <Component {...pageProps} />
      </main>
      <Footer />
    </MainContext.Provider>
  );
}
