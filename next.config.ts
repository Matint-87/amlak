/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // 🔥 اصلاح webpack config
  ...(process.env.NODE_ENV === 'development' && {
    webpack: (config: any) => { 
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
      return config;
    },
  }),
};

module.exports = nextConfig;