<script setup lang="ts">
import { NAlert, NLayout, NLayoutContent, NLayoutHeader, NLayoutSider } from 'naive-ui'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useExtensionContext } from '@/composables/useExtensionContext'
import { useClustersStore } from '@/stores/clusters'
import { useHealthStore } from '@/stores/health'
import { usePluginsStore } from '@/stores/plugins'
import AppSidebar from './AppSidebar.vue'
import TopBar from './TopBar.vue'

const clusters = useClustersStore()
const health = useHealthStore()
const ctx = useExtensionContext()
const plugins = usePluginsStore()
// Plugins enabled on this cluster whose UI bundle failed to load.
const brokenPlugins = computed(() =>
  [...plugins.enabledOn(ctx.value.cluster)].filter((n) => plugins.loadErrors[n]).map((n) => ({ name: n, error: plugins.loadErrors[n] })),
)
const prod = computed(() => clusters.byId(ctx.value.cluster)?.environment === 'prod')
onMounted(() => {
  void clusters.ensureLoaded()
  clusters.startPolling()
  health.start()
})
onBeforeUnmount(() => {
  clusters.stopPolling()
  health.stop()
})
</script>

<template>
  <NLayout class="app">
    <NLayoutHeader
      class="masthead"
      :class="{ prod }"
      :data-test="prod ? 'prod-masthead' : undefined"
    >
      <TopBar />
    </NLayoutHeader>
    <NLayout
      has-sider
      class="body"
    >
      <NLayoutSider
        :width="220"
        :native-scrollbar="false"
        inverted
        class="sider"
      >
        <AppSidebar />
      </NLayoutSider>
      <NLayoutContent
        class="content"
        content-style="padding: 24px;"
      >
        <NAlert
          v-if="health.auditFailing"
          type="error"
          title="Write actions are disabled"
          class="audit-banner"
          data-test="audit-banner"
        >
          The audit log cannot be written ({{ health.audit }}). Changes are refused until it works again.
        </NAlert>
        <NAlert
          v-if="health.projectConfigNotice"
          type="warning"
          title="Project size presets"
          class="audit-banner"
          data-test="sizes-banner"
        >
          {{ health.projectConfigNotice }}. Fix the capybara-project-sizes ConfigMap in capybara-mgmt
          (<code>make project-sizes</code>).
        </NAlert>
        <NAlert
          v-for="b in brokenPlugins"
          :key="b.name"
          type="warning"
          :title="`The ${b.name} plugin's UI could not be loaded`"
          class="audit-banner"
          data-test="plugin-load-error"
        >
          {{ b.error }}. Its pages, tabs and cards are missing on this cluster; the tool itself is not affected.
        </NAlert>
        <RouterView />
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<style scoped>
.app {
  height: 100vh;
}
.masthead {
  height: 56px;
  background: var(--capy-masthead-bg);
  color: #fff;
}
.masthead.prod {
  /* a production cluster is selected: hard to miss */
  border-bottom: 3px solid #d03050;
}
.body {
  height: calc(100vh - 56px);
}
.sider {
  background: var(--capy-sider-bg);
}
.audit-banner {
  margin-bottom: 16px;
}
.content {
  background: var(--capy-content-bg);
}
</style>
