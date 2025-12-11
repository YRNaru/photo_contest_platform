/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // Static export for Render
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  images: {
    unoptimized: true, // Required for static export
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
  // rewrites are not supported in static export
  // Use NEXT_PUBLIC_API_URL directly in API calls instead
}

module.exports = nextConfig
