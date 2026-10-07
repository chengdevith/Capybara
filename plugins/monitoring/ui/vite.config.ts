import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'

// Capybara serves only the JS bundle: inject the components' CSS from it.
function inlineCSS(): Plugin {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_opts, bundle) {
      const css = Object.values(bundle).filter((f) => f.type === 'asset' && f.fileName.endsWith('.css'))
      const code = css.map((f) => (f.type === 'asset' ? String(f.source) : '')).join('')
      for (const f of css) delete bundle[f.fileName]
      for (const f of Object.values(bundle)) {
        if (f.type === 'chunk' && f.isEntry && code) {
          f.code = `if(typeof document!=='undefined'){const s=document.createElement('style');s.dataset.plugin='monitoring';s.textContent=${JSON.stringify(code)};document.head.appendChild(s)}\n` + f.code
        }
      }
    },
  }
}

// One ES module, dist/monitoring.js. Capybara provides vue, pinia, naive-ui
// and @capybara/sdk at runtime (import map): never bundle them.
export default defineConfig({
  plugins: [vue(), inlineCSS()],
  // Library mode leaves process.env in place; ECharts reads NODE_ENV.
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  resolve: {
    alias: { '@capybara/sdk': fileURLToPath(new URL('../../../sdk/src/index.ts', import.meta.url)) },
  },
  build: {
    lib: { entry: 'src/index.ts', formats: ['es'], fileName: () => 'monitoring.js' },
    outDir: 'dist',
    emptyOutDir: true,
    minify: true,
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      external: ['vue', 'pinia', 'naive-ui', '@capybara/sdk', 'vue-router'],
      output: { codeSplitting: false },
    },
  },
})
