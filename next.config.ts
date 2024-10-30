/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['192.168.100.59'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://192.168.100.59:8081/api/:path*',
      },
    ];
  },
}

module.exports = nextConfig