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
    // 自前APIの /media や S3/R2 等は remotePatterns にホストを追加して許可する
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
