<script setup lang="ts">
import { NAlert, NButton, NCard, NModal, NSpace, NStep, NSteps, NSwitch, NTag, useMessage, useThemeVars } from 'naive-ui'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { hasData, uninstallPlugin, updateInstallation, type CatalogEntry, type Installation } from '@/api/plugins'
import { usePluginsStore } from '@/stores/plugins'
import { currentStep, installationView } from './installationView'
import UninstallDialog from './UninstallDialog.vue'

const props = defineProps<{ plugin: CatalogEntry; installation: Installation }>()
const message = useMessage()
const plugins = usePluginsStore()
const uninstalling = ref(false)
const busy = ref(false)

const inst = computed(() => props.installation)
const view = computed(() => installationView(inst.value))
const phase = computed(() => (inst.value.deleting ? 'Uninstalling' : (inst.value.status.phase ?? 'Pending')))
const steps = computed(() => view.value.steps)
const current = computed(() => currentStep(steps.value))
const stepStatus = computed(() => (phase.value === 'Error' ? 'error' : current.value > steps.value.length ? 'finish' : 'process'))
// Finished steps in the theme's success green (Naive uses the primary colour).
const themeVars = useThemeVars()
const stepsTheme = computed(() => ({
  indicatorTextColorFinish: themeVars.value.successColor,
  indicatorBorderColorFinish: themeVars.value.successColor,
  splitorColorFinish: themeVars.value.successColor,
}))
const upgradable = computed(
  () => view.value.deployed && props.plugin.spec.version !== inst.value.spec.version && props.plugin.status.available,
)

// A refused request deployed nothing: cancelling it is just removing it.
const cancelling = ref(false)
async function cancelRequest() {
  busy.value = true
  try {
    await uninstallPlugin(inst.value, { keepData: false })
    await plugins.load()
    message.success(`Install request for ${inst.value.spec.cluster} cancelled`)
    cancelling.value = false
  } catch (e) {
    message.error(e instanceof Error ? e.message : String(e))
  } finally {
    busy.value = false
  }
  return false
}
const copied = ref(false)
async function copyFix() {
  try {
    await navigator.clipboard.writeText(view.value.fixCommand ?? '')
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    message.error('Copy failed; select the command instead')
  }
}

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
        :type="view.tone"
        data-test="installation-phase"
      >
        {{ view.label }}
      </NTag>
      <span
        class="muted"
        data-test="installation-subtitle"
      >{{ view.subtitle }}</span>
    </template>
    <template #header-extra>
      <NSpace align="center">
        <template v-if="view.deployed">
          <span class="muted">UI</span>
          <NSwitch
            :value="inst.spec.enabled"
            :disabled="busy || inst.deleting"
            data-test="installation-enabled"
            @update:value="(v: boolean) => change({ enabled: v })"
          />
        </template>
        <NButton
          v-if="upgradable"
          size="small"
          :loading="busy"
          @click="change({ version: plugin.spec.version })"
        >
          Upgrade to {{ plugin.spec.version }}
        </NButton>
        <NButton
          v-if="view.refused"
          size="small"
          :disabled="busy"
          data-test="cancel-request"
          @click="cancelling = true"
        >
          Cancel request
        </NButton>
        <NButton
          v-else
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
    <div
      v-if="steps.length"
      class="steps"
    >
      <NSteps
        :current="current"
        :status="stepStatus"
        :theme-overrides="stepsTheme"
        size="small"
      >
        <NStep
          v-for="s in steps"
          :key="s.name"
          :title="s.state === 'Off' ? `${s.title} — not available` : s.title"
          :description="s.state === 'Done' ? '' : s.message"
          :data-test="`step-${s.name}`"
        />
      </NSteps>
    </div>
    <NAlert
      v-if="view.refused"
      type="error"
      class="msg"
      :title="`Not installed: ${inst.spec.cluster}'s installer credential cannot ${inst.spec.mode === 'install' ? 'install' : 'connect'} ${plugin.spec.displayName}`"
      data-test="installation-fix"
    >
      <template v-if="view.fixCommand">
        <ol class="fix">
          <li>
            Give the installer this plugin's permissions:
            <div class="cmd">
              <code data-test="fix-command">{{ view.fixCommand }}</code>
              <NButton
                size="tiny"
                secondary
                data-test="copy-fix"
                @click="copyFix"
              >
                {{ copied ? 'Copied' : 'Copy' }}
              </NButton>
            </div>
          </li>
          <li>
            Upload the new <code>.local/kubeconfig/capybara-{{ inst.spec.cluster }}-installer.yaml</code> under
            <em>Plugin installs</em> on
            <RouterLink
              :to="{ name: 'core.clusters.detail', params: { id: inst.spec.cluster } }"
              data-test="fix-cluster-link"
            >
              {{ inst.spec.cluster }}'s cluster page
            </RouterLink>
          </li>
        </ol>
        <div class="muted-line">
          Capybara tries again by itself once the new credential is saved. Nothing has been changed in the cluster.
        </div>
      </template>
      <div
        class="detail"
        data-test="installation-message"
      >
        {{ inst.status.message }}
      </div>
    </NAlert>
    <NAlert
      v-else-if="inst.status.message && phase !== 'Ready'"
      :type="phase === 'Error' ? 'error' : 'info'"
      class="msg"
      data-test="installation-message"
    >
      {{ inst.status.message }}
    </NAlert>
    <NModal
      v-if="cancelling"
      :show="true"
      preset="dialog"
      type="warning"
      :title="`Cancel the ${plugin.spec.displayName} install request on ${inst.spec.cluster}?`"
      positive-text="Cancel request"
      negative-text="Keep it"
      :loading="busy"
      :positive-button-props="{ 'data-test': 'confirm-cancel' } as never"
      @positive-click="cancelRequest"
      @negative-click="cancelling = false"
      @close="cancelling = false"
    >
      The pre-flight refused it, so nothing was deployed; the request is removed. You can install again later.
    </NModal>
    <UninstallDialog
      v-if="uninstalling"
      :installation="inst"
      :namespace="plugin.spec.chart?.namespace"
      :has-data="hasData(plugin.spec)"
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
/* Many steps do not fit narrow cards: scroll them, never clip. */
.steps {
  overflow-x: auto;
  /* Room for the indicators' borders: a scroll box clips at its edges. */
  padding: 2px 2px 4px;
}
.steps :deep(.n-step-indicator) {
  flex-shrink: 0;
}
.steps :deep(.n-steps) {
  min-width: max-content;
}
.steps :deep(.n-step) {
  min-width: 150px;
}
.fix {
  margin: 4px 0 8px;
  padding-left: 20px;
}
.fix li {
  margin-bottom: 6px;
}
.cmd {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  flex-wrap: wrap;
}
.cmd code {
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--capy-console-bg);
  color: var(--capy-console-fg);
  font-family: 'Red Hat Mono', Menlo, Consolas, monospace;
  user-select: all;
}
.muted-line,
.detail {
  font-size: 12px;
  opacity: 0.75;
}
.detail {
  margin-top: 6px;
}
</style>
