import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import { pluginUiConfig } from '../../_ui-build/vite.ts'

export default defineConfig(pluginUiConfig({ name: 'tekton', root: new URL('.', import.meta.url), plugins: [vue()] }))
