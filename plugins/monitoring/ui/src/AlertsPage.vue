<script setup lang="ts">
import { useCluster } from '@capybara/sdk'
import { NAlert, NCard, NDataTable, NH2, NTag, type DataTableColumns } from 'naive-ui'
import { h, onBeforeUnmount, ref, watch } from 'vue'
import { alerts, type Alert } from './api'

const cluster = useCluster()
const items = ref<Alert[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
let timer: ReturnType<typeof setInterval> | undefined
async function load() {
  if (!cluster.value) return
  try {
    items.value = await alerts(cluster.value)
    error.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
watch(cluster, () => {
  void load()
  clearInterval(timer)
  timer = setInterval(() => void load(), 30000)
}, { immediate: true })
onBeforeUnmount(() => clearInterval(timer))

const columns: DataTableColumns<Alert> = [
  { key: 'name', title: 'Alert', sorter: (a, b) => a.name.localeCompare(b.name) },
  {
    key: 'state', title: 'State', width: 100,
    render: (a) => h(NTag, { size: 'small', bordered: false, type: a.state === 'firing' ? 'error' : 'warning' }, () => a.state),
  },
  { key: 'severity', title: 'Severity', width: 100, render: (a) => a.severity ?? '—' },
  { key: 'summary', title: 'Summary', render: (a) => a.summary ?? '—' },
  { key: 'activeAt', title: 'Since', width: 200, render: (a) => (a.activeAt ? new Date(a.activeAt).toLocaleString() : '—') },
]
</script>

<template>
  <div>
    <NH2>Alerts</NH2>
    <NAlert
      v-if="error"
      type="warning"
    >
      {{ error }}
    </NAlert>
    <NCard>
      <NDataTable
        :columns="columns"
        :data="items"
        :loading="loading"
        size="small"
        data-test="monitoring-alerts"
      />
    </NCard>
  </div>
</template>
