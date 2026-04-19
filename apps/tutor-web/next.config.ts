import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  transpilePackages: ['@yanxuebao/ui', '@yanxuebao/config', '@yanxuebao/types'],
};

export default nextConfig;
