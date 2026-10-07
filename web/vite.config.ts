import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'
import { sharedModules } from './build/shared-modules'

// The Go API server; override with CAPYBARA_API to point elsewhere locally.
const api = process.env.CAPYBARA_API ?? 'http://127.0.0.1:8080'

export default defineConfig({
  plugins: [vue(), sharedModules()],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      // The plugin SDK (repo sdk/) is part of the console's own build.
      { find: /^@capybara\/sdk$/, replacement: fileURLToPath(new URL('../sdk/src/index.ts', import.meta.url)) },
      { find: /^@capybara\/sdk\/(.*)$/, replacement: fileURLToPath(new URL('../sdk/src/$1.ts', import.meta.url)) },
    ],
    // sdk/ lives outside web/: always use the console's single copies.
    dedupe: ['vue', 'vue-router', 'pinia', 'naive-ui'],
  },
  optimizeDeps: {
    // Pre-bundle the lazily loaded editors at startup. Otherwise Vite finds
    // them on first use and reloads the page mid-session.
    // Also everything plugins reach through the shared modules (the SDK
    // sources live outside web/), so nothing is discovered at runtime: a
    // re-optimization while pages are open breaks their lazy imports (504).
    entries: ['index.html', '../sdk/src/**/*.ts'],
    include: [
      'vue',
      'vue-router',
      'pinia',
      'naive-ui',
      'monaco-editor/editor/editor.api',
      'monaco-editor/languages/definitions/yaml/register',
      '@xterm/xterm',
      '@xterm/addon-fit',
      'yaml',
    ],
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
    include: ['src/**/*.test.ts', 'build/**/*.test.ts'],
  },
})
