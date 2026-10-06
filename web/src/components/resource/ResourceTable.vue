<script setup lang="ts">
import { NDataTable, NInput, type DataTableColumns } from 'naive-ui'
import { computed, h, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import type { KubeObject } from '@/api/k8s'
import { useNow } from '@/composables/useNow'
import { age } from './format'
import ResourceActions from './ResourceActions.vue'
import { detailRouteOf, type ResourceDef } from './types'

const props = defineProps<{
  resource: ResourceDef
  items: KubeObject[]
  cluster: string
  loading: boolean
  showNamespace: boolean
}>()

const route = useRoute()
const now = useNow()
const filter = ref('')

const rows = computed(() => {
  const f = filter.value.trim().toLowerCase()
  return f ? props.items.filter((o) => o.metadata.name.toLowerCase().includes(f)) : props.items
})

const created = (o: KubeObject) => Date.parse(o.metadata.creationTimestamp) || 0

const columns = computed<DataTableColumns<KubeObject>>(() => {
  const def = props.resource
  const nameLink = (o: KubeObject) =>
    h(
      RouterLink,
      {
        to: {
          name: detailRouteOf(def),
          params: { cluster: props.cluster, name: o.metadata.name, ...(def.type.namespaced ? { namespace: o.metadata.namespace } : {}) },
          query: route.query.ns ? { ns: route.query.ns } : {},
        },
      },
      () => o.metadata.name,
    )
  const cols: DataTableColumns<KubeObject> = [
    {
      key: 'name',
      title: 'Name',
      render: nameLink,
      sorter: (a, b) => a.metadata.name.localeCompare(b.metadata.name),
      minWidth: 200,
    },
  ]
  if (props.showNamespace) {
    cols.push({
      key: 'namespace',
      title: 'Namespace',
      render: (o) => o.metadata.namespace ?? '',
      sorter: (a, b) => (a.metadata.namespace ?? '').localeCompare(b.metadata.namespace ?? ''),
    })
  }
  for (const c of def.columns) {
    const sortValue = c.sortValue
    cols.push({
      key: c.key,
      title: c.title,
      width: c.width,
      render: (o) => c.render(o, now.value),
      sorter: sortValue
        ? (a, b) => {
            const x = sortValue(a)
            const y = sortValue(b)
            return typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))
          }
        : undefined,
    })
  }
  cols.push({
    key: 'age',
    title: 'Age',
    width: 80,
    render: (o) => age(o.metadata.creationTimestamp, now.value),
    sorter: (a, b) => created(b) - created(a),
  })
  cols.push({
    key: 'actions',
    title: '',
    width: 48,
    render: (o) => h(ResourceActions, { cluster: props.cluster, resource: def, object: o, compact: true }),
  })
  return cols
})
</script>

<template>
  <div class="resource-table">
    <div class="toolbar">
      <NInput
        v-model:value="filter"
        size="small"
        clearable
        placeholder="Filter by name"
        class="filter"
      />
      <span class="count">{{ rows.length }} {{ rows.length === 1 ? resource.singular : resource.label }}</span>
    </div>
    <NDataTable
      size="small"
      :columns="columns"
      :data="rows"
      :loading="loading && items.length === 0"
      :row-key="(o: KubeObject) => o.metadata.uid"
      :pagination="{ pageSize: 50 }"
      :bordered="false"
    />
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.filter {
  max-width: 280px;
}
.count {
  color: var(--capy-text-muted);
  font-size: 13px;
}
</style>
