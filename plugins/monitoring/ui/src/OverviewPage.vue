<script setup lang="ts">
import { useCluster } from '@capybara/sdk'
import { NAlert, NButton, NCard, NGrid, NGridItem, NH2, NProgress, NSpace, NStatistic } from 'naive-ui'
import { onBeforeUnmount, ref, watch } from 'vue'
import { bytes, cores, grafanaURL, overview, status, type Overview } from './api'

const cluster = useCluster()
const data = ref<Overview | null>(null)
const version = ref('')
const error = ref<string | null>(null)
let timer: ReturnType<typeof setInterval> | undefined

async function load() {
  if (!cluster.value) return
  try {
    const [o, s] = await Promise.all([overview(cluster.value), status(cluster.value)])
    data.value = o
    version.value = s.version
    error.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}
watch(cluster, () => {
  void load()
  clearInterval(timer)
  timer = setInterval(() => void load(), 30000)
}, { immediate: true })
onBeforeUnmount(() => clearInterval(timer))
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0)
</script>

<template>
  <div data-test="monitoring-overview">
    <NSpace
      align="center"
      justify="space-between"
    >
      <NH2>Observe</NH2>
      <NButton
        v-if="cluster"
        tag="a"
        :href="grafanaURL(cluster)"
        target="_blank"
        rel="noopener"
      >
        Open Grafana
      </NButton>
    </NSpace>
    <NAlert
      v-if="error"
      type="warning"
    >
      {{ error }}
    </NAlert>
    <NGrid
      v-if="data"
      cols="1 m:3"
      responsive="screen"
      :x-gap="16"
      :y-gap="16"
    >
      <NGridItem>
        <NCard
          title="CPU"
          size="small"
        >
          <NStatistic :value="`${cores(data.cpuUsed)} of ${cores(data.cpuCapacity)}`" />
          <NProgress
            type="line"
            :percentage="pct(data.cpuUsed, data.cpuCapacity)"
          />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard
          title="Memory"
          size="small"
        >
          <NStatistic :value="`${bytes(data.memoryUsed)} of ${bytes(data.memoryCapacity)}`" />
          <NProgress
            type="line"
            :percentage="pct(data.memoryUsed, data.memoryCapacity)"
          />
        </NCard>
      </NGridItem>
      <NGridItem>
        <NCard
          title="Scrape targets"
          size="small"
        >
          <NStatistic
            :value="`${data.targetsUp} up, ${data.targetsDown} down`"
            data-test="targets"
          />
          <span class="muted">Prometheus {{ version }}</span>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<style scoped>
.muted {
  opacity: 0.7;
  font-size: 12px;
}
</style>
