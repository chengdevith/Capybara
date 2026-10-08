<script setup lang="ts">
import { NAlert } from 'naive-ui'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { loadMonaco } from './monaco'

// A YAML editor. Read-only views follow `value` live (keeping the scroll
// position); editable views only take a new `value` when the parent sets one.
// `markers` underline line ranges with a message (e.g. validation problems).
export interface EditorMarker {
  startLine: number
  endLine: number
  message: string
  severity?: 'error' | 'warning'
}
const props = defineProps<{ value: string; readOnly?: boolean; height?: string; markers?: EditorMarker[] }>()
const emit = defineEmits<{ 'update:value': [value: string] }>()

const theme = useThemeStore()
const host = ref<HTMLElement>()
const failed = ref<string | null>(null)

type Editor = Awaited<ReturnType<typeof loadMonaco>>['editor']
let editor: ReturnType<Editor['create']> | null = null
let monacoEditor: Editor | null = null
let disposed = false
let ownChange = false
let monacoApi: Awaited<ReturnType<typeof loadMonaco>> | null = null

function applyMarkers() {
  const model = editor?.getModel()
  if (!monacoApi || !model) return
  monacoApi.editor.setModelMarkers(
    model,
    'capybara',
    (props.markers ?? []).map((m) => ({
      startLineNumber: m.startLine,
      endLineNumber: m.endLine,
      startColumn: 1,
      endColumn: model.getLineMaxColumn(Math.min(m.endLine, model.getLineCount())),
      message: m.message,
      severity: m.severity === 'warning' ? monacoApi!.MarkerSeverity.Warning : monacoApi!.MarkerSeverity.Error,
    })),
  )
}
watch(() => props.markers, applyMarkers, { deep: true })

onMounted(async () => {
  try {
    const monaco = await loadMonaco()
    if (disposed || !host.value) return
    monacoEditor = monaco.editor
    editor = monaco.editor.create(host.value, {
      value: props.value,
      language: 'yaml',
      theme: theme.isDark ? 'vs-dark' : 'vs',
      readOnly: props.readOnly,
      domReadOnly: props.readOnly,
      minimap: { enabled: false },
      automaticLayout: true,
      scrollBeyondLastLine: false,
      fontSize: 13,
      tabSize: 2,
      renderLineHighlight: props.readOnly ? 'none' : 'line',
    })
    editor.onDidChangeModelContent(() => {
      if (!editor) return
      ownChange = true
      emit('update:value', editor.getValue())
    })
    monacoApi = monaco
    applyMarkers()
  } catch (e) {
    failed.value = e instanceof Error ? e.message : String(e)
  }
})
onBeforeUnmount(() => {
  disposed = true
  editor?.dispose()
})

watch(
  () => props.value,
  (v) => {
    if (ownChange) {
      ownChange = false
      return
    }
    if (!editor || editor.getValue() === v) return
    const top = editor.getScrollTop()
    editor.setValue(v)
    editor.setScrollTop(top)
  },
)
watch(
  () => props.readOnly,
  (ro) => editor?.updateOptions({ readOnly: ro, domReadOnly: ro }),
)
watch(
  () => theme.isDark,
  (dark) => monacoEditor?.setTheme(dark ? 'vs-dark' : 'vs'),
)
</script>

<template>
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
    :style="height ? { height } : undefined"
    data-test="yaml-editor"
  />
</template>

<style scoped>
.editor {
  height: 60vh;
  border: 1px solid var(--capy-border);
}
</style>
