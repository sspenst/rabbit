import '../styles/global.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import React from 'react';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={''} style={{
    }}>
      <Head>
        <title>Rabbit</title>
      </Head>
      <Component {...pageProps} />
    </main>
  );
}
