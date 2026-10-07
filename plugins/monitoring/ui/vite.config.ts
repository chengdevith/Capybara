import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { pluginUiConfig } from '../../_ui-build/vite.ts'

export default defineConfig(
  pluginUiConfig({
    name: 'monitoring',
    root: new URL('.', import.meta.url),
    plugins: [vue()],
    // Library mode leaves Node globals in place: ECharts reads NODE_ENV, and
    // zrender probes Buffer (globalThis.Buffer is undefined in browsers).
    // make lint rejects bundles with free references to Node globals.
    define: { 'process.env.NODE_ENV': JSON.stringify('production'), Buffer: 'globalThis.Buffer' },
  }),
)
