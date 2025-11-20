import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';

/**
 * Vite configuration for NZXT Web Integration.
 * Supports multi-entry build (index.html + config.html).
 */

const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'));
const appVersion = packageJson.version || '0.0.0';

export default defineConfig({
  base: '/nzxt-esc/',
  define: {
    __APP_VERSION__: JSON.stringify(appVersion),
  },
  plugins: [
    react({
      // React Fast Refresh
      fastRefresh: true,
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        config: resolve(__dirname, 'config.html'),
      },
      output: {
        // Chunk splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
      },
    },
  },
  // TypeScript and ESBuild
  esbuild: {
    target: 'es2015',
  },
  // Public directory
  publicDir: 'public',
});
