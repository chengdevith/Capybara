<script setup lang="ts">
import { NAlert, NButton, NCard, NDataTable, NH2, NInput, NSelect, NSpace, NSwitch, type DataTableColumns } from 'naive-ui'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { listAudit, type AuditRecord } from '@/api/audit'
import { age } from '@/components/resource/format'
import { statusTag } from '@/components/resource/render'
import type { Tone } from '@/components/resource/types'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { useNow } from '@/composables/useNow'

const ctx = useExtensionContext()
const now = useNow()

const PAGE = 100
const allClusters = ref(false)
const action = ref<string | null>(null)
const result = ref<string | null>(null)
const namespace = ref('')
const user = ref('')
const auto = ref(true)

const items = ref<AuditRecord[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const more = ref(false)

const filter = computed(() => ({
  cluster: allClusters.value ? undefined : (ctx.value.cluster ?? undefined),
  action: action.value ?? undefined,
  result: result.value ?? undefined,
  namespace: namespace.value.trim() || undefined,
  user: user.value.trim() || undefined,
  limit: PAGE,
}))

async function load(append = false) {
  loading.value = true
  try {
    const before = append ? items.value.at(-1)?.time : undefined
    const page = await listAudit({ ...filter.value, before })
    items.value = append ? [...items.value, ...page] : page
    more.value = page.length === PAGE
    error.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
watch(filter, () => load(), { immediate: true, deep: true })

let timer: ReturnType<typeof setInterval> | undefined
watch(
  auto,
  (on) => {
    clearInterval(timer)
    if (on) timer = setInterval(() => void load(), 5000)
  },
  { immediate: true },
)
onBeforeUnmount(() => clearInterval(timer))

const actions = ['apply', 'apply-force', 'scale', 'restart', 'delete', 'reveal', 'exec-open', 'exec-close']
const results = ['success', 'failure', 'conflict', 'denied', 'unknown']
const opts = (xs: string[], all: string) => [{ label: all, value: null as unknown as string }, ...xs.map((x) => ({ label: x, value: x }))]

const tone: Record<string, Tone> = { success: 'success', failure: 'error', conflict: 'warning', denied: 'error', unknown: 'default' }

const columns = computed<DataTableColumns<AuditRecord>>(() => [
  {
    key: 'time',
    title: 'Time',
    width: 190,
    render: (r) => `${new Date(r.time).toLocaleString()} (${age(r.time, now.value)})`,
  },
  { key: 'user', title: 'User', width: 80 },
  ...(allClusters.value ? [{ key: 'cluster', title: 'Cluster', width: 90 }] : []),
  { key: 'namespace', title: 'Namespace', width: 140, render: (r: AuditRecord) => r.namespace ?? '—' },
  { key: 'object', title: 'Resource', render: (r: AuditRecord) => `${r.kind}/${r.name}` },
  { key: 'action', title: 'Action', width: 110 },
  { key: 'result', title: 'Result', width: 100, render: (r: AuditRecord) => statusTag(r.result, tone[r.result] ?? 'default') },
  { key: 'detail', title: 'Detail', ellipsis: { tooltip: true }, render: (r: AuditRecord) => r.detail ?? '' },
])
</script>

<template>
  <div>
    <NH2 class="title">
      Audit
    </NH2>
    <NCard>
      <NSpace
        align="center"
        class="filters"
      >
        <NSelect
          v-model:value="action"
          :options="opts(actions, 'All actions')"
          size="small"
          class="select"
          data-test="audit-action"
        />
        <NSelect
          v-model:value="result"
          :options="opts(results, 'All results')"
          size="small"
          class="select"
        />
        <NInput
          v-model:value="namespace"
          size="small"
          clearable
          placeholder="Namespace"
          class="input"
        />
        <NInput
          v-model:value="user"
          size="small"
          clearable
          placeholder="User"
          class="input"
        />
        <NSwitch v-model:value="allClusters">
          <template #checked>
            All clusters
          </template>
          <template #unchecked>
            This cluster
          </template>
        </NSwitch>
        <NSwitch v-model:value="auto">
          <template #checked>
            Auto-refresh
          </template>
          <template #unchecked>
            Paused
          </template>
        </NSwitch>
        <NButton
          size="small"
          :loading="loading"
          @click="load()"
        >
          Refresh
        </NButton>
      </NSpace>
      <NAlert
        v-if="error"
        type="error"
        class="error"
      >
        {{ error }}
      </NAlert>
      <NDataTable
        size="small"
        :columns="columns"
        :data="items"
        :loading="loading && items.length === 0"
        :row-key="(r: AuditRecord) => r.id"
        :bordered="false"
        data-test="audit-table"
      />
      <NButton
        v-if="more"
        size="small"
        class="more"
        @click="load(true)"
      >
        Load older
      </NButton>
    </NCard>
  </div>
</template>

<style scoped>
.title {
  margin: 0 0 16px;
}
.filters {
  margin-bottom: 12px;
}
.select {
  width: 150px;
}
.input {
  width: 160px;
}
.error {
  margin-bottom: 8px;
}
.more {
  margin-top: 8px;
}
</style>
