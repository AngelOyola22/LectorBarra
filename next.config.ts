/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: '/api/:path*',
        destination: 'https://201.183.9.59:9002/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig