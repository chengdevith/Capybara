<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { loadMonaco } from './monaco'

// Side-by-side YAML diff: what is in the cluster vs what applying would give.
const props = defineProps<{ original: string; modified: string }>()
const theme = useThemeStore()
const host = ref<HTMLElement>()
let dispose: (() => void) | null = null
let disposed = false

onMounted(async () => {
  const monaco = await loadMonaco()
  if (disposed || !host.value) return
  const original = monaco.editor.createModel(props.original, 'yaml')
  const modified = monaco.editor.createModel(props.modified, 'yaml')
  const diff = monaco.editor.createDiffEditor(host.value, {
    readOnly: true,
    automaticLayout: true,
    renderSideBySide: true,
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    fontSize: 13,
    theme: theme.isDark ? 'vs-dark' : 'vs',
  })
  diff.setModel({ original, modified })
  dispose = () => {
    diff.dispose()
    original.dispose()
    modified.dispose()
  }
})
onBeforeUnmount(() => {
  disposed = true
  dispose?.()
})
watch(
  () => theme.isDark,
  async (dark) => (await loadMonaco()).editor.setTheme(dark ? 'vs-dark' : 'vs'),
)
</script>

<template>
  <div
    ref="host"
    class="diff"
    data-test="yaml-diff"
  />
</template>

<style scoped>
.diff {
  height: 60vh;
  border: 1px solid var(--capy-border);
}
</style>
