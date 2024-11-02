/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '177.234.196.99',
        port: '8089',
        pathname: '/images/**',
      },
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig