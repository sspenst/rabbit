import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: 'i.scdn.co',
        pathname: '/image/*',
        protocol: 'https',
      },
    ],
    // https://vercel.com/docs/concepts/image-optimization/managing-image-optimization-costs#how-to-minimize-image-optimization-costs
    // to avoid hitting the image optimization limit on vercel's free tier
    unoptimized: true,
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options
  org: 'sspenst',
  project: 'rabbit',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // sentry automatically turns on productionBrowserSourceMaps unless you do this
  sourcemaps: {
    disable: true,
  },

  webpack: {
    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
    // Automatically tree-shake Sentry logger statements to reduce bundle size
    treeshake: {
      removeDebugLogging: true,
    },
  },

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,
});
