<script setup lang="ts">
import { NAlert, NButton, NResult, NSpin } from 'naive-ui'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { clusterFromParams } from '@/composables/useExtensionContext'
import { useClustersStore } from '@/stores/clusters'

// Wraps every /c/:cluster page: the cluster must be registered before the
// page renders.
const route = useRoute()
const clusters = useClustersStore()
const id = computed(() => clusterFromParams(route.params))
const cluster = computed(() => clusters.byId(id.value))
</script>

<template>
  <NSpin v-if="!clusters.loaded" />
  <NAlert
    v-else-if="clusters.error"
    type="error"
    title="Could not load clusters"
  >
    {{ clusters.error }}
  </NAlert>
  <NResult
    v-else-if="!cluster"
    status="404"
    title="Cluster not found"
    :description="`No cluster with id “${id}” is registered.`"
  >
    <template #footer>
      <NButton @click="$router.push({ name: 'core.clusters' })">
        All clusters
      </NButton>
    </template>
  </NResult>
  <RouterView
    v-else
    :key="cluster.id"
  />
</template>
