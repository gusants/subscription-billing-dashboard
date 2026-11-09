import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

const DEFAULT_API_URL = 'http://localhost:3000'
const API_PREFIX = /^\/api/

function liveApiProxy(mode: string) {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  if (env.VITE_API_MODE !== 'api') return undefined
  return {
    '/api': {
      target: env.VITE_API_URL || DEFAULT_API_URL,
      changeOrigin: true,
      rewrite: (path: string) => path.replace(API_PREFIX, ''),
    },
  }
}

export default defineConfig(({ mode }) => ({
  base: process.env.BASE_PATH ?? '/',
  server: { proxy: liveApiProxy(mode) },
  preview: { proxy: liveApiProxy(mode) },
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }),
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    testTimeout: 15_000,
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/mocks/browser.ts',
        'src/mocks/enable-demo-mode.ts',
        'src/routeTree.gen.ts',
        'src/test/**',
        'src/**/*.test.{ts,tsx}',
      ],
      thresholds: {
        statements: 85,
        lines: 85,
        functions: 80,
        branches: 70,
      },
    },
  },
}))
