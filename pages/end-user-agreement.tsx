import Head from 'next/head';
import Link from 'next/link';
import React from 'react';

const linkClassName = 'text-blue-500 transition hover:text-blue-300 hover:underline';
const sectionClassName = 'flex flex-col gap-3';

export default function EndUserAgreement() {
  return (
    <>
      <Head>
        <title>End User Agreement | Rabbit</title>
        <meta name='description' content='Terms governing your use of Rabbit.' />
      </Head>
      <div className='my-16 flex justify-center px-6'>
        <article className='flex w-full max-w-(--breakpoint-md) flex-col gap-8 leading-7'>
          <div className='flex flex-col gap-2'>
            <h1 className='text-3xl font-medium'>End User Agreement</h1>
            <p className='text-sm text-neutral-500'>Effective September 28, 2026</p>
          </div>

          <p>
            This End User Agreement (&apos;Agreement&apos;) is between you and Spencer Spenst, the operator of Rabbit. It governs your use of the Rabbit website and its Spotify-connected features. By signing in to Spotify through Rabbit, or by otherwise using Rabbit, you agree to this Agreement. If you do not agree, do not use Rabbit.
          </p>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Rabbit and Spotify</h2>
            <p>Rabbit is an independent music-discovery application. Rabbit is not Spotify, is not endorsed by Spotify, and does not grant you any rights in the Spotify Platform, Spotify Service, or Spotify Content. Your use of Spotify remains subject to Spotify&apos;s own terms and policies.</p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Permitted use</h2>
            <p>You may use Rabbit only for personal, non-commercial music discovery and only in compliance with applicable law, this Agreement, Spotify&apos;s applicable terms, and the rights of artists and other rights holders. You must not misuse Rabbit, interfere with its operation, circumvent access controls, scrape or automate requests to the service, or use Rabbit to infringe another person&apos;s rights.</p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Spotify platform restrictions</h2>
            <p>
              To the fullest extent permitted by law, you must not modify, edit, alter, create derivative works from, disassemble, decompile, reverse-engineer, or otherwise reduce to source code or another human-perceivable form any part of the Spotify Platform, Spotify Service, or Spotify Content. You must not copy, redistribute, transfer, or make Spotify Content available except as Spotify expressly permits.
            </p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Your Spotify account</h2>
            <p>You choose whether to connect Spotify and which requested permissions to grant. You are responsible for activity initiated through your device and Spotify account. You may disconnect at any time using Rabbit&apos;s Logout control and may fully revoke authorization from your Spotify account&apos;s Apps page.</p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Availability and changes</h2>
            <p>Rabbit and its features may change, become unavailable, or stop working because of maintenance, technical problems, changes to Spotify&apos;s services, or other circumstances. Rabbit may suspend access when reasonably necessary to protect the service, users, Spotify, or third parties, or to comply with law or platform requirements.</p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Disclaimers</h2>
            <p>
              Rabbit is provided on an &apos;as is&apos; and &apos;as available&apos; basis to the fullest extent permitted by law. Rabbit makes no guarantee that recommendations, metadata, previews, or other information will be accurate, complete, reliable, or continuously available.
            </p>
            <p>
              Rabbit does not make any warranty or representation on Spotify&apos;s behalf. All implied warranties regarding the Spotify Platform, Spotify Service, and Spotify Content—including merchantability, fitness for a particular purpose, and non-infringement—are expressly disclaimed to the fullest extent permitted by law.
            </p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Responsibility and liability</h2>
            <p>Rabbit, not Spotify, is responsible for Rabbit. Spotify and other third parties are not responsible or liable for Rabbit, its operation, its content, or claims arising from your use of Rabbit. Nothing in this Agreement excludes liability that cannot legally be excluded.</p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Spotify as a third-party beneficiary</h2>
            <p>Spotify is a third-party beneficiary of this Agreement and Rabbit&apos;s Privacy Policy. Spotify is entitled to directly enforce this Agreement.</p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Privacy</h2>
            <p>Rabbit&apos;s <Link className={linkClassName} href='/privacy-policy'>Privacy Policy</Link> explains how Rabbit accesses, uses, shares, retains, and deletes information. It forms part of the terms governing your use of Rabbit.</p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>General terms</h2>
            <p>This Agreement is governed by the applicable laws of Canada, without regard to conflict-of-law principles. If any provision is unenforceable, the remaining provisions continue in effect. Failure to enforce a provision is not a waiver. This Agreement and the Privacy Policy are the entire agreement between you and Rabbit concerning Rabbit.</p>
          </section>

          <section className={sectionClassName}>
            <h2 className='text-xl font-medium'>Changes and contact</h2>
            <p>Rabbit may update this Agreement when its service or obligations change. The effective date above will be updated, and notice of material changes will be provided when appropriate. Questions may be sent to <a className={linkClassName} href='mailto:spencerspenst@gmail.com'>spencerspenst@gmail.com</a>.</p>
          </section>
        </article>
      </div>
    </>
  );
}
