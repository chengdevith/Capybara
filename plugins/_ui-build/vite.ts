// Shared Vite configuration of first-party plugin UI bundles: one ES
// module, dist/<plugin>.js, reproducible (its sha256 is pinned), with the
// components' CSS injected by the bundle (Capybara serves only the JS) and
// vue, pinia, naive-ui, vue-router and @capybara/sdk left to the console's
// shared copies (import map).
//
// Only types (and Node built-ins) are imported here: each plugin's vite.config.ts passes its own
// Vue plugin, so every package comes from that plugin's pinned lockfile.
import { fileURLToPath } from 'node:url'
import type { Plugin, PluginOption, UserConfig } from 'vite'

export interface PluginUiOptions {
  /** Plugin name: the bundle is dist/<name>.js. */
  name: string
  /** URL of the plugin's ui/ folder (new URL('.', import.meta.url)). */
  root: URL
  /** At least the Vue plugin: [vue()]. */
  plugins: PluginOption[]
  /** Build-time constants (e.g. Node globals a library reads). */
  define?: Record<string, string>
}

function inlineCSS(name: string): Plugin {
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
          f.code =
            `if(typeof document!=='undefined'){const s=document.createElement('style');s.dataset.plugin=${JSON.stringify(name)};s.textContent=${JSON.stringify(code)};document.head.appendChild(s)}\n` +
            f.code
        }
      }
    },
  }
}

export function pluginUiConfig(o: PluginUiOptions): UserConfig {
  return {
    plugins: [...o.plugins, inlineCSS(o.name)],
    define: o.define,
    resolve: {
      alias: { '@capybara/sdk': fileURLToPath(new URL('../../sdk/src/index.ts', o.root)) },
    },
    build: {
      lib: { entry: 'src/index.ts', formats: ['es'], fileName: () => `${o.name}.js` },
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
  }
}
