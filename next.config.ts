import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker/serverless deployment
  output: 'standalone',

  // Optimize images
  images: {
    domains: ['localhost', 'grcma.io'],
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // Environment variables exposed to client
  env: {
    NEXT_PUBLIC_APP_NAME: 'GRCma',
    NEXT_PUBLIC_APP_VERSION: '1.0.0-demo',
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
