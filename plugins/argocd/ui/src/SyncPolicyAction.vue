<script setup lang="ts">
import { pluginAction, type KubeObject } from '@capybara/sdk'
import { NAlert, NButton, NInput, NModal, NSpace, NSwitch } from 'naive-ui'
import { computed, ref } from 'vue'
import { PLUGIN } from './argocd'

// Auto-sync, self-heal and auto-prune, each switched by its own declared
// action. Turning auto-prune on asks for the Application's name.
const props = defineProps<{ cluster: string; object: KubeObject }>()
const emit = defineEmits<{ close: [] }>()
const automated = computed(() => props.object.spec?.syncPolicy?.automated as { selfHeal?: boolean; prune?: boolean } | undefined)
const busy = ref<string | null>(null)
const error = ref<string | null>(null)
const pruneConfirm = ref(false)
const typed = ref('')
const done = ref<string[]>([])

async function run(action: string, confirmName?: string) {
  busy.value = action
  error.value = null
  const m = props.object.metadata
  try {
    await pluginAction(props.cluster, PLUGIN, action, { namespace: m.namespace, name: m.name, uid: m.uid, ...(confirmName ? { confirmName } : {}) })
    done.value = [...done.value, action]
    emit('close')
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = null
  }
}

function toggle(what: 'auto-sync' | 'self-heal' | 'auto-prune', on: boolean) {
  if (what === 'auto-prune' && on) {
    pruneConfirm.value = true
    return
  }
  void run(`${what}-${on ? 'on' : 'off'}`)
}
</script>

<template>
  <NModal
    :show="true"
    preset="card"
    :title="`Sync policy of ${object.metadata.name}`"
    style="max-width: 520px"
    @close="emit('close')"
    @mask-click="emit('close')"
  >
    <div class="row">
      <NSwitch
        :value="!!automated"
        :loading="busy?.startsWith('auto-sync')"
        data-test="policy-auto-sync"
        @update:value="(v: boolean) => toggle('auto-sync', v)"
      />
      <span>Auto-sync: sync when Git changes</span>
    </div>
    <div class="row">
      <NSwitch
        :value="!!automated?.selfHeal"
        :disabled="!automated"
        :loading="busy?.startsWith('self-heal')"
        data-test="policy-self-heal"
        @update:value="(v: boolean) => toggle('self-heal', v)"
      />
      <span>Self-heal: undo changes made in the cluster</span>
    </div>
    <div class="row">
      <NSwitch
        :value="!!automated?.prune"
        :disabled="!automated"
        :loading="busy?.startsWith('auto-prune')"
        data-test="policy-auto-prune"
        @update:value="(v: boolean) => toggle('auto-prune', v)"
      />
      <span>Auto-prune: delete resources removed from Git</span>
    </div>
    <template v-if="pruneConfirm">
      <NAlert
        type="warning"
        class="gap"
      >
        Every automatic sync will delete resources that are no longer in Git. Type <strong>{{ object.metadata.name }}</strong> to turn it on.
      </NAlert>
      <NSpace>
        <NInput
          v-model:value="typed"
          data-test="policy-confirm-name"
        />
        <NButton
          type="warning"
          :disabled="typed !== object.metadata.name"
          :loading="busy === 'auto-prune-on'"
          data-test="policy-confirm"
          @click="run('auto-prune-on', typed)"
        >
          Turn on auto-prune
        </NButton>
      </NSpace>
    </template>
    <NAlert
      v-if="error"
      type="error"
      class="gap"
    >
      {{ error }}
    </NAlert>
  </NModal>
</template>

<style scoped>
.row {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}
.gap {
  margin: 12px 0;
}
</style>
