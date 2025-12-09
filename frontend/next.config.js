/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  images: {
    unoptimized: process.env.NODE_ENV === 'development', // 開発環境では画像最適化を無効化
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '18000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18000/api'}/:path*`,
      },
      {
        source: '/media/:path*',
        destination: 'http://localhost:18000/media/:path*',
      },
    ]
  },
}

module.exports = nextConfig
