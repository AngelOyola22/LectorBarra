/** @type {import('next').NextConfig} */
const nextConfig = {
  /**reactStrictMode: true,*/
  
  images: {
    domains: ['177.234.196.99'],
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