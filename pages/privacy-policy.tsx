import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

const linkClassName = 'text-blue-500 transition hover:text-blue-300 hover:underline';
const sectionClassName = 'flex flex-col gap-3';

export default function PrivacyPolicy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | Rabbit</title>
        <meta name='description' content='How Rabbit accesses, uses, and protects information.' />
      </Head>
      <div className='my-16 flex justify-center px-6'>
        <article className='flex w-full max-w-(--breakpoint-md) flex-col gap-8 leading-7'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-3xl font-medium'>Privacy Policy</h1>
            <p className='text-sm text-neutral-500'>Effective September 28, 2026</p>
          </div>

          <p>
            Rabbit is a music-discovery application operated by Spencer Spenst. This policy explains what information Rabbit accesses, how it is used and shared, and the choices available to you. Rabbit is an independent application and is not endorsed by Spotify.
          </p>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Information Rabbit accesses</h2>
            <p>When you use Rabbit without connecting Spotify, Rabbit processes your searches, selected tracks, recommendation settings, and the Spotify catalog information needed to return results.</p>
            <p>When you connect your Spotify account, Rabbit requests permission to:</p>
            <ul className='list-disc space-y-2 pl-6'>
              <li>read your Liked Songs and whether displayed tracks are saved;</li>
              <li>add tracks to, or remove tracks from, your Liked Songs when you request that action; and</li>
              <li>read basic Spotify profile information, such as your display name, profile image, and Spotify profile link, to display your connected account.</li>
            </ul>
            <p>Rabbit does not receive your Spotify password. Spotify handles authentication and tells you which permissions Rabbit is requesting before you authorize access.</p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Technical and diagnostic information</h2>
            <p>
              Rabbit&apos;s hosting, security, and error-monitoring services may process technical information such as your IP address, browser and device type, requested pages, timestamps, performance measurements, and error details. Rabbit uses Sentry to diagnose errors, monitor performance, and sample session replays. Replay text is masked and media is blocked, but replays may still show interactions and page structure.
            </p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>How information is used</h2>
            <p>Rabbit uses information only to provide the features you request, authenticate your Spotify connection, show and manage Liked Songs, generate recommendations, remember preferences, keep the service secure, and diagnose or improve reliability. Rabbit does not sell your personal information or use Spotify data for advertising.</p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Browser storage and cookies</h2>
            <p>
              Rabbit uses local storage and session storage in your browser to keep Spotify authorization credentials, remember your theme, and return you to the appropriate page after sign-in. Rabbit does not currently set its own cookies or allow third parties to place advertising cookies on Rabbit or track your activity across unrelated services. Rabbit&apos;s service providers may use cookies or similar storage strictly to host, secure, and monitor Rabbit. Spotify may use cookies when you visit its authorization pages under Spotify&apos;s own privacy policy.
            </p>
            <p>You can clear Rabbit&apos;s browser storage using your browser settings, although doing so will sign you out and reset saved preferences. Browser controls can also block cookies on third-party sites.</p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Service providers and disclosures</h2>
            <p>Rabbit shares information only as needed with these services or when required by law:</p>
            <ul className='list-disc space-y-2 pl-6'>
              <li><a className={linkClassName} href='https://www.spotify.com/legal/privacy-policy/' rel='noreferrer' target='_blank'>Spotify</a>, which supplies catalog and account data and performs requested library changes;</li>
              <li><a className={linkClassName} href='https://vercel.com/legal/privacy-policy' rel='noreferrer' target='_blank'>Vercel</a>, which hosts Rabbit;</li>
              <li><a className={linkClassName} href='https://sentry.io/privacy/' rel='noreferrer' target='_blank'>Sentry</a>, which provides error, performance, and replay monitoring; and</li>
              <li><a className={linkClassName} href='https://www.cloudflare.com/privacypolicy/' rel='noreferrer' target='_blank'>Cloudflare</a>, which provides domain and network services.</li>
            </ul>
            <p>These providers may process information in countries other than your own under their respective terms and privacy practices.</p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Storage and retention</h2>
            <p>
              Rabbit does not maintain a user-account database. Spotify profile and music-library information is requested as needed and held in the application while you use it. Spotify authorization credentials remain in your browser until they expire, can no longer be refreshed, or you log out. Diagnostic information is retained only as long as reasonably necessary to investigate errors, maintain security, and operate Rabbit, subject to the service providers&apos; retention settings.
            </p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Your choices and control</h2>
            <p>
              You can disconnect Rabbit by selecting <span className='font-medium'>Logout</span> in Rabbit, which clears locally stored Spotify authorization credentials and stops Rabbit from requesting account data. To revoke Rabbit&apos;s authorization at Spotify as well, remove Rabbit from your{' '}
              <a className={linkClassName} href='https://www.spotify.com/account/apps/' rel='noreferrer' target='_blank'>Spotify Apps page</a>.
            </p>
            <p>
              You may ask what personal information Rabbit holds, request correction or deletion, or raise a privacy concern by emailing{' '}
              <a className={linkClassName} href='mailto:spencerspenst@gmail.com'>spencerspenst@gmail.com</a>. Because Rabbit has no user database, most Spotify information disappears from Rabbit when you disconnect or close the application. Requests involving Spotify&apos;s own records must be directed to Spotify.
            </p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Children</h2>
            <p>Rabbit is not directed to children and must not be used by anyone who is not old enough to consent to the processing of their personal information in their country. If you believe a child has provided information through Rabbit, please contact the address above.</p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Changes to this policy</h2>
            <p>Rabbit may update this policy when its features, providers, or legal obligations change. The effective date above will be updated when changes are published. Material changes will be presented to connected users when appropriate.</p>
          </section>

          <p className='border-t border-neutral-200 pt-6 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400'>
            See also Rabbit&apos;s <Link className={linkClassName} href='/end-user-agreement'>End User Agreement</Link>.
          </p>
        </article>
      </div>
    </>
  );
}
