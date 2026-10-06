<script setup lang="ts">
import { NAlert, NCard, NRadioButton, NRadioGroup, NSpin } from 'naive-ui'
import { onBeforeUnmount, ref, watch } from 'vue'
import { bytes, cores, metrics, RANGES, type Metrics, type RangeName } from './api'
import Chart from './Chart.vue'

// The Metrics tab on Pod, Deployment and Node pages.
const props = defineProps<{
  cluster: string
  resource: { type: { kind: string } }
  object: { metadata: { name: string; namespace?: string } }
}>()
const range = ref<RangeName>('1h')
const data = ref<Metrics | null>(null)
const error = ref<string | null>(null)
let timer: ReturnType<typeof setInterval> | undefined

async function load() {
  const kind = props.resource.type.kind.toLowerCase()
  try {
    data.value = await metrics(props.cluster, kind, props.object.metadata.namespace, props.object.metadata.name, range.value)
    error.value = null
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}
watch(
  () => [props.cluster, props.object.metadata.name, range.value],
  () => {
    data.value = null
    void load()
    clearInterval(timer)
    timer = setInterval(() => void load(), 30000)
  },
  { immediate: true },
)
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div data-test="monitoring-metrics">
    <NRadioGroup
      v-model:value="range"
      size="small"
      class="range"
    >
      <NRadioButton
        v-for="r in RANGES"
        :key="r"
        :value="r"
      >
        {{ r }}
      </NRadioButton>
    </NRadioGroup>
    <NAlert
      v-if="error"
      type="warning"
    >
      {{ error }}
    </NAlert>
    <NSpin v-else-if="!data" />
    <template v-else>
      <NCard
        title="CPU"
        size="small"
        class="card"
      >
        <Chart
          :series="data.cpu"
          :format="cores"
          :capacity="data.cpuCapacity"
        />
      </NCard>
      <NCard
        title="Memory (working set)"
        size="small"
        class="card"
      >
        <Chart
          :series="data.memory"
          :format="bytes"
          :capacity="data.memoryCapacity"
        />
      </NCard>
    </template>
  </div>
</template>

<style scoped>
.range {
  margin-bottom: 12px;
}
.card {
  margin-bottom: 12px;
}
</style>
