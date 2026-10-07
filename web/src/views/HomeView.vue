<script setup lang="ts">
import ExtensionHost from '@/components/extensions/ExtensionHost.vue'
import { NAlert, NCard, NGrid, NGridItem, NH1, NTag } from 'naive-ui'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { clusterOverview, type ClusterOverview } from '@/api/clusters'
import EnvironmentTag from '@/components/clusters/EnvironmentTag.vue'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { byOrder, useRegistry } from '@/extensions'
import { useClustersStore } from '@/stores/clusters'

// The cluster overview. Every card is a cluster-overview-card extension;
// they share one overview request, refreshed with the cluster list.
const registry = useRegistry()
const ctx = useExtensionContext()
const clusters = useClustersStore()
const cluster = computed(() => clusters.byId(ctx.value.cluster))

const cards = computed(() => registry.active('cluster-overview-card', ctx.value).sort(byOrder))

const overview = shallowRef<ClusterOverview | null>(null)
const error = shallowRef<string | null>(null)
let abort: AbortController | null = null
async function load() {
  const id = ctx.value.cluster
  if (!id) return
  abort?.abort()
  abort = new AbortController()
  try {
    overview.value = await clusterOverview(id, abort.signal)
    error.value = null
  } catch (e) {
    if ((e as Error).name === 'AbortError') return
    error.value = e instanceof Error ? e.message : String(e)
  }
}
// Reload when the cluster's recorded health changes (e.g. it comes back).
watch(
  () => [ctx.value.cluster, cluster.value?.status.lastChecked, cluster.value?.status.phase],
  () => void load(),
  { immediate: true },
)
onBeforeUnmount(() => abort?.abort())
</script>

<template>
  <div v-if="cluster">
    <div class="page-header">
      <NH1 class="title">
        {{ cluster.displayName || cluster.id }}
      </NH1>
      <EnvironmentTag :environment="cluster.environment" />
      <NTag
        size="small"
        :bordered="false"
      >
        {{ cluster.id }}
      </NTag>
    </div>
    <NAlert
      v-if="error"
      type="warning"
      class="error"
    >
      {{ error }}
    </NAlert>
    <NGrid
      cols="1 m:2 l:3"
      responsive="screen"
      :x-gap="16"
      :y-gap="16"
    >
      <NGridItem
        v-for="card in cards"
        :key="card.id"
      >
        <NCard
          :title="card.title"
          size="small"
          class="card"
          :data-test="`overview-card-${card.id}`"
        >
          <ExtensionHost
            :id="card.id"
            :source="card.source"
            :label="`${card.title} card`"
            :component="card.component"
            :cluster="cluster.id"
            :overview="overview"
          />
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.title {
  margin: 0;
}
.error {
  margin-bottom: 12px;
}
.card {
  height: 100%;
}
</style>
