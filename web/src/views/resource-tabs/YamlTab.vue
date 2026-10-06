<script setup lang="ts">
import { NAlert, NButton, NSpace, NSwitch, useMessage } from 'naive-ui'
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { stringify } from 'yaml'
import { loadMonaco } from '@/components/resource/monaco'
import type { DetailTabProps } from '@/components/resource/types'
import { useThemeStore } from '@/stores/theme'

// Read-only in Phase 1; editing (server-side apply) arrives in Phase 2.
const props = defineProps<DetailTabProps>()
const message = useMessage()
const theme = useThemeStore()
const monacoTheme = () => (theme.isDark ? 'vs-dark' : 'vs')
let setMonacoTheme: ((name: string) => void) | null = null

const showManagedFields = ref(false)
const failed = ref<string | null>(null)
const host = ref<HTMLElement>()
const editor = shallowRef<{ setValue(v: string): void; getScrollTop(): number; setScrollTop(n: number): void; dispose(): void }>()

const text = computed(() => {
  const { group, version, kind } = props.resource.type
  // List items carry no apiVersion/kind, so put them back. Keys keep
  // insertion order: apiVersion, kind, metadata, then spec/status as kubectl.
  const { metadata, ...rest } = props.object
  const meta = showManagedFields.value ? metadata : { ...metadata, managedFields: undefined }
  return stringify(
    { apiVersion: group ? `${group}/${version}` : version, kind, metadata: meta, ...rest },
    { lineWidth: 0 },
  )
})

let disposed = false
onMounted(async () => {
  try {
    const monaco = await loadMonaco()
    if (disposed || !host.value) return
    setMonacoTheme = (name) => monaco.editor.setTheme(name)
    editor.value = monaco.editor.create(host.value, {
      value: text.value,
      language: 'yaml',
      theme: monacoTheme(),
      readOnly: true,
      domReadOnly: true,
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      fontSize: 13,
      renderLineHighlight: 'none',
    })
  } catch (e) {
    failed.value = e instanceof Error ? e.message : String(e)
  }
})
onBeforeUnmount(() => {
  disposed = true
  editor.value?.dispose()
})

watch(
  () => theme.isDark,
  () => setMonacoTheme?.(monacoTheme()),
)

// Live updates keep the scroll position.
watch(text, (t) => {
  const e = editor.value
  if (!e) return
  const top = e.getScrollTop()
  e.setValue(t)
  e.setScrollTop(top)
})

async function copy() {
  await navigator.clipboard.writeText(text.value)
  message.success('YAML copied')
}
</script>

<template>
  <div>
    <NSpace
      align="center"
      class="toolbar"
    >
      <span class="hint">Read-only. Editing arrives in Phase 2.</span>
      <NSwitch
        v-model:value="showManagedFields"
        size="small"
      >
        <template #checked>
          Managed fields shown
        </template>
        <template #unchecked>
          Managed fields hidden
        </template>
      </NSwitch>
      <NButton
        size="small"
        @click="copy"
      >
        Copy
      </NButton>
    </NSpace>
    <NAlert
      v-if="failed"
      type="error"
      title="Editor failed to load"
    >
      {{ failed }}
    </NAlert>
    <div
      ref="host"
      class="editor"
      data-test="yaml-editor"
    />
  </div>
</template>

<style scoped>
.toolbar {
  margin-bottom: 8px;
}
.hint {
  color: var(--capy-text-muted);
  font-size: 13px;
}
.editor {
  height: 60vh;
  border: 1px solid var(--capy-border);
}
</style>
