<script setup lang="ts">
import { NAlert, NButton, NCheckbox, NSelect, NSpace, NTag } from 'naive-ui'
import { computed, nextTick, ref, watch } from 'vue'
import type { DetailTabProps } from '@/components/resource/types'
import { useLogStream, type LogStatus } from '@/composables/useLogStream'

const props = defineProps<DetailTabProps>()

interface ContainerSpec {
  name: string
}
const containers = computed(() => [
  ...((props.object.spec?.containers as ContainerSpec[]) ?? []).map((c) => ({ label: c.name, value: c.name })),
  ...((props.object.spec?.initContainers as ContainerSpec[]) ?? []).map((c) => ({
    label: `${c.name} (init)`,
    value: c.name,
  })),
])

const container = ref<string | undefined>(containers.value[0]?.value)
const tailLines = ref(500)
const previous = ref(false)
const timestamps = ref(false)
const wrap = ref(true)
const follow = ref(true)

const tailOptions = [100, 500, 1000, 5000].map((n) => ({ label: `Last ${n} lines`, value: n }))

const source = computed(() =>
  container.value
    ? {
        cluster: props.cluster,
        namespace: props.object.metadata.namespace ?? '',
        pod: props.object.metadata.name,
        container: container.value,
        tailLines: tailLines.value,
        previous: previous.value,
        timestamps: timestamps.value,
      }
    : null,
)
const { lines, status, error, dropped, clear, reconnect } = useLogStream(source)

const statusTone: Record<LogStatus, 'success' | 'warning' | 'error' | 'default'> = {
  idle: 'default',
  connecting: 'default',
  streaming: 'success',
  ended: 'default',
  disconnected: 'warning',
  error: 'error',
}

// Stick to the bottom while following; scrolling up pauses following.
const output = ref<HTMLElement>()
watch(lines, async () => {
  if (!follow.value) return
  await nextTick()
  if (output.value) output.value.scrollTop = output.value.scrollHeight
})
function onScroll() {
  const el = output.value
  if (el) follow.value = el.scrollHeight - el.scrollTop - el.clientHeight < 24
}
</script>

<template>
  <div>
    <NSpace
      align="center"
      class="toolbar"
    >
      <NSelect
        v-model:value="container"
        :options="containers"
        size="small"
        class="select"
      />
      <NSelect
        v-model:value="tailLines"
        :options="tailOptions"
        size="small"
        class="select"
      />
      <NCheckbox v-model:checked="previous">
        Previous container
      </NCheckbox>
      <NCheckbox v-model:checked="timestamps">
        Timestamps
      </NCheckbox>
      <NCheckbox v-model:checked="wrap">
        Wrap lines
      </NCheckbox>
      <NTag
        size="small"
        :type="statusTone[status]"
        :bordered="false"
        data-test="log-status"
      >
        {{ status }}
      </NTag>
      <NButton
        size="small"
        @click="clear"
      >
        Clear
      </NButton>
      <NButton
        v-if="status === 'disconnected' || status === 'ended' || status === 'error'"
        size="small"
        type="primary"
        @click="reconnect"
      >
        Reconnect
      </NButton>
    </NSpace>
    <NAlert
      v-if="error"
      type="warning"
      class="error"
    >
      {{ error }}
    </NAlert>
    <div
      v-if="dropped > 0"
      class="note"
    >
      {{ dropped }} older lines dropped (the browser keeps the latest 5000).
    </div>
    <pre
      ref="output"
      class="output"
      :class="{ wrap }"
      data-test="log-output"
      @scroll="onScroll"
    >{{ lines.join('\n') }}</pre>
    <NButton
      v-if="!follow"
      size="tiny"
      class="jump"
      @click="follow = true"
    >
      Jump to latest
    </NButton>
  </div>
</template>

<style scoped>
.toolbar {
  margin-bottom: 8px;
}
.select {
  width: 180px;
}
.error {
  margin-bottom: 8px;
}
.note {
  color: var(--capy-text-muted);
  font-size: 12px;
  margin-bottom: 4px;
}
.output {
  height: 60vh;
  margin: 0;
  overflow: auto;
  background: #151515;
  color: #e0e0e0;
  padding: 12px;
  font-size: 12px;
  line-height: 1.5;
  font-family: 'Red Hat Mono', Menlo, Consolas, monospace;
}
.output.wrap {
  white-space: pre-wrap;
  word-break: break-all;
}
.jump {
  margin-top: 4px;
}
</style>
