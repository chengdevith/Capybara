<script setup lang="ts">
import { NButton, NPopover } from 'naive-ui'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { listTools, type ToolLink } from '@/api/plugins'
import { clusterFromParams } from '@/composables/useExtensionContext'
import { usePluginsStore } from '@/stores/plugins'
import { mastheadButtonTheme } from './masthead'

// The tools launcher: web UIs that plugins installed and enabled on the
// current cluster bring (Grafana, Argo CD), opened in a new tab. Hidden when
// there are none.
const route = useRoute()
const plugins = usePluginsStore()
const cluster = computed(() => clusterFromParams(route.params))
const tools = ref<ToolLink[]>([])
const open = ref(false)

// Reload when the cluster changes, or when what is enabled there changes.
const key = computed(() => (cluster.value ? `${cluster.value}:${[...plugins.enabledOn(cluster.value)].sort().join(',')}` : ''))
watch(
  key,
  async (k) => {
    const id = cluster.value
    if (!k || !id) {
      tools.value = []
      return
    }
    try {
      const list = await listTools(id)
      if (cluster.value === id) tools.value = list
    } catch {
      tools.value = []
    }
  },
  { immediate: true },
)

// Simple marks; generic grid for unknown tools.
const icons: Record<string, { color: string; path: string }> = {
  grafana: { color: '#f46800', path: 'M4 19h16M7 16V9m5 7V5m5 11v-4' },
  argocd: { color: '#ef7b4d', path: 'M6 4v10a4 4 0 0 0 4 4h2M18 20v-6m0 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 4a2 2 0 1 0 0 0Z' },
}
const iconOf = (t: ToolLink) => icons[t.icon ?? ''] ?? { color: '#6a6e73', path: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z' }
</script>

<template>
  <NPopover
    v-if="tools.length"
    v-model:show="open"
    trigger="click"
    placement="bottom-end"
    :show-arrow="false"
  >
    <template #trigger>
      <NButton
        quaternary
        circle
        text-color="#ffffff"
        :theme-overrides="mastheadButtonTheme"
        class="masthead-button"
        native-focus-behavior
        aria-label="Tools"
        title="Tools"
        data-test="tools-launcher"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M3 3h4v4H3zM10 3h4v4h-4zM17 3h4v4h-4zM3 10h4v4H3zM10 10h4v4h-4zM17 10h4v4h-4zM3 17h4v4H3zM10 17h4v4h-4zM17 17h4v4h-4z" />
        </svg>
      </NButton>
    </template>
    <div
      class="launcher"
      data-test="tools-menu"
    >
      <div class="heading">
        Tools on {{ cluster }}
      </div>
      <a
        v-for="t in tools"
        :key="`${t.plugin}/${t.name}`"
        :href="t.url"
        target="_blank"
        rel="noopener noreferrer"
        class="tool"
        :data-test="`tool-${t.name}`"
        @click="open = false"
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          :stroke="iconOf(t).color"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        ><path :d="iconOf(t).path" /></svg>
        <span>{{ t.title }}</span>
      </a>
    </div>
  </NPopover>
</template>

<style scoped>
.launcher {
  display: grid;
  grid-template-columns: repeat(2, 120px);
  gap: 6px;
  padding: 4px;
}
.heading {
  grid-column: 1 / -1;
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 2px;
}
.tool {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border-radius: 6px;
  color: inherit;
  text-decoration: none;
  text-align: center;
}
.tool:hover,
.tool:focus-visible {
  background: rgba(127, 127, 127, 0.12);
}
</style>
