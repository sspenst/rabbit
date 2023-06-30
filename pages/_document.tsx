import Document, { DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript } from 'next/document';
import React from 'react';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);

    return { ...initialProps };
  }

  render() {
    return (
      <Html lang='en'>
        <Head>
          <link rel='manifest' href='/manifest.json' />
          <link rel='icon' href='/rabbit-48.png' />
          <link rel='apple-touch-icon' href='rabbit-180.png' />
          <meta name='theme-color' content='black' />
        </Head>
        <body className='bg-white dark:bg-black text-black dark:text-white'>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
export default MyDocument;
