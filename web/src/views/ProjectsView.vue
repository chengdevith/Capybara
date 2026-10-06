<script setup lang="ts">
import { NAlert, NButton, NCard, NDataTable, NH2, NSpace, NSwitch, type DataTableColumns } from 'naive-ui'
import { computed, h, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import type { KubeObject } from '@/api/k8s'
import { projectsSource, readyCondition, type Project } from '@/api/projects'
import CreateProjectDialog from '@/components/projects/CreateProjectDialog.vue'
import { phaseTone } from '@/components/projects/phase'
import LiveIndicator from '@/components/resource/LiveIndicator.vue'
import { age } from '@/components/resource/format'
import { statusTag } from '@/components/resource/render'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { useLiveList } from '@/composables/useLiveList'
import { useNow } from '@/composables/useNow'

const ctx = useExtensionContext()
const router = useRouter()
const now = useNow()
const { items, loading, error, live } = useLiveList(projectsSource)

const allClusters = ref(false)
const creating = ref(false)

const projects = computed(() =>
  (items.value as Project[]).filter((p) => allClusters.value || p.spec.cluster === ctx.value.cluster),
)

const link = (p: Project) =>
  h(RouterLink, { to: { name: 'core.projects.detail', params: { cluster: ctx.value.cluster, name: p.metadata.name } } }, () => p.metadata.name)

const columns = computed<DataTableColumns<Project>>(() => [
  { key: 'name', title: 'Name', render: link, sorter: (a, b) => a.metadata.name.localeCompare(b.metadata.name) },
  { key: 'display', title: 'Display name', render: (p) => p.spec.displayName || '—' },
  ...(allClusters.value ? [{ key: 'cluster', title: 'Cluster', render: (p: Project) => p.spec.cluster }] : []),
  { key: 'namespace', title: 'Namespace', render: (p) => p.spec.namespace },
  { key: 'size', title: 'Size', width: 60, render: (p) => p.spec.size },
  { key: 'owner', title: 'Owner group', render: (p) => p.spec.owner },
  {
    key: 'status',
    title: 'Status',
    render: (p) => {
      const c = readyCondition(p)
      const label = p.status?.phase ?? 'Pending'
      return h('span', { class: 'status' }, [
        statusTag(label, phaseTone(p)),
        c && c.reason !== 'Reconciled' ? h('span', { class: 'reason', title: c.message }, ` ${c.reason}`) : null,
      ])
    },
  },
  { key: 'age', title: 'Age', width: 70, render: (p) => age(p.metadata.creationTimestamp, now.value) },
])

function created(name: string) {
  creating.value = false
  void router.push({ name: 'core.projects.detail', params: { cluster: ctx.value.cluster, name } })
}
</script>

<template>
  <div>
    <div class="page-header">
      <NH2 class="title">
        Projects
      </NH2>
      <LiveIndicator
        :live="live"
        :loading="loading"
      />
      <span class="spacer" />
      <NButton
        type="primary"
        data-test="create-project"
        @click="creating = true"
      >
        Create Project
      </NButton>
    </div>
    <NAlert
      v-if="error"
      type="warning"
      class="error"
    >
      {{ error }}
    </NAlert>
    <NCard>
      <NSpace
        align="center"
        class="toolbar"
      >
        <NSwitch v-model:value="allClusters">
          <template #checked>
            All clusters
          </template>
          <template #unchecked>
            This cluster
          </template>
        </NSwitch>
        <span class="count">{{ projects.length }} {{ projects.length === 1 ? 'Project' : 'Projects' }}</span>
      </NSpace>
      <NDataTable
        size="small"
        :columns="columns"
        :data="projects"
        :loading="loading && projects.length === 0"
        :row-key="(p: KubeObject) => p.metadata.uid"
        :bordered="false"
        data-test="projects-table"
      />
    </NCard>
    <CreateProjectDialog
      v-if="creating && ctx.cluster"
      :cluster="ctx.cluster"
      @close="creating = false"
      @created="created"
    />
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}
.title {
  margin: 0;
}
.spacer {
  flex: 1;
}
.toolbar {
  margin-bottom: 12px;
}
.count {
  color: var(--capy-text-muted);
  font-size: 13px;
}
.error {
  margin-bottom: 12px;
}
:deep(.reason) {
  color: var(--capy-text-muted);
  font-size: 12px;
}
</style>
