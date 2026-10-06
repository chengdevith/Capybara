<script setup lang="ts">
import { LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { init, use, type ECharts } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useThemeVars } from 'naive-ui'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Series } from './api'

use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer])

const props = defineProps<{ series: Series[]; format: (v: number) => string; capacity?: number }>()
const el = ref<HTMLDivElement | null>(null)
const theme = useThemeVars()
let chart: ECharts | undefined

function render() {
  if (!chart) return
  const text = theme.value.textColor3
  chart.setOption(
    {
      animation: false,
      grid: { left: 64, right: 16, top: 28, bottom: 28 },
      tooltip: { trigger: 'axis', valueFormatter: (v: unknown) => props.format(Number(v)) },
      legend: { type: 'scroll', top: 0, textStyle: { color: text } },
      xAxis: { type: 'time', axisLabel: { color: text } },
      yAxis: {
        type: 'value',
        max: props.capacity || undefined,
        axisLabel: { color: text, formatter: (v: number) => props.format(v) },
        splitLine: { lineStyle: { color: theme.value.dividerColor } },
      },
      series: props.series.map((s) => ({
        name: s.label,
        type: 'line',
        showSymbol: false,
        data: s.points.map(([t, v]) => [t * 1000, v]),
      })),
    },
    true,
  )
}

onMounted(() => {
  if (!el.value) return
  chart = init(el.value)
  render()
  window.addEventListener('resize', resize)
})
const resize = () => chart?.resize()
watch(() => [props.series, props.capacity, theme.value], render, { deep: false })
onBeforeUnmount(() => {
  window.removeEventListener('resize', resize)
  chart?.dispose()
})
</script>

<template>
  <div
    ref="el"
    class="chart"
  />
</template>

<style scoped>
.chart {
  width: 100%;
  height: 260px;
}
</style>
