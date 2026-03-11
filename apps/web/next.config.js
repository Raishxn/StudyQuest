/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@studyquest/ui", "@studyquest/utils", "@studyquest/types"],
  experimental: {
    serverComponentsExternalPackages: ["canvas", "jsdom"],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '*.r2.dev' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
