<script setup lang="ts">
import { NAlert, NDataTable, type DataTableColumns } from 'naive-ui'
import { computed } from 'vue'
import type { KubeObject, ResourceType } from '@/api/k8s'
import { age } from '@/components/resource/format'
import { statusTag } from '@/components/resource/render'
import type { DetailTabProps } from '@/components/resource/types'
import { useLiveList } from '@/composables/useLiveList'
import { useNow } from '@/composables/useNow'

const props = defineProps<DetailTabProps>()
const now = useNow()

/** Events kept in the browser for one object. */
const MAX_EVENTS = 100

const eventsType: ResourceType = { group: '', version: 'v1', plural: 'events', kind: 'Event', namespaced: true }

const lastSeen = (e: KubeObject): string =>
  (e.lastTimestamp as string | undefined) ??
  (e.eventTime as string | undefined) ??
  (e.series as { lastObservedTime?: string } | undefined)?.lastObservedTime ??
  e.metadata.creationTimestamp
const newestFirst = (a: KubeObject, b: KubeObject) => Date.parse(lastSeen(b)) - Date.parse(lastSeen(a))

// Only this object's events (by uid), live, newest first, capped.
const source = computed(() => ({
  cluster: props.cluster,
  type: eventsType,
  namespace: props.object.metadata.namespace ?? null,
  fieldSelector: `involvedObject.uid=${props.object.metadata.uid}`,
}))
const { items, loading, error } = useLiveList(source, { sort: newestFirst, max: MAX_EVENTS })

const columns: DataTableColumns<KubeObject> = [
  {
    key: 'type',
    title: 'Type',
    width: 100,
    render: (e) => statusTag(String(e.type ?? 'Normal'), e.type === 'Warning' ? 'warning' : 'default'),
  },
  { key: 'reason', title: 'Reason', width: 160, render: (e) => String(e.reason ?? '') },
  { key: 'message', title: 'Message', render: (e) => String(e.message ?? '') },
  { key: 'count', title: 'Count', width: 70, render: (e) => String(e.count ?? (e.series as { count?: number })?.count ?? 1) },
  {
    key: 'source',
    title: 'Source',
    width: 160,
    render: (e) => String(e.reportingComponent || (e.source as { component?: string } | undefined)?.component || ''),
  },
  { key: 'last', title: 'Last seen', width: 90, render: (e) => age(lastSeen(e), now.value) },
]
</script>

<template>
  <div>
    <NAlert
      v-if="error"
      type="warning"
      class="error"
    >
      {{ error }}
    </NAlert>
    <NDataTable
      size="small"
      :columns="columns"
      :data="items"
      :loading="loading"
      :row-key="(e: KubeObject) => e.metadata.uid"
      :bordered="false"
    >
      <template #empty>
        No events for this {{ resource.singular }}. Kubernetes keeps events for about an hour.
      </template>
    </NDataTable>
    <div
      v-if="items.length >= MAX_EVENTS"
      class="note"
    >
      Showing the latest {{ MAX_EVENTS }} events.
    </div>
  </div>
</template>

<style scoped>
.error {
  margin-bottom: 8px;
}
.note {
  margin-top: 8px;
  color: var(--capy-text-muted);
  font-size: 12px;
}
</style>
