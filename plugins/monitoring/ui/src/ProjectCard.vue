<script setup lang="ts">
import { NProgress, NSpin, useThemeVars } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { bytes, cores, usage } from './api'

// Quota vs usage for a Project's namespace: the quota from the cluster
// (Capybara's read-only passthrough), the usage from Prometheus.
const props = defineProps<{ cluster: string; project: { spec: { namespace: string } } }>()
interface Quota { hard?: Record<string, string>; used?: Record<string, string> }
const quota = ref<Quota | null>(null)
const used = ref<{ cpu: number; memory: number; pods: number } | null>(null)
const error = ref<string | null>(null)

function parseCPU(q?: string): number {
  if (!q) return 0
  return q.endsWith('m') ? Number(q.slice(0, -1)) / 1000 : Number(q)
}
function parseBytes(q?: string): number {
  if (!q) return 0
  const m = /^([0-9.]+)([KMGT]i?)?$/.exec(q)
  if (!m) return 0
  const pow: Record<string, number> = { K: 1e3, M: 1e6, G: 1e9, T: 1e12, Ki: 1024, Mi: 1024 ** 2, Gi: 1024 ** 3, Ti: 1024 ** 4 }
  return Number(m[1]) * (m[2] ? (pow[m[2]] ?? 1) : 1)
}

onMounted(async () => {
  const ns = props.project.spec.namespace
  try {
    const [q, u] = await Promise.all([
      fetch(`/api/clusters/${encodeURIComponent(props.cluster)}/k8s/api/v1/namespaces/${encodeURIComponent(ns)}/resourcequotas/capybara-project-quota`).then((r) =>
        r.ok ? (r.json() as Promise<{ status?: Quota }>) : { status: undefined },
      ),
      usage(props.cluster, ns),
    ])
    quota.value = q.status ?? {}
    used.value = u
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
})
const pct = (a: number, b: number) => (b > 0 ? Math.min(100, Math.round((a / b) * 100)) : 0)
// Follow the console theme (Naive's progress default is its info blue).
const themeVars = useThemeVars()
</script>

<template>
  <div data-test="monitoring-project-card">
    <span v-if="error">{{ error }}</span>
    <NSpin
      v-else-if="!used || !quota"
      size="small"
    />
    <template v-else>
      <div>CPU in use {{ cores(used.cpu) }} · limit {{ quota.hard?.['limits.cpu'] ?? '—' }}</div>
      <NProgress
        type="line"
        :color="themeVars.primaryColor"
        :percentage="pct(used.cpu, parseCPU(quota.hard?.['limits.cpu']))"
      />
      <div>Memory in use {{ bytes(used.memory) }} · limit {{ quota.hard?.['limits.memory'] ?? '—' }}</div>
      <NProgress
        type="line"
        :color="themeVars.primaryColor"
        :percentage="pct(used.memory, parseBytes(quota.hard?.['limits.memory']))"
      />
      <div class="muted">
        {{ used.pods }} pod(s) running of {{ quota.hard?.pods ?? '—' }} allowed
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
