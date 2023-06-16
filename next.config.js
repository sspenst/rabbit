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
  swcMinify: true,
};

module.exports = nextConfig;
