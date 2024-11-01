/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['https://177.234.196.99:8089'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://177.234.196.99:8089/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig