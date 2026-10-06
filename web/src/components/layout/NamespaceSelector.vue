<script setup lang="ts">
import { NSelect } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { projectsSource, type Project } from '@/api/projects'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { useLiveList } from '@/composables/useLiveList'
import { useNamespace } from '@/composables/useNamespace'
import { namespaces } from '@/extensions/core/resources/namespaces'

// Live namespace list for the current cluster, or (project view) the
// cluster's Projects, each standing for its namespace. Either way the
// choice is the ?ns= filter. The view is remembered per browser.
const ctx = useExtensionContext()
const { namespace, setNamespace } = useNamespace()

type Mode = 'namespaces' | 'projects'
const MODE_KEY = 'capybara.namespaceSelector.mode'
function readMode(): Mode {
  try {
    return localStorage.getItem(MODE_KEY) === 'projects' ? 'projects' : 'namespaces'
  } catch {
    return 'namespaces'
  }
}
const mode = ref<Mode>(readMode())
watch(mode, (m) => {
  try {
    localStorage.setItem(MODE_KEY, m)
  } catch {
    // not persisted
  }
})

const nsSource = computed(() =>
  ctx.value.cluster && mode.value === 'namespaces' ? { cluster: ctx.value.cluster, type: namespaces.type } : null,
)
const nsList = useLiveList(nsSource)
const projectList = useLiveList(() => (mode.value === 'projects' ? projectsSource : null))

const ALL = '__all__'
const options = computed(() => {
  const all = { label: mode.value === 'projects' ? 'All projects' : 'All namespaces', value: ALL }
  if (mode.value === 'namespaces') {
    return [all, ...nsList.items.value.map((n) => ({ label: n.metadata.name, value: n.metadata.name }))]
  }
  const projects = (projectList.items.value as Project[]).filter((p) => p.spec.cluster === ctx.value.cluster)
  return [
    all,
    ...projects.map((p) => ({
      label: `${p.spec.displayName || p.metadata.name} (${p.spec.namespace})`,
      value: p.spec.namespace,
    })),
  ]
})
const value = computed(() => namespace.value ?? ALL)
const modeOptions = [
  { label: 'Namespaces', value: 'namespaces' },
  { label: 'Projects', value: 'projects' },
]
</script>

<template>
  <div
    v-if="ctx.cluster"
    class="selector"
  >
    <NSelect
      v-model:value="mode"
      class="mode"
      size="small"
      :options="modeOptions"
      data-test="selector-mode"
    />
    <NSelect
      class="ns-selector"
      size="small"
      filterable
      :value="value"
      :options="options"
      :loading="mode === 'namespaces' ? nsList.loading.value : projectList.loading.value"
      :consistent-menu-width="false"
      data-test="namespace-selector"
      @update:value="(v: string) => setNamespace(v === ALL ? null : v)"
    />
  </div>
</template>

<style scoped>
.selector {
  display: flex;
  gap: 4px;
}
.mode {
  width: 120px;
}
.ns-selector {
  width: 240px;
}
</style>
