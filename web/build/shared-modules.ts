import type { Plugin } from 'vite'

/**
 * Shared modules for plugin UI bundles.
 *
 * Plugins import vue, pinia, naive-ui and @capybara/sdk as bare modules and
 * never bundle them. Capybara serves /capybara-shared/<name>.js modules that
 * re-export ITS OWN copies, and an import map points the bare names there,
 * so the console and every plugin share one Vue instance.
 *
 * - dev: the URLs are virtual modules; Vite rewrites their `export * from
 *   'vue'` to the same pre-bundled dependency the app imports.
 * - build: they are extra entries (fixed file names, signatures kept);
 *   Rollup puts vue & co. in chunks shared with the app.
 */
export const SHARED: Record<string, { file: string; hasDefault: boolean }> = {
  vue: { file: 'vue.js', hasDefault: false },
  pinia: { file: 'pinia.js', hasDefault: false },
  'naive-ui': { file: 'naive-ui.js', hasDefault: true },
  '@capybara/sdk': { file: 'sdk.js', hasDefault: false },
}

const PREFIX = '/capybara-shared/'
const VIRTUAL = '\0capybara-shared:'

export function importMap(): { imports: Record<string, string> } {
  const imports: Record<string, string> = {}
  for (const [pkg, { file }] of Object.entries(SHARED)) imports[pkg] = PREFIX + file
  return { imports }
}

function packageFor(file: string): [string, boolean] | undefined {
  const hit = Object.entries(SHARED).find(([, v]) => v.file === file)
  return hit ? [hit[0], hit[1].hasDefault] : undefined
}

export function sharedModules(): Plugin {
  return {
    name: 'capybara-shared-modules',
    config(_cfg, env) {
      if (env.command !== 'build') return
      const input: Record<string, string> = { main: 'index.html' }
      for (const { file } of Object.values(SHARED)) input[`capybara-shared/${file.replace(/\.js$/, '')}`] = PREFIX + file
      return {
        build: {
          rollupOptions: {
            input,
            preserveEntrySignatures: 'strict',
            output: {
              entryFileNames: (chunk) =>
                chunk.name.startsWith('capybara-shared/') ? '[name].js' : 'assets/[name]-[hash].js',
            },
          },
        },
      }
    },
    resolveId(id) {
      if (id.startsWith(PREFIX) && packageFor(id.slice(PREFIX.length))) return VIRTUAL + id.slice(PREFIX.length)
      return undefined
    },
    load(id) {
      if (!id.startsWith(VIRTUAL)) return undefined
      const hit = packageFor(id.slice(VIRTUAL.length))
      if (!hit) return undefined
      const [pkg, hasDefault] = hit
      return `export * from '${pkg}'\n` + (hasDefault ? `export { default } from '${pkg}'\n` : '')
    },
    transformIndexHtml: {
      order: 'pre',
      handler() {
        return [{ tag: 'script', attrs: { type: 'importmap' }, children: JSON.stringify(importMap()), injectTo: 'head-prepend' }]
      },
    },
  }
}
