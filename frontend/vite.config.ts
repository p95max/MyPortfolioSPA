import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const backendProxyTarget =
  process.env.VITE_DEV_PROXY_TARGET ?? 'http://localhost:8000'

export default defineConfig({
  // Docker Compose injects .env into the container. This also lets direct
  // `npm run build` calls read the single project-root .env file.
  envDir: '..',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    globals: false,
  },
  server: {
    proxy: {
      '/api': {
        target: backendProxyTarget,
        changeOrigin: true,
      }
    }
  }
})
