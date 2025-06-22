import React from 'react';

export default function EndUserAgreement() {
  return (
    <div className='my-16 flex justify-center'>
      <div className='w-full max-w-(--breakpoint-md) flex flex-col gap-8'>
        <h1 className='font-medium text-3xl'>Privacy Policy</h1>
        <p>
        This Privacy Policy (&apos;Policy&apos;) describes how Rabbit collects, uses, and shares information when you use Rabbit. By using Rabbit, you agree to the terms of this Policy.
        </p>
        <p>
Information Collection: Rabbit uses third-party services that may collect information to identify you. Per GDPR requirements, and for transparency, our third party data sub-processors are:
        </p>
        <p>
          <a className='text-blue-500 hover:text-blue-300 transition' href='https://cloudflare.com' target='_blank' rel='noreferrer'>Cloudflare</a> - DNS
          <br />
          <a className='text-blue-500 hover:text-blue-300 transition' href='https://sentry.io' target='_blank' rel='noreferrer'>Sentry</a> - Application performance monitoring and error tracking
          <br />
          <a className='text-blue-500 hover:text-blue-300 transition' href='https://vercel.com' target='_blank' rel='noreferrer'>Vercel</a> - Web hosting
        </p>
        <p>
Contact Rabbit: If you have any questions, concerns, or inquiries regarding this Policy or your personal information, please contact Rabbit at spencerspenst@gmail.com.
        </p>
        <p>
This Policy is currently effective. Rabbit may update or modify this Policy from time to time, and any changes will be posted on this page with a revised &apos;Last Updated&apos; date. Rabbit encourages you to review this Policy periodically.
        </p>
        <p>
By using Rabbit, you acknowledge that you have read, understood, and agree to the terms of this Policy.
        </p>
        <p className='text-sm text-neutral-500'>
        Last Updated: June 14, 2024
        </p>
      </div>
    </div>
  );
}
