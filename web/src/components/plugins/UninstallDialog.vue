<script setup lang="ts">
import { NAlert, NCheckbox, NInput, NModal, NSpin, useMessage } from 'naive-ui'
import { computed, onBeforeUnmount, ref } from 'vue'
import { getInstallation, requestCRDScan, uninstallPlugin, type CRDScan, type Installation } from '@/api/plugins'
import { usePluginsStore } from '@/stores/plugins'

// Type-the-name uninstall. Install mode asks whether to keep data (for
// plugins that have data volumes) and warns that CRDs stay; removing them is
// opt-in and shows the objects of those kinds that are not from this
// plugin first.
const props = defineProps<{ installation: Installation; namespace?: string; hasData?: boolean }>()
const emit = defineEmits<{ close: []; removed: [] }>()
const message = useMessage()
const plugins = usePluginsStore()

const inst = props.installation
const namespace = props.namespace ?? 'the plugin namespace'
const typed = ref('')
const keepData = ref(true)
const removeCRDs = ref(false)
const scan = ref<CRDScan | null>(null)
const scanning = ref(false)
const confirmForeign = ref(false)
const busy = ref(false)
const error = ref<string | null>(null)
let poll: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(poll))

async function startScan() {
  scanning.value = true
  scan.value = null
  confirmForeign.value = false
  try {
    const { request } = await requestCRDScan(inst.id)
    const wait = async (tries: number): Promise<void> => {
      const fresh = await getInstallation(inst.id)
      if (fresh.status.crdScan?.request === request) {
        scan.value = fresh.status.crdScan
        scanning.value = false
        return
      }
      if (tries <= 0) throw new Error('the controller did not answer the scan in time')
      await new Promise((r) => (poll = setTimeout(r, 1000)))
      return wait(tries - 1)
    }
    await wait(90)
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    scanning.value = false
  }
}

function toggleCRDs(v: boolean) {
  removeCRDs.value = v
  if (v) void startScan()
}

const foreign = computed(() => scan.value?.foreign ?? [])
const ready = computed(
  () =>
    typed.value === inst.id &&
    (!removeCRDs.value || (!!scan.value && !scan.value.error && (foreign.value.length === 0 || confirmForeign.value))),
)

async function submit() {
  if (!ready.value) return false
  busy.value = true
  try {
    await uninstallPlugin(inst, { keepData: keepData.value, removeCRDs: removeCRDs.value ? scan.value!.hash : undefined })
    await plugins.load()
    message.success(`Uninstalling ${inst.spec.plugin} from ${inst.spec.cluster}`)
    emit('removed')
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
  return false
}
</script>

<template>
  <NModal
    :show="true"
    preset="dialog"
    type="error"
    :title="`Uninstall ${inst.spec.plugin} from ${inst.spec.cluster}?`"
    positive-text="Uninstall"
    negative-text="Cancel"
    :loading="busy"
    :positive-button-props="{ type: 'error', disabled: !ready, 'data-test': 'confirm' } as never"
    style="width: 600px"
    @positive-click="submit"
    @negative-click="emit('close')"
    @close="emit('close')"
  >
    <template v-if="inst.spec.mode === 'install'">
      <p>
        Removes the Helm release and the plugin's account from the cluster. The namespace
        <strong>{{ namespace }}</strong> stays{{ hasData ? ' (empty unless you keep the data)' : '' }}; delete it yourself if you no longer need it.
      </p>
      <NCheckbox
        v-if="hasData"
        v-model:checked="keepData"
        data-test="keep-data"
      >
        Keep the data (PersistentVolumeClaims stay in the plugin's namespace)
      </NCheckbox>
      <NAlert
        type="warning"
        class="block"
        :show-icon="false"
      >
        The chart's CustomResourceDefinitions stay in the cluster unless you remove them.
        Removing a CRD deletes every object of that kind, including ones other tools created.
      </NAlert>
      <NCheckbox
        :checked="removeCRDs"
        data-test="remove-crds"
        @update:checked="toggleCRDs"
      >
        Also remove the CRDs
      </NCheckbox>
      <div
        v-if="removeCRDs"
        class="block"
      >
        <NSpin
          v-if="scanning"
          size="small"
        />
        <NAlert
          v-else-if="scan?.error"
          type="error"
        >
          {{ scan.error }}
        </NAlert>
        <template v-else-if="scan">
          <p>{{ scan.crds?.length ?? 0 }} CRDs. Objects of these kinds that are not from this plugin:</p>
          <p
            v-if="foreign.length === 0"
            data-test="no-foreign"
          >
            none
          </p>
          <template v-else>
            <ul
              class="foreign"
              data-test="foreign-objects"
            >
              <li
                v-for="f in foreign"
                :key="f"
              >
                {{ f }}
              </li>
            </ul>
            <NCheckbox
              v-model:checked="confirmForeign"
              data-test="confirm-foreign"
            >
              Delete these {{ foreign.length }} object(s) too
            </NCheckbox>
          </template>
        </template>
      </div>
    </template>
    <p v-else>
      Removes the plugin's account and grants from the cluster. The connected tool and what it manages are not touched.
    </p>
    <p>Type <strong>{{ inst.id }}</strong> to confirm.</p>
    <NInput
      v-model:value="typed"
      :placeholder="inst.id"
      data-test="confirm-name"
    />
    <NAlert
      v-if="error"
      type="error"
      class="block"
    >
      {{ error }}
    </NAlert>
  </NModal>
</template>

<style scoped>
.block {
  margin: 8px 0;
}
.foreign {
  max-height: 160px;
  overflow: auto;
  padding-left: 18px;
  font-size: 13px;
}
</style>
