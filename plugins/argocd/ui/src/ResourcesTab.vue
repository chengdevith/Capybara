<script setup lang="ts">
import type { KubeObject } from '@capybara/sdk'
import { NAlert, NDataTable, NEmpty } from 'naive-ui'
import { computed, h } from 'vue'
import { api, coreResource, isViewOnly, tag } from './argocd'
import { explainRefusal, healthOf } from './status'

// What an Application deployed (status.resources), with each resource's
// sync and health, and why Argo CD refused anything (its conditions and the
// last sync's message, explained in Project terms).
const props = defineProps<{ cluster: string; object: KubeObject }>()
const { ResourceLink } = api().components
const viewOnly = computed(() => isViewOnly(props.cluster))

interface Res {
  group?: string
  version?: string
  kind: string
  namespace?: string
  name: string
  status?: string
  health?: { status?: string; message?: string }
  hook?: boolean
  requiresPruning?: boolean
}
const resources = computed(() => ((props.object.status?.resources as Res[] | undefined) ?? []).filter((r) => !r.hook))

interface Cond {
  type: string
  message: string
}
const problems = computed(() => {
  const out: { title: string; message: string; hint: string }[] = []
  for (const c of (props.object.status?.conditions as Cond[] | undefined) ?? []) {
    if (/Error|Warning/.test(c.type)) out.push({ title: c.type, message: c.message, hint: explainRefusal(c.message) })
  }
  const op = props.object.status?.operationState
  if (op && (op.phase === 'Failed' || op.phase === 'Error')) {
    out.push({ title: `Last sync ${op.phase.toLowerCase()}`, message: op.message ?? '', hint: explainRefusal(op.message ?? '') })
    for (const r of (op.syncResult?.resources as { kind: string; name: string; status: string; message?: string }[] | undefined) ?? []) {
      if (r.status === 'SyncFailed' && r.message) out.push({ title: `${r.kind} ${r.name}`, message: r.message, hint: explainRefusal(r.message) })
    }
  }
  return out
})

const columns = [
  {
    key: 'kind', title: 'Kind', width: 160,
    render: (r: Res) => r.kind,
  },
  {
    key: 'name', title: 'Name', minWidth: 180,
    render: (r: Res) => (coreResource[r.kind] ? h(ResourceLink, { cluster: props.cluster, resource: coreResource[r.kind], namespace: r.namespace, name: r.name }) : r.name),
  },
  {
    key: 'sync', title: 'Sync', width: 130,
    render: (r: Res) => (r.requiresPruning ? tag('To prune', 'warning') : tag(r.status ?? 'Unknown', r.status === 'Synced' ? 'success' : r.status === 'OutOfSync' ? 'warning' : 'default')),
  },
  {
    key: 'health', title: 'Health', width: 130,
    render: (r: Res) => (r.health ? tag(healthOf(r).text, healthOf(r).tone) : '—'),
  },
  {
    key: 'message', title: 'Message', minWidth: 200, ellipsis: { tooltip: true },
    render: (r: Res) => r.health?.message ?? '',
  },
]
</script>

<template>
  <div data-test="argocd-resources">
    <NAlert
      v-if="viewOnly"
      type="info"
      class="gap"
    >
      GitOps is view-only on this cluster: the connected Argo CD only accepts Applications in its own namespace.
    </NAlert>
    <NAlert
      v-for="p in problems"
      :key="p.title + p.message"
      type="error"
      :title="p.title"
      class="gap"
      data-test="argocd-refusal"
    >
      <div>{{ p.message }}</div>
      <div
        v-if="p.hint"
        class="hint"
        data-test="argocd-refusal-hint"
      >
        {{ p.hint }}
      </div>
    </NAlert>
    <NEmpty
      v-if="!resources.length"
      description="Nothing deployed yet: sync the Application."
    />
    <NDataTable
      v-else
      :columns="columns"
      :data="resources"
      :row-key="(r: Res) => `${r.group}/${r.kind}/${r.namespace}/${r.name}`"
      size="small"
    />
  </div>
</template>

<style scoped>
.gap {
  margin-bottom: 12px;
}
.hint {
  margin-top: 6px;
  font-weight: 500;
}
</style>
