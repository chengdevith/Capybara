<script setup lang="ts">
import { NAlert, NButton, NSpace, NSwitch, NTag, useDialog, useMessage } from 'naive-ui'
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { revealSecret, targetOf } from '@/api/actions'
import type { KubeObject } from '@/api/k8s'
import MonacoDiff from '@/components/resource/MonacoDiff.vue'
import MonacoEditor from '@/components/resource/MonacoEditor.vue'
import type { DetailTabProps } from '@/components/resource/types'
import { toEditableYaml, toYaml } from '@/components/resource/yaml'
import { useApplyFlow } from '@/composables/useApplyFlow'

const props = defineProps<DetailTabProps>()
const message = useMessage()
const dialog = useDialog()
const route = useRoute()
const router = useRouter()

const type = computed(() => props.resource.type)
const sensitive = computed(() => props.resource.sensitive === true)

// --- Secrets: values only after an explicit Reveal (audited server-side) ---
const revealed = shallowRef<KubeObject | null>(null)
const revealing = ref(false)
async function reveal(): Promise<KubeObject | null> {
  revealing.value = true
  try {
    const ns = props.object.metadata.namespace ?? ''
    revealed.value = await revealSecret(props.cluster, ns, props.object.metadata.name)
    return revealed.value
  } catch (e) {
    message.error(e instanceof Error ? e.message : String(e))
    return null
  } finally {
    revealing.value = false
  }
}
function hide() {
  revealed.value = null
}
const revealedOutdated = computed(
  () => revealed.value !== null && revealed.value.metadata.resourceVersion !== props.object.metadata.resourceVersion,
)

// --- Read mode ---
const showManagedFields = ref(false)
const shown = computed(() => (sensitive.value ? (revealed.value ?? props.object) : props.object))
const readText = computed(() => toYaml(type.value, shown.value, { managedFields: showManagedFields.value }))

// --- Edit mode ---
const editing = ref(false)
const baseText = ref('')
const baseVersion = ref('')
const text = ref('')
const flow = useApplyFlow(
  () => props.cluster,
  () => targetOf(type.value, props.object),
  () => type.value,
)

async function startEdit() {
  let source: KubeObject | null = props.object
  if (sensitive.value) source = revealed.value && !revealedOutdated.value ? revealed.value : await reveal()
  if (!source) return
  baseText.value = text.value = toEditableYaml(type.value, source)
  baseVersion.value = source.metadata.resourceVersion
  flow.edit()
  editing.value = true
}
function stopEdit() {
  editing.value = false
  flow.edit()
  if (route.query.edit) {
    const query = { ...route.query }
    delete query.edit
    void router.replace({ query })
  }
}

// The "Edit YAML" action opens this tab with ?edit=1.
watch(
  () => route.query.edit,
  (e) => {
    if (e && !editing.value) void startEdit()
  },
  { immediate: true },
)

// Someone else changed the object while we edit.
const changedInCluster = computed(
  () => editing.value && flow.phase.value !== 'done' && props.object.metadata.resourceVersion !== baseVersion.value,
)

watch(flow.phase, (p) => {
  if (p === 'done') {
    message.success(`${props.resource.singular} updated`)
    if (sensitive.value) hide()
    stopEdit()
  }
})

function confirmForce() {
  const owners = [...new Set(flow.conflicts.value.map((c) => c.manager + (c.subresource ? ` (via ${c.subresource})` : '')))]
  dialog.warning({
    title: 'Force apply?',
    content: `Capybara will take ownership of ${flow.conflicts.value.length} field(s) from ${owners.join(', ')}. Their next apply may change these fields back or report a conflict.`,
    positiveText: 'Force apply',
    negativeText: 'Cancel',
    onPositiveClick: () => flow.apply(text.value, { force: true }),
  })
}

async function copy() {
  await navigator.clipboard.writeText(editing.value ? text.value : readText.value)
  message.success('YAML copied')
}
</script>

<template>
  <div>
    <!-- Read mode -->
    <template v-if="!editing">
      <NSpace
        align="center"
        class="toolbar"
      >
        <NButton
          type="primary"
          size="small"
          :loading="revealing"
          data-test="yaml-edit"
          @click="startEdit"
        >
          Edit
        </NButton>
        <template v-if="sensitive">
          <NButton
            v-if="!revealed"
            size="small"
            :loading="revealing"
            data-test="secret-reveal"
            @click="reveal"
          >
            Reveal values
          </NButton>
          <NButton
            v-else
            size="small"
            data-test="secret-hide"
            @click="hide"
          >
            Hide values
          </NButton>
        </template>
        <NSwitch
          v-model:value="showManagedFields"
          size="small"
        >
          <template #checked>
            Managed fields shown
          </template>
          <template #unchecked>
            Managed fields hidden
          </template>
        </NSwitch>
        <NButton
          size="small"
          @click="copy"
        >
          Copy
        </NButton>
      </NSpace>
      <NAlert
        v-if="sensitive && !revealed"
        type="info"
        class="note"
        data-test="secret-hidden"
      >
        Values are hidden and were not sent to your browser. Reveal fetches them; each reveal is recorded in the
        audit log.
      </NAlert>
      <NAlert
        v-if="revealedOutdated"
        type="warning"
        class="note"
      >
        This Secret changed since you revealed it.
        <NButton
          text
          type="primary"
          @click="reveal"
        >
          Reveal again
        </NButton>
      </NAlert>
      <MonacoEditor
        :value="readText"
        read-only
      />
    </template>

    <!-- Edit mode -->
    <template v-else>
      <NSpace
        align="center"
        class="toolbar"
      >
        <NTag
          type="warning"
          size="small"
          :bordered="false"
        >
          Editing
        </NTag>
        <template v-if="flow.phase.value === 'reviewing'">
          <NButton
            type="primary"
            size="small"
            :loading="flow.busy.value"
            data-test="yaml-apply"
            @click="flow.apply(text)"
          >
            Apply
          </NButton>
          <NButton
            size="small"
            @click="flow.edit"
          >
            Back to editing
          </NButton>
        </template>
        <template v-else>
          <NButton
            type="primary"
            size="small"
            :loading="flow.busy.value"
            :disabled="text === baseText"
            data-test="yaml-review"
            @click="flow.review(text)"
          >
            Review changes
          </NButton>
        </template>
        <NButton
          size="small"
          data-test="yaml-cancel"
          @click="stopEdit"
        >
          Cancel
        </NButton>
        <span class="hint">Status and server-managed fields are not editable and are hidden.</span>
      </NSpace>

      <NAlert
        v-if="changedInCluster && flow.phase.value !== 'stale'"
        type="warning"
        class="note"
      >
        This {{ resource.singular }} changed in the cluster since you started editing; applying will be refused.
        <NButton
          text
          type="primary"
          @click="startEdit"
        >
          Reload (discards your edits)
        </NButton>
      </NAlert>
      <NAlert
        v-if="flow.error.value"
        type="error"
        class="note"
        data-test="yaml-error"
      >
        {{ flow.error.value }}
      </NAlert>
      <NAlert
        v-if="flow.phase.value === 'stale'"
        type="warning"
        title="Changed in the cluster"
        class="note"
      >
        Someone changed this {{ resource.singular }} after you started editing, so nothing was applied.
        <NButton
          text
          type="primary"
          @click="startEdit"
        >
          Reload the latest version (discards your edits)
        </NButton>
      </NAlert>
      <NAlert
        v-if="flow.phase.value === 'conflict'"
        type="warning"
        title="Conflicts: other tools own these fields"
        class="note"
        data-test="yaml-conflicts"
      >
        <ul class="conflicts">
          <li
            v-for="c in flow.conflicts.value"
            :key="c.field"
          >
            <code>{{ c.field }}</code> is managed by <strong>{{ c.manager ?? 'another manager' }}</strong>
            <span v-if="c.subresource"> (via {{ c.subresource }})</span>
          </li>
        </ul>
        <NSpace>
          <NButton
            size="small"
            @click="flow.edit"
          >
            Back to editing
          </NButton>
          <NButton
            size="small"
            type="warning"
            data-test="yaml-force"
            @click="confirmForce"
          >
            Force apply…
          </NButton>
        </NSpace>
      </NAlert>

      <div
        v-if="flow.phase.value === 'reviewing' && flow.preview.value !== null"
        class="review"
      >
        <div class="hint">
          Left: current. Right: after applying (computed by the server, nothing changed yet).
        </div>
        <MonacoDiff
          :original="baseText"
          :modified="flow.preview.value"
        />
      </div>
      <MonacoEditor
        v-else
        v-model:value="text"
      />
    </template>
  </div>
</template>

<style scoped>
.toolbar {
  margin-bottom: 8px;
}
.hint {
  color: var(--capy-text-muted);
  font-size: 13px;
}
.note {
  margin-bottom: 8px;
}
.conflicts {
  margin: 4px 0 8px;
  padding-left: 18px;
}
.review .hint {
  margin-bottom: 4px;
}
</style>
