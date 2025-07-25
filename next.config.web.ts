
import type {NextConfig} from 'next';
const withPWA = require('next-pwa')({
  dest: 'public'
})

const nextConfig: NextConfig = {
  output: 'export',
  /* config options here */
  transpilePackages: ['@ionic/react', '@capacitor/core', '@capacitor/filesystem'],
  typescript: {
    ignoreBuildErrors: false, // Changed to false
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable ESLint for APK build
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    config.module.rules.push({
      test: /\.entry\.js$/,
      use: 'raw-loader',
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Exclude problematic AI modules for mobile build
    config.externals = config.externals || [];
    config.externals.push({
      '@opentelemetry/sdk-node': 'commonjs @opentelemetry/sdk-node',
      'handlebars': 'commonjs handlebars',
      'genkit': 'commonjs genkit',
    });

    return config;
  },
};

export default withPWA(nextConfig);
