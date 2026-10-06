<script setup lang="ts">
import { NAlert, NButton, NCard, NCollapse, NCollapseItem, NH2, NResult, NSpace, NTag } from 'naive-ui'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import InstallDialog from '@/components/plugins/InstallDialog.vue'
import InstallationCard from '@/components/plugins/InstallationCard.vue'
import RuleList from '@/components/plugins/RuleList.vue'
import { getPlugin, type CatalogEntry } from '@/api/plugins'
import { usePluginsStore } from '@/stores/plugins'

const route = useRoute()
const plugins = usePluginsStore()
const name = computed(() => String(route.params.name ?? ''))
const detail = ref<CatalogEntry | null>(null)
const notFound = ref(false)
const installing = ref(false)

// The catalog entry (with installations) comes from the store, refreshed
// quickly while something is in progress; installer rules from the API.
const plugin = computed(() => plugins.catalog.find((p) => p.name === name.value) ?? null)
const busy = computed(() => plugin.value?.installations.some((i) => i.deleting || !['Ready', 'Disabled', 'Error'].includes(i.status.phase ?? '')))
let timer: ReturnType<typeof setInterval> | undefined
watch(
  busy,
  (b) => {
    clearInterval(timer)
    if (b) timer = setInterval(() => void plugins.load(), 2000)
  },
  { immediate: true },
)
onBeforeUnmount(() => clearInterval(timer))
onMounted(async () => {
  void plugins.load()
  try {
    detail.value = await getPlugin(name.value)
  } catch {
    notFound.value = true
  }
})
const loadError = computed(() => plugins.loadErrors[name.value])
</script>

<template>
  <div v-if="plugin">
    <div class="page-header">
      <img
        v-if="plugin.spec.icon"
        :src="plugin.spec.icon"
        alt=""
        width="36"
        height="36"
      >
      <NH2 class="title">
        {{ plugin.spec.displayName }}
      </NH2>
      <NTag
        size="small"
        :bordered="false"
      >
        v{{ plugin.spec.version }}
      </NTag>
      <NTag
        v-if="plugin.ui?.dev"
        size="small"
        type="warning"
        :bordered="false"
      >
        dev bundle (unpinned)
      </NTag>
      <span class="spacer" />
      <NButton
        type="primary"
        :disabled="!plugin.status.available"
        data-test="install-plugin"
        @click="installing = true"
      >
        Install on a cluster
      </NButton>
    </div>
    <p>{{ plugin.spec.description }}</p>
    <NAlert
      v-if="!plugin.status.available"
      type="error"
      title="Not installable"
      class="block"
    >
      {{ plugin.status.problem }}
    </NAlert>
    <NAlert
      v-if="loadError"
      type="warning"
      title="The plugin's UI could not be loaded"
      class="block"
      data-test="ui-load-error"
    >
      {{ loadError }}
    </NAlert>

    <NSpace
      vertical
      :size="12"
      class="block"
    >
      <InstallationCard
        v-for="inst in plugin.installations"
        :key="inst.id"
        :plugin="plugin"
        :installation="inst"
      />
    </NSpace>

    <NCard
      title="Before you install"
      size="small"
    >
      <NCollapse :default-expanded-names="['install']">
        <NCollapseItem
          v-for="mode in plugin.spec.modes"
          :key="mode"
          :name="mode"
          :title="mode === 'install' ? 'Install mode: the installer credential needs' : 'Connect existing: the installer credential needs'"
        >
          <RuleList
            :rules="detail?.installerRules?.[mode]?.clusterRules"
            scope="cluster-wide"
          />
          <RuleList
            v-if="detail?.installerRules?.[mode]?.namespaceRules?.length"
            :rules="detail?.installerRules?.[mode]?.namespaceRules"
            scope="plugin namespace"
          />
        </NCollapseItem>
        <NCollapseItem
          name="backend"
          title="The plugin's backend may reach"
        >
          <ul class="list">
            <li
              v-for="s in plugin.spec.permissions?.services ?? []"
              :key="s.name"
            >
              <strong>{{ s.name }}</strong>: {{ s.methods.join(', ') }} on {{ s.paths.join(', ') }}
              <span v-if="s.modes"> ({{ s.modes.join(', ') }} mode)</span>
            </li>
          </ul>
          <p class="muted">
            Only on clusters where the plugin is installed and enabled, through the Kubernetes service proxy, with an
            account allowed nothing else. UI bundles run inside the console with its full access (no sandbox yet).
          </p>
        </NCollapseItem>
        <NCollapseItem
          v-if="plugin.spec.chart"
          name="chart"
          title="What install mode deploys"
        >
          Chart {{ plugin.spec.chart.releaseName }} {{ plugin.spec.chart.version }} (sha256
          {{ plugin.spec.chart.sha256.slice(0, 12) }}…) into namespace {{ plugin.spec.chart.namespace }}.
          <span v-if="plugin.spec.chart.refuseInstallOn?.length">Refused on {{ plugin.spec.chart.refuseInstallOn.join(', ') }}: connect instead.</span>
        </NCollapseItem>
      </NCollapse>
    </NCard>

    <InstallDialog
      v-if="installing"
      :plugin="plugin"
      @close="installing = false"
      @installed="installing = false"
    />
  </div>
  <NResult
    v-else-if="notFound || plugins.loaded"
    status="404"
    title="Plugin not found"
  />
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.title {
  margin: 0;
}
.spacer {
  flex: 1;
}
.block {
  margin: 12px 0;
}
.list {
  padding-left: 18px;
}
.muted {
  opacity: 0.75;
  font-size: 13px;
}
</style>
