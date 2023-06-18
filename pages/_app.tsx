import '../styles/global.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={''} style={{
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
      <Component {...pageProps} />
    </main>
  );
}
