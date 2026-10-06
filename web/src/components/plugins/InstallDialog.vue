<script setup lang="ts">
import { NAlert, NButton, NFormItem, NModal, NRadioButton, NRadioGroup, NSelect, NSpace, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { installPlugin, type CatalogEntry, type InstallMode } from '@/api/plugins'
import { useClustersStore } from '@/stores/clusters'
import { usePluginsStore } from '@/stores/plugins'
import ConfigForm from './ConfigForm.vue'
import RuleList from './RuleList.vue'

const props = defineProps<{ plugin: CatalogEntry; cluster?: string }>()
const emit = defineEmits<{ close: []; installed: [id: string] }>()
const message = useMessage()
const clusters = useClustersStore()
const plugins = usePluginsStore()

const cluster = ref<string | null>(props.cluster ?? null)
const mode = ref<InstallMode>(props.plugin.spec.modes[0] ?? 'install')
const config = ref<Record<string, unknown>>({})
const busy = ref(false)
const error = ref<string | null>(null)

const installed = computed(() => new Set(props.plugin.installations.map((i) => i.spec.cluster)))
const options = computed(() =>
  clusters.items.map((c) => ({
    label: `${c.displayName || c.id} · ${c.status.pluginInstalls === 'Enabled' ? 'installs enabled' : 'installs disabled'}${installed.value.has(c.id) ? ' · installed' : ''}`,
    value: c.id,
    disabled: installed.value.has(c.id),
  })),
)
const target = computed(() => clusters.byId(cluster.value))
const disabledReason = computed(() =>
  target.value && target.value.status.pluginInstalls !== 'Enabled'
    ? target.value.status.installerMessage || 'this cluster has no installer credential'
    : null,
)
// Connect mode only needs the connection settings; install mode none.
const connectKeys = computed(() => (mode.value === 'connect' ? undefined : []))
const rules = computed(() => props.plugin.installerRules?.[mode.value])
const services = computed(() => (props.plugin.spec.permissions?.services ?? []).filter((s) => !s.modes || s.modes.includes(mode.value)))

async function submit() {
  if (!cluster.value) return
  busy.value = true
  error.value = null
  try {
    const inst = await installPlugin({ plugin: props.plugin.name, cluster: cluster.value, mode: mode.value, config: config.value })
    await plugins.load()
    message.success(`${props.plugin.spec.displayName}: ${mode.value === 'install' ? 'installing' : 'connecting'} on ${cluster.value}`)
    emit('installed', inst.id)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <NModal
    :show="true"
    preset="card"
    :title="`Install ${plugin.spec.displayName}`"
    :style="{ width: '760px' }"
    :mask-closable="false"
    @close="emit('close')"
  >
    <NFormItem label="Cluster">
      <NSelect
        v-model:value="cluster"
        :options="options"
        placeholder="Select a cluster"
        data-test="install-cluster"
      />
    </NFormItem>
    <NAlert
      v-if="disabledReason"
      type="warning"
      title="Plugin installs are disabled on this cluster"
      class="block"
      data-test="installs-disabled"
    >
      {{ disabledReason }}. Set an installer credential on the cluster's page.
    </NAlert>
    <NFormItem label="Mode">
      <NRadioGroup
        v-model:value="mode"
        data-test="install-mode"
      >
        <NRadioButton
          v-for="m in plugin.spec.modes"
          :key="m"
          :value="m"
        >
          {{ m === 'install' ? 'Install' : 'Connect existing' }}
        </NRadioButton>
      </NRadioGroup>
    </NFormItem>
    <ConfigForm
      v-if="mode === 'connect'"
      v-model="config"
      :schema="plugin.spec.configSchema"
      :only="connectKeys"
    />
    <p
      v-else-if="plugin.spec.chart"
      class="muted"
    >
      Deploys {{ plugin.spec.chart.releaseName }} (chart {{ plugin.spec.chart.version }}) into namespace
      {{ plugin.spec.chart.namespace }}.
    </p>

    <h4>The installer credential needs ({{ mode }} mode)</h4>
    <RuleList
      :rules="rules?.clusterRules"
      scope="cluster-wide"
    />
    <RuleList
      v-if="rules?.namespaceRules?.length"
      :rules="rules.namespaceRules"
      scope="plugin namespace"
    />
    <p
      v-if="mode === 'connect'"
      class="muted"
    >
      Plus get services/proxy on exactly the connected service.
    </p>
    <h4>The plugin's backend may reach</h4>
    <ul class="services">
      <li
        v-for="s in services"
        :key="s.name"
      >
        <strong>{{ s.name }}</strong> ({{ s.methods.join(', ') }} {{ s.paths.join(', ') }}) — through the Kubernetes service proxy, with its own account
      </li>
    </ul>
    <p class="muted">
      The checks run before anything is changed; a missing permission stops the install with the list and the command to fix it.
    </p>
    <NAlert
      v-if="error"
      type="error"
      class="block"
    >
      {{ error }}
    </NAlert>
    <template #footer>
      <NSpace justify="end">
        <NButton @click="emit('close')">
          Cancel
        </NButton>
        <NButton
          type="primary"
          :disabled="!cluster || !!disabledReason"
          :loading="busy"
          data-test="install-submit"
          @click="submit"
        >
          {{ mode === 'install' ? 'Install' : 'Connect' }}
        </NButton>
      </NSpace>
    </template>
  </NModal>
</template>

<style scoped>
.block {
  margin-bottom: 12px;
}
.muted {
  opacity: 0.75;
  font-size: 13px;
}
.services {
  padding-left: 18px;
  font-size: 13px;
}
h4 {
  margin: 12px 0 4px;
}
</style>
