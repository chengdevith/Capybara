<script setup lang="ts">
import {
  NAlert, NBreadcrumb, NBreadcrumbItem, NButton, NCard, NDataTable, NDescriptions, NDescriptionsItem,
  NH2, NResult, NSpace, NSpin, NTag, type DataTableColumns,
} from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { projectsSource, type Condition, type ManagedResource, type Project } from '@/api/projects'
import DeleteProjectDialog from '@/components/projects/DeleteProjectDialog.vue'
import EditProjectDialog from '@/components/projects/EditProjectDialog.vue'
import { phaseTone } from '@/components/projects/phase'
import LiveIndicator from '@/components/resource/LiveIndicator.vue'
import { age } from '@/components/resource/format'
import { statusTag } from '@/components/resource/render'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { useLiveList } from '@/composables/useLiveList'
import { useNow } from '@/composables/useNow'

const route = useRoute()
const ctx = useExtensionContext()
const now = useNow()
const { items, loading, error, live } = useLiveList(projectsSource, { flushMs: 0 })

const name = computed(() => String(route.params.name ?? ''))
const project = computed(() => (items.value as Project[]).find((p) => p.metadata.name === name.value) ?? null)
const seen = ref(false)
watch(project, (p) => {
  if (p) seen.value = true
})

const dialog = ref<'edit' | 'delete' | null>(null)
const upToDate = computed(() => project.value && project.value.status?.observedGeneration === project.value.metadata.generation)

const conditionColumns: DataTableColumns<Condition> = [
  { key: 'type', title: 'Condition', width: 150 },
  { key: 'status', title: 'Status', width: 80, render: (c) => statusTag(c.status, c.status === 'True' ? 'success' : 'error') },
  { key: 'reason', title: 'Reason', width: 170 },
  { key: 'message', title: 'Message', render: (c) => c.message || '—' },
  { key: 'since', title: 'Since', width: 80, render: (c) => age(c.lastTransitionTime, now.value) },
]

const resourceColumns: DataTableColumns<ManagedResource> = [
  { key: 'kind', title: 'Kind', width: 150 },
  { key: 'name', title: 'Name' },
]

const namespaceLink = computed(() =>
  project.value
    ? { name: 'core.namespaces.detail', params: { cluster: project.value.spec.cluster, name: project.value.spec.namespace } }
    : null,
)
</script>

<template>
  <div>
    <NBreadcrumb class="crumbs">
      <NBreadcrumbItem>
        <RouterLink :to="{ name: 'core.projects', params: { cluster: ctx.cluster } }">
          Projects
        </RouterLink>
      </NBreadcrumbItem>
      <NBreadcrumbItem>{{ name }}</NBreadcrumbItem>
    </NBreadcrumb>

    <div class="page-header">
      <NTag
        size="small"
        type="info"
        :bordered="false"
      >
        Project
      </NTag>
      <NH2 class="title">
        {{ project?.spec.displayName || name }}
      </NH2>
      <component
        :is="statusTag(project.status?.phase ?? 'Pending', phaseTone(project))"
        v-if="project"
        data-test="project-phase"
      />
      <LiveIndicator
        :live="live"
        :loading="loading"
      />
      <span class="spacer" />
      <NSpace v-if="project && !project.metadata.deletionTimestamp">
        <NButton
          data-test="project-edit"
          @click="dialog = 'edit'"
        >
          Edit
        </NButton>
        <NButton
          type="error"
          ghost
          data-test="project-delete"
          @click="dialog = 'delete'"
        >
          Delete
        </NButton>
      </NSpace>
    </div>

    <NSpin v-if="loading && !project" />
    <NAlert
      v-else-if="!project && error"
      type="warning"
    >
      {{ error }}
    </NAlert>
    <NResult
      v-else-if="!project"
      status="404"
      :title="seen ? 'This Project was deleted' : 'Project not found'"
      :description="seen ? 'Its namespace has been removed from the cluster.' : `No Project named “${name}”.`"
    />
    <div
      v-else
      class="grid"
    >
      <NCard
        title="Details"
        size="small"
      >
        <NDescriptions
          :column="1"
          label-placement="left"
          size="small"
        >
          <NDescriptionsItem label="Name">
            {{ project.metadata.name }}
          </NDescriptionsItem>
          <NDescriptionsItem
            v-if="project.spec.description"
            label="Description"
          >
            {{ project.spec.description }}
          </NDescriptionsItem>
          <NDescriptionsItem label="Cluster">
            {{ project.spec.cluster }}
          </NDescriptionsItem>
          <NDescriptionsItem label="Namespace">
            <RouterLink
              v-if="namespaceLink"
              :to="namespaceLink"
            >
              {{ project.spec.namespace }}
            </RouterLink>
          </NDescriptionsItem>
          <NDescriptionsItem label="Owner group">
            {{ project.spec.owner }} <span class="muted">(admin role in the namespace)</span>
          </NDescriptionsItem>
          <NDescriptionsItem label="Size">
            {{ project.spec.size }}
          </NDescriptionsItem>
          <NDescriptionsItem label="Reconciled">
            <span v-if="upToDate">Up to date (generation {{ project.metadata.generation }})</span>
            <span v-else>Updating: generation {{ project.metadata.generation }}, last reconciled
              {{ project.status?.observedGeneration ?? '—' }}</span>
          </NDescriptionsItem>
          <NDescriptionsItem label="Created">
            {{ age(project.metadata.creationTimestamp, now) }} ago
          </NDescriptionsItem>
        </NDescriptions>
      </NCard>

      <NCard
        title="Conditions"
        size="small"
      >
        <NDataTable
          size="small"
          :columns="conditionColumns"
          :data="project.status?.conditions ?? []"
          :bordered="false"
          data-test="project-conditions"
        />
      </NCard>

      <NCard
        title="Resources in the cluster"
        size="small"
        class="wide"
      >
        <NAlert
          type="info"
          class="note"
          data-test="baseline-note"
        >
          Managed by Capybara. The baseline NetworkPolicies (deny ingress by default, allow the same namespace and
          the ingress controllers), the quota, the limits and the owner RoleBinding are restored by the controller if
          they are removed or changed.
        </NAlert>
        <NDataTable
          size="small"
          :columns="resourceColumns"
          :data="project.status?.resources ?? []"
          :bordered="false"
          data-test="project-resources"
        />
      </NCard>
    </div>

    <EditProjectDialog
      v-if="dialog === 'edit' && project"
      :project="project"
      @close="dialog = null"
    />
    <DeleteProjectDialog
      v-if="dialog === 'delete' && project"
      :project="project"
      @close="dialog = null"
    />
  </div>
</template>

<style scoped>
.crumbs {
  margin-bottom: 8px;
}
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.title {
  margin: 0;
}
.spacer {
  flex: 1;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
  gap: 16px;
}
.wide {
  grid-column: 1 / -1;
}
.muted {
  color: var(--capy-text-muted);
}
.note {
  margin-bottom: 8px;
}
</style>
