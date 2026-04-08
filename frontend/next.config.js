const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 上位ディレクトリの package-lock.json 等で workspace root が誤推測される警告を抑止
  outputFileTracingRoot: path.join(__dirname),
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // CSS/JSプリロード警告を抑制
  experimental: {
    optimizeCss: false,
  },
  images: {
    // 自前APIの /media や S3/R2 等は remotePatterns にホストを追加して許可する
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '18001',
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
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18001/api'
    // 先頭の https://api. の /api まで消さないよう、末尾の /api のみ除去する
    const baseUrl = apiUrl.replace(/\/api\/?$/, '')
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
      {
        source: '/media/:path*',
        destination: `${baseUrl}/media/:path*`,
      },
    ]
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    }
    return config
  },
}

module.exports = nextConfig
