import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: './src/test/setupTests.js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../'),
      '@components': path.resolve(__dirname, '../components'),
      '@pages': path.resolve(__dirname, '../pages'),
      '@assets': path.resolve(__dirname, '../assets'),
      '@constants': path.resolve(__dirname, '../constants'),
      '@styles': path.resolve(__dirname, '../styles'),
      '@hooks': path.resolve(__dirname, '../hooks'),
      '@utils': path.resolve(__dirname, '../utils'),
    },
  },
});
