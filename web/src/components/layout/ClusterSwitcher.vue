<script setup lang="ts">
import { NSelect } from 'naive-ui'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clusterFromParams } from '@/composables/useExtensionContext'
import { useClustersStore } from '@/stores/clusters'

const route = useRoute()
const router = useRouter()
const clusters = useClustersStore()

const current = computed(() => clusterFromParams(route.params))
const options = computed(() =>
  clusters.items.map((c) => ({
    label: `${c.displayName}${c.status.phase === 'Connected' ? '' : ' (unreachable)'}`,
    value: c.id,
  })),
)

/** Stay on the same page in the other cluster; from a global page, go to
 * the cluster's landing page. */
function switchTo(id: string) {
  if (current.value && route.name) {
    void router.push({ name: route.name, params: { ...route.params, cluster: id }, query: route.query })
  } else {
    void router.push(`/c/${encodeURIComponent(id)}`)
  }
}
</script>

<template>
  <NSelect
    class="cluster-switcher"
    size="small"
    placeholder="Select cluster"
    :value="current"
    :options="options"
    :loading="clusters.loading"
    :consistent-menu-width="false"
    @update:value="switchTo"
  />
</template>

<style scoped>
.cluster-switcher {
  width: 200px;
}
</style>
