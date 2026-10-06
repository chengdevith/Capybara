import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// The Go API server; override with CAPYBARA_API to point elsewhere locally.
const api = process.env.CAPYBARA_API ?? 'http://127.0.0.1:8080'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      // ws: true so the websocket endpoints (watch, logs, exec) proxy too.
      '/api': { target: api, ws: true, changeOrigin: false },
      '/healthz': { target: api },
    },
  },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
  },
})
