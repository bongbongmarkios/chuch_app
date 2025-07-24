import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  /* config options here */
  transpilePackages: ['@ionic/react', '@capacitor/core', '@capacitor/filesystem'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
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
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        http2: false,
        dns: false,
        child_process: false,
        cluster: false,
        dgram: false,
        module: false,
        process: false,
        util: false,
        buffer: false,
        events: false,
        querystring: false,
        punycode: false,
        string_decoder: false,
        timers: false,
        tty: false,
        v8: false,
        vm: false,
        worker_threads: false,
      };
    }

    // Exclude AI-related modules for all builds
    config.resolve.alias = {
      ...config.resolve.alias,
      '@/ai/genkit': false,
      '@/ai/flows/chat-flow': false,
      '@/ai/flows/suggest-related-content': false,
      '@/components/ai/ChatInterface': false,
      '@/components/ai/ChatSidebar': false,
      '@/components/ai/AISuggestionDisplay': false,
      '@/components/ai/FloatingAiButton': false,
      '@genkit-ai/core': false,
      '@genkit-ai/googleai': false,
      '@genkit-ai/next': false,
      'genkit': false,
      '@grpc/grpc-js': false,
      '@opentelemetry/otlp-grpc-exporter-base': false,
      '@opentelemetry/exporter-trace-otlp-grpc': false,
      '@opentelemetry/sdk-node': false,
    };

    return config;
  },
};

export default nextConfig; 