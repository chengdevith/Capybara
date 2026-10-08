<script setup lang="ts">
import { NAlert, NEmpty, NSpin } from 'naive-ui'
import { computed } from 'vue'
import { api, APPLICATIONS, healthTag, isViewOnly, syncTag } from './argocd'

// A Project's Applications with their sync and health, live.
const props = defineProps<{ cluster: string; project: { metadata: { name: string }; spec: { namespace: string } } }>()
const { ResourceLink } = api().components
const { items, loading, error } = api().composables.useLiveList(
  () => ({ cluster: props.cluster, type: APPLICATIONS, namespace: props.project.spec.namespace }),
  { sort: (a, b) => a.metadata.name.localeCompare(b.metadata.name) },
)
const viewOnly = computed(() => isViewOnly(props.cluster))
</script>

<template>
  <div data-test="argocd-project-card">
    <NAlert
      v-if="viewOnly"
      type="info"
      class="gap"
    >
      View-only on this cluster.
    </NAlert>
    <span v-if="error">{{ error }}</span>
    <NSpin
      v-else-if="loading"
      size="small"
    />
    <NEmpty
      v-else-if="!items.length"
      size="small"
      description="No Applications in this Project yet."
    />
    <table v-else>
      <tr
        v-for="app in items"
        :key="app.metadata.uid"
      >
        <td>
          <component
            :is="ResourceLink"
            :cluster="cluster"
            resource="argocd.applications"
            :namespace="app.metadata.namespace"
            :name="app.metadata.name"
          />
        </td>
        <td><component :is="syncTag(app)" /></td>
        <td><component :is="healthTag(app)" /></td>
      </tr>
    </table>
    <div class="muted">
      Argo CD project: capybara-{{ project.metadata.name }}
    </div>
  </div>
</template>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
}
td {
  padding: 4px 8px 4px 0;
  white-space: nowrap;
}
.muted {
  opacity: 0.7;
  font-size: 12px;
  margin-top: 6px;
}
.gap {
  margin-bottom: 8px;
}
</style>
