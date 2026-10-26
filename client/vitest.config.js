import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.jsx'],
    setupFiles: ['./test/setup.js'],
    env: { VITE_API_URL: '/api' },
    restoreMocks: true,
    fileParallelism: false,
  },
});
