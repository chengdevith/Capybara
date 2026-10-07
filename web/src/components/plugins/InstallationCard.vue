<script setup lang="ts">
import { NAlert, NButton, NCard, NSpace, NStep, NSteps, NSwitch, NTag, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { updateInstallation, type CatalogEntry, type Installation } from '@/api/plugins'
import { usePluginsStore } from '@/stores/plugins'
import UninstallDialog from './UninstallDialog.vue'

const props = defineProps<{ plugin: CatalogEntry; installation: Installation }>()
const message = useMessage()
const plugins = usePluginsStore()
const uninstalling = ref(false)
const busy = ref(false)

const inst = computed(() => props.installation)
const phase = computed(() => (inst.value.deleting ? 'Uninstalling' : (inst.value.status.phase ?? 'Pending')))
const tone = computed(() =>
  ({ Ready: 'success', Disabled: 'default', Error: 'error', Installing: 'info', Uninstalling: 'warning', Pending: 'default' })[phase.value] as
    'success' | 'default' | 'error' | 'info' | 'warning',
)
const steps = computed(() => inst.value.status.steps ?? [])
const current = computed(() => {
  const i = steps.value.findIndex((s) => s.state !== 'Done')
  return i === -1 ? steps.value.length + 1 : i + 1
})
const stepStatus = computed(() => (phase.value === 'Error' ? 'error' : current.value > steps.value.length ? 'finish' : 'process'))
const upgradable = computed(() => props.plugin.spec.version !== inst.value.spec.version && props.plugin.status.available)

async function change(c: { enabled?: boolean; version?: string }) {
  busy.value = true
  try {
    await updateInstallation(inst.value, c)
    await plugins.load()
    message.success(c.version ? `Upgrading to ${c.version}` : c.enabled ? 'UI shown on this cluster' : 'UI hidden; the tool keeps running')
  } catch (e) {
    message.error(e instanceof Error ? e.message : String(e))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <NCard
    size="small"
    :data-test="`installation-${inst.spec.cluster}`"
  >
    <template #header>
      {{ inst.spec.cluster }}
      <NTag
        size="small"
        :bordered="false"
        :type="tone"
        data-test="installation-phase"
      >
        {{ phase }}
      </NTag>
      <span class="muted">{{ inst.spec.mode === 'install' ? 'installed' : 'connected' }} · v{{ inst.spec.version }}</span>
    </template>
    <template #header-extra>
      <NSpace align="center">
        <span class="muted">UI</span>
        <NSwitch
          :value="inst.spec.enabled"
          :disabled="busy || inst.deleting"
          data-test="installation-enabled"
          @update:value="(v: boolean) => change({ enabled: v })"
        />
        <NButton
          v-if="upgradable"
          size="small"
          :loading="busy"
          @click="change({ version: plugin.spec.version })"
        >
          Upgrade to {{ plugin.spec.version }}
        </NButton>
        <NButton
          size="small"
          type="error"
          ghost
          :disabled="inst.deleting"
          data-test="uninstall"
          @click="uninstalling = true"
        >
          Uninstall
        </NButton>
      </NSpace>
    </template>
    <NSteps
      v-if="steps.length"
      :current="current"
      :status="stepStatus"
      size="small"
    >
      <NStep
        v-for="s in steps"
        :key="s.name"
        :title="s.title"
        :description="s.state === 'Done' ? '' : s.message"
        :data-test="`step-${s.name}`"
      />
    </NSteps>
    <NAlert
      v-if="inst.status.message && phase !== 'Ready'"
      :type="phase === 'Error' ? 'error' : 'info'"
      class="msg"
      data-test="installation-message"
    >
      {{ inst.status.message }}
    </NAlert>
    <UninstallDialog
      v-if="uninstalling"
      :installation="inst"
      :namespace="plugin.spec.chart?.namespace"
      @close="uninstalling = false"
      @removed="uninstalling = false"
    />
  </NCard>
</template>

<style scoped>
.muted {
  opacity: 0.7;
  font-size: 13px;
  margin-left: 8px;
}
.msg {
  margin-top: 12px;
}
</style>
