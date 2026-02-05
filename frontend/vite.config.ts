import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { loadEnv } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react({
        // Enable Fast Refresh
        fastRefresh: true,
        // Add JSX runtime for production build
        jsxRuntime: 'automatic',
      }),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@store': path.resolve(__dirname, './src/store'),
        '@types': path.resolve(__dirname, './src/types'),
      },
    },

    server: {
      proxy: {
        // Proxy API requests to backend
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },

    build: {
      // Output directory
      outDir: 'dist',
      
      // Enable source maps for production
      sourcemap: true,

      // Minification options
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },

      // Chunk splitting
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: [
              'react',
              'react-dom',
              'react-router-dom',
              'zustand',
              '@tanstack/react-query',
            ],
            ui: ['@headlessui/react', '@radix-ui/react-*'],
          },
        },
      },

      // Asset handling
      assetsDir: 'assets',
      cssCodeSplit: true,
      
      // Reduce chunk size warnings threshold
      chunkSizeWarningLimit: 1000,
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'zustand',
        'axios',
      ],
    },

    esbuild: {
      // Enable JSX in .js files
      jsxInject: `import React from 'react'`,
      // Drop console.log in production
      drop: command === 'build' ? ['console', 'debugger'] : [],
    },
  };
});