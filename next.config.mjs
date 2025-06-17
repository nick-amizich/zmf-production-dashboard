/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  experimental: {
    // ppr: 'incremental', // Partial Pre-rendering - only available in canary
    after: true, // Post-response tasks
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  bundlePagesRouterDependencies: true,
  serverExternalPackages: ['@node-rs/argon2'],
}

export default nextConfig
