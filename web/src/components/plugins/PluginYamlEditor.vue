<script setup lang="ts">
import { computed } from 'vue'
import MonacoEditor, { type EditorMarker } from '@/components/resource/MonacoEditor.vue'
import { lineOf } from '@/components/resource/yamlPaths'

// The YAML editor lent to plugins (api.components.YamlEditor): problems
// with field paths become markers on the matching lines.
const props = defineProps<{
  value: string
  readOnly?: boolean
  height?: string
  problems?: { path: string; message: string }[]
}>()
const emit = defineEmits<{ 'update:value': [value: string] }>()

const markers = computed<EditorMarker[]>(() =>
  (props.problems ?? []).map((p) => {
    const { start, end } = lineOf(props.value, p.path)
    return { startLine: start, endLine: end, message: p.path ? `${p.path}: ${p.message}` : p.message }
  }),
)
</script>

<template>
  <MonacoEditor
    :value="value"
    :read-only="readOnly"
    :height="height"
    :markers="markers"
    @update:value="(v: string) => emit('update:value', v)"
  />
</template>
