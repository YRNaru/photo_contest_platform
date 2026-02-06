/** @type {import('next').NextConfig} */
const nextConfig = {
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
    // Renderの一時ストレージ問題を回避するため、本番環境でも画像最適化を無効化
    // S3/R2を使用する場合は、この設定を変更して画像最適化を有効化可能
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '18000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'photo-contest-platform.onrender.com',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'photo-contest-platform-backend.onrender.com',
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:18000/api'
    const baseUrl = apiUrl.replace('/api', '')
    
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
      '@': require('path').resolve(__dirname),
    }
    return config
  },
}

module.exports = nextConfig
