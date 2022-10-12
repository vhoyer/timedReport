/// <reference types="vitest" />
import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  root: './src',
  build: {
    emptyOutDir: true,
    outDir: '../dist',
  },
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    postcss: {
      plugins: [
        require('autoprefixer'),
      ]
    },
  },
  test: {
    setupFiles: ['../vitest.setup'],
  },
});
