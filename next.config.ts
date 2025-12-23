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

  // Security headers
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
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.accounts.dev",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://clerk.com https://*.clerk.accounts.dev https://api.lemonsqueezy.com wss:",
              "frame-src 'self' https://clerk.com https://*.clerk.accounts.dev",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
