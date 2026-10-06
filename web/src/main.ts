import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import { registry, registryKey } from './extensions'
import { registerCoreExtensions } from './extensions/core'
import { createAppRouter } from './router'

registerCoreExtensions(registry)

createApp(App)
  .use(createPinia())
  .use(createAppRouter(registry))
  .provide(registryKey, registry)
  .mount('#app')
