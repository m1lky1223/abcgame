/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/abcgame/',
  test: {
    environment: 'happy-dom',
    setupFiles: './src/__tests__/setup.ts',
    include: ['src/__tests__/**/*.test.ts'],
  },
})
