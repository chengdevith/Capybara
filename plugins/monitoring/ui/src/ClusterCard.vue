<script setup lang="ts">
import { NProgress, NSpin } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { bytes, cores, overview, type Overview } from './api'

const props = defineProps<{ cluster: string }>()
const data = ref<Overview | null>(null)
const error = ref<string | null>(null)
onMounted(async () => {
  try {
    data.value = await overview(props.cluster)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
})
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0)
</script>

<template>
  <div data-test="monitoring-cluster-card">
    <span v-if="error">{{ error }}</span>
    <NSpin
      v-else-if="!data"
      size="small"
    />
    <template v-else>
      <div>CPU {{ cores(data.cpuUsed) }} of {{ cores(data.cpuCapacity) }}</div>
      <NProgress
        type="line"
        :percentage="pct(data.cpuUsed, data.cpuCapacity)"
      />
      <div>Memory {{ bytes(data.memoryUsed) }} of {{ bytes(data.memoryCapacity) }}</div>
      <NProgress
        type="line"
        :percentage="pct(data.memoryUsed, data.memoryCapacity)"
      />
      <div class="muted">
        {{ data.targetsUp }} scrape targets up, {{ data.targetsDown }} down
      </div>
    </template>
  </div>
</template>

<style scoped>
.muted {
  opacity: 0.7;
  font-size: 12px;
  margin-top: 6px;
}
</style>
