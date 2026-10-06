<script setup lang="ts">
import { NAlert, NButton, NCard, NDataTable, NEmpty, NH2, type DataTableColumns } from 'naive-ui'
import { computed, h, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { expiresInDays, type Cluster } from '@/api/clusters'
import AddClusterDialog from '@/components/clusters/AddClusterDialog.vue'
import ClusterStatusTag from '@/components/clusters/ClusterStatusTag.vue'
import EnvironmentTag from '@/components/clusters/EnvironmentTag.vue'
import { age } from '@/components/resource/format'
import { useNow } from '@/composables/useNow'
import { useClustersStore } from '@/stores/clusters'

const clusters = useClustersStore()
const router = useRouter()
const now = useNow()
const adding = ref(false)

const expiry = (c: Cluster) => {
  const d = expiresInDays(c, now.value)
  if (d === null) return '—'
  const text = d < 0 ? 'expired' : `${d} day(s)`
  return d < 7 ? h('span', { class: 'warn' }, text) : text
}

const columns = computed<DataTableColumns<Cluster>>(() => [
  {
    key: 'name',
    title: 'Name',
    render: (c) =>
      h(RouterLink, { to: { name: 'core.clusters.detail', params: { id: c.id } }, 'data-test': `cluster-link-${c.id}` }, () =>
        c.displayName || c.id,
      ),
  },
  { key: 'id', title: 'ID', render: (c) => c.id },
  { key: 'env', title: 'Environment', render: (c) => h(EnvironmentTag, { environment: c.environment }) },
  { key: 'status', title: 'Status', render: (c) => h('span', { 'data-test': `status-${c.id}` }, [h(ClusterStatusTag, { cluster: c })]) },
  { key: 'version', title: 'Kubernetes', render: (c) => c.status.version ?? '—' },
  { key: 'nodes', title: 'Nodes', width: 70, render: (c) => (c.status.nodeCount ?? '—').toString() },
  { key: 'expires', title: 'Credentials expire', render: expiry },
  { key: 'checked', title: 'Last checked', render: (c) => (c.status.lastChecked ? `${age(c.status.lastChecked, now.value)} ago` : '—') },
  {
    key: 'open',
    title: '',
    width: 90,
    render: (c) =>
      h(NButton, { size: 'small', onClick: () => void router.push(`/c/${encodeURIComponent(c.id)}`) }, () => 'Open'),
  },
])

function created(id: string) {
  adding.value = false
  void router.push({ name: 'core.clusters.detail', params: { id } })
}
</script>

<template>
  <div>
    <div class="page-header">
      <NH2 class="title">
        Clusters
      </NH2>
      <span class="spacer" />
      <NButton
        v-if="clusters.items.length"
        type="primary"
        data-test="add-cluster"
        @click="adding = true"
      >
        Add cluster
      </NButton>
    </div>
    <NAlert
      v-if="clusters.error"
      type="error"
      class="error"
    >
      {{ clusters.error }}
    </NAlert>
    <NCard>
      <NEmpty
        v-if="clusters.loaded && !clusters.error && clusters.items.length === 0"
        description="No clusters are registered yet."
        class="empty"
      >
        <template #extra>
          <NButton
            type="primary"
            data-test="add-first-cluster"
            @click="adding = true"
          >
            Add your first cluster
          </NButton>
        </template>
      </NEmpty>
      <NDataTable
        v-else
        :columns="columns"
        :data="clusters.items"
        :loading="!clusters.loaded"
        :row-key="(c: Cluster) => c.id"
        size="small"
      />
    </NCard>
    <AddClusterDialog
      v-if="adding"
      @close="adding = false"
      @created="created"
    />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
}
.title {
  margin: 0 0 16px;
}
.spacer {
  flex: 1;
}
.error {
  margin-bottom: 12px;
}
.empty {
  padding: 32px 0;
}
:deep(.warn) {
  color: #d03050;
  font-weight: 600;
}
</style>
