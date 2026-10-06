import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { clusterFromParams } from './composables/useExtensionContext'
import { registry, registryKey } from './extensions'
import { registerCoreExtensions } from './extensions/core'
import { createPluginLoader } from './extensions/plugins/loader'
import { createAppRouter } from './router'
import { usePluginsStore } from './stores/plugins'

registerCoreExtensions(registry)

const pinia = createPinia()
const plugins = usePluginsStore(pinia)
const loader = createPluginLoader({ registry, onError: (name, msg) => plugins.setLoadError(name, msg) })
plugins.onChange((catalog) => void loader.sync(catalog))

// Load enabled plugins' UI before the first navigation, so deep links to
// plugin pages work (but never wait long for it).
await Promise.race([
  plugins.load().then(() => loader.sync(plugins.catalog)),
  new Promise((resolve) => setTimeout(resolve, 3000)),
])
plugins.startPolling()

const router = createAppRouter(registry, undefined, (params) => {
  const cluster = clusterFromParams(params)
  return { cluster, plugins: plugins.enabledOn(cluster) }
})

createApp(App).use(pinia).use(router).provide(registryKey, registry).mount('#app')
