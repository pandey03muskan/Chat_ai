/** @type {import('next').NextConfig} */

// const nextRuntimeEnv = require('next-runtime-env');

// module.exports = configureRuntimeEnv({
//   publicPrefix: 'NEXT_PUBLIC_',
// });

// const nextConfig = {
//   reactStrictMode: true,
// }

// module.exports = nextConfig

module.exports = {
  webpack(config) {
    config.resolve.fallback = {
      fs: false,
    };
    return config;
  },
};
