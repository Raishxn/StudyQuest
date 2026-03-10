/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@studyquest/ui", "@studyquest/utils", "@studyquest/types"],
  experimental: {
    serverComponentsExternalPackages: ["canvas", "jsdom"],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

module.exports = nextConfig;
