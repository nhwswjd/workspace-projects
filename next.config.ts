import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // outputFileTracingRoot: path.resolve(__dirname, '../../'),
  /* config options here */
  allowedDevOrigins: ['*.dev.coze.site'],
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
  // 配置 API Routes 的请求体大小限制，支持最大 100MB
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
  },
  // 针对 API 路由配置
  serverExternalPackages: ['@supabase/supabase-js'],
};

export default nextConfig;
