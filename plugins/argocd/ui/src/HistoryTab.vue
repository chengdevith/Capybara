<script setup lang="ts">
import { pluginAction, type KubeObject } from '@capybara/sdk'
import { NAlert, NButton, NDataTable, NEmpty, NModal, useMessage } from 'naive-ui'
import { computed, h, ref } from 'vue'
import { isProjectNamespace, isWritable, PLUGIN } from './argocd'
import { historyOf, rollbackBlocked, shortRevision, type HistoryEntry } from './status'

// The Application's sync history, newest first (the newest is deployed
// now). "Sync to this revision" syncs an earlier revision once; it is
// offered only without auto-sync (which would sync back) and for a single
// source, and never prunes.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const message = useMessage()
const entries = computed(() => historyOf(props.object))
const blocked = computed(() => rollbackBlocked(props.object))
const allowed = computed(() => isWritable(props.cluster) && isProjectNamespace(props.object.metadata.namespace, props.cluster))
const target = ref<HistoryEntry | null>(null)
const busy = ref(false)

async function rollback() {
  const e = target.value
  if (!e) return true
  busy.value = true
  try {
    const m = props.object.metadata
    await pluginAction(props.cluster, PLUGIN, 'sync-revision', { namespace: m.namespace, name: m.name, uid: m.uid, inputs: { revision: e.revision } })
    message.success(`Syncing ${m.name} to ${shortRevision(e.revision)}`)
    target.value = null
  } catch (err) {
    message.error(err instanceof Error ? err.message : String(err))
  } finally {
    busy.value = false
  }
  return false
}

const columns = computed(() => [
  { key: 'id', title: 'ID', width: 60 },
  { key: 'revision', title: 'Revision', width: 120, render: (e: HistoryEntry) => h('code', shortRevision(e.revision)) },
  { key: 'deployedAt', title: 'Deployed', width: 200, render: (e: HistoryEntry) => (e.deployedAt ? new Date(e.deployedAt).toLocaleString() : '—') },
  { key: 'source', title: 'Source', minWidth: 200, ellipsis: { tooltip: true }, render: (e: HistoryEntry) => [e.source?.repoURL, e.source?.path].filter(Boolean).join(' · ') },
  {
    key: 'action', title: '', width: 190,
    render: (e: HistoryEntry, i: number) =>
      i === 0
        ? h('span', { class: 'muted' }, 'Deployed now')
        : allowed.value && !blocked.value
          ? h(NButton, { size: 'tiny', 'data-test': 'history-rollback', onClick: () => (target.value = e) }, () => 'Sync to this revision')
          : null,
  },
])
</script>

<template>
  <div data-test="argocd-history">
    <NAlert
      v-if="blocked && entries.length > 1 && allowed"
      type="info"
      class="gap"
      data-test="history-blocked"
    >
      {{ blocked }}
    </NAlert>
    <NEmpty
      v-if="!entries.length"
      description="Not synced yet."
    />
    <NDataTable
      v-else
      :columns="columns"
      :data="entries"
      :row-key="(e: HistoryEntry) => e.id"
      size="small"
    />
    <NModal
      :show="!!target"
      preset="dialog"
      type="warning"
      :title="`Sync ${object.metadata.name} to ${shortRevision(target?.revision)}?`"
      positive-text="Sync to this revision"
      negative-text="Cancel"
      :loading="busy"
      :positive-button-props="{ 'data-test': 'confirm' } as never"
      @positive-click="rollback"
      @negative-click="target = null"
      @close="target = null"
    >
      The resources go back to how they were at this revision (nothing is pruned). The Application then shows OutOfSync
      until Git's target revision is synced again.
    </NModal>
  </div>
</template>

<style scoped>
.gap {
  margin-bottom: 12px;
}
.muted {
  opacity: 0.6;
  font-size: 12px;
}
</style>
