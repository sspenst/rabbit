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
      <Toaster position='bottom-center' />
      <Component {...pageProps} />
    </main>
  );
}
