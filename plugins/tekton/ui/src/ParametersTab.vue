<script setup lang="ts">
import type { KubeObject } from '@capybara/sdk'
import { NDataTable, NEmpty, type DataTableColumns } from 'naive-ui'
import { computed } from 'vue'

// Parameters and workspaces: declared ones (Pipeline, Task) or the values
// a run was started with (PipelineRun, TaskRun).
const props = defineProps<{ cluster: string; object: KubeObject }>()
const isRun = computed(() => props.object.kind === 'PipelineRun' || props.object.kind === 'TaskRun')
const show = (v: unknown) => (v === undefined ? '—' : typeof v === 'string' ? v : JSON.stringify(v))

interface Row { name: string; a: string; b: string }
const params = computed<Row[]>(() =>
  ((props.object.spec?.params as { name: string; value?: unknown; type?: string; default?: unknown; description?: string }[] | undefined) ?? []).map((p) =>
    isRun.value ? { name: p.name, a: show(p.value), b: '' } : { name: p.name, a: p.type ?? 'string', b: `${show(p.default)}${p.description ? ` — ${p.description}` : ''}` }),
)
const workspaces = computed<Row[]>(() =>
  ((props.object.spec?.workspaces as Record<string, unknown>[] | undefined) ?? []).map((w) => {
    if (!isRun.value) return { name: String(w.name), a: w.optional ? 'optional' : 'required', b: String(w.description ?? '') }
    const kind = Object.keys(w).find((k) => k !== 'name' && k !== 'subPath') ?? '—'
    const detail = kind === 'configMap' ? String((w.configMap as { name?: string })?.name ?? '')
      : kind === 'volumeClaimTemplate' ? String((w.volumeClaimTemplate as { spec?: { resources?: { requests?: { storage?: string } } } })?.spec?.resources?.requests?.storage ?? '')
      : ''
    return { name: String(w.name), a: kind, b: detail }
  }),
)
const paramColumns = computed<DataTableColumns<Row>>(() =>
  isRun.value
    ? [{ key: 'name', title: 'Name', width: 220 }, { key: 'a', title: 'Value' }]
    : [{ key: 'name', title: 'Name', width: 220 }, { key: 'a', title: 'Type', width: 100 }, { key: 'b', title: 'Default' }],
)
const wsColumns = computed<DataTableColumns<Row>>(() =>
  isRun.value
    ? [{ key: 'name', title: 'Workspace', width: 220 }, { key: 'a', title: 'Bound to', width: 200 }, { key: 'b', title: '' }]
    : [{ key: 'name', title: 'Workspace', width: 220 }, { key: 'a', title: '', width: 100 }, { key: 'b', title: 'Description' }],
)
</script>

<template>
  <div data-test="tekton-parameters">
    <h4>Parameters</h4>
    <NDataTable
      v-if="params.length"
      size="small"
      :columns="paramColumns"
      :data="params"
    />
    <NEmpty
      v-else
      size="small"
      description="No parameters."
    />
    <h4>Workspaces</h4>
    <NDataTable
      v-if="workspaces.length"
      size="small"
      :columns="wsColumns"
      :data="workspaces"
    />
    <NEmpty
      v-else
      size="small"
      description="No workspaces."
    />
  </div>
</template>

<style scoped>
h4 {
  margin: 4px 0 8px;
}
h4 + * + h4,
h4:not(:first-child) {
  margin-top: 16px;
}
</style>
