<script setup lang="ts">
import { NSelect } from 'naive-ui'
import { computed } from 'vue'
import { statusLabel } from '@/api/clusters'
import EnvironmentTag from '@/components/clusters/EnvironmentTag.vue'
import { useRoute, useRouter } from 'vue-router'
import { clusterFromParams } from '@/composables/useExtensionContext'
import { useClustersStore } from '@/stores/clusters'

const route = useRoute()
const router = useRouter()
const clusters = useClustersStore()

const current = computed(() => clusterFromParams(route.params))
const selected = computed(() => clusters.byId(current.value))
// Clusters in Error stay selectable: their pages explain what is wrong.
const options = computed(() =>
  clusters.items.map((c) => ({
    label: `${c.displayName || c.id} · ${c.environment}${c.status.phase === 'Error' ? ` (${statusLabel(c)})` : ''}`,
    value: c.id,
  })),
)

/** Stay on the same kind of page in the other cluster: detail pages go to
 * their list (the object is unlikely to exist there), and the namespace
 * filter is dropped. From a global page, go to the cluster's landing page. */
function switchTo(id: string) {
  if (current.value && route.name) {
    const parent = typeof route.meta.parent === 'string' ? route.meta.parent : null
    void router.push(parent ? { name: parent, params: { cluster: id } } : { name: route.name, params: { ...route.params, cluster: id } })
  } else {
    void router.push(`/c/${encodeURIComponent(id)}`)
  }
}
</script>

<template>
  <NSelect
    data-test="cluster-switcher"
    class="cluster-switcher"
    size="small"
    placeholder="Select cluster"
    :value="current"
    :options="options"
    :loading="clusters.loading"
    :consistent-menu-width="false"
    @update:value="switchTo"
  />
  <EnvironmentTag
    v-if="selected"
    :environment="selected.environment"
    data-test="current-environment"
  />
</template>

<style scoped>
.cluster-switcher {
  width: 200px;
  min-width: 110px;
  flex: 0 1 200px;
}
</style>
