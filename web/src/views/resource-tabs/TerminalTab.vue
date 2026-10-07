<script setup lang="ts">
import '@xterm/xterm/css/xterm.css'
import { FitAddon } from '@xterm/addon-fit'
import { Terminal } from '@xterm/xterm'
import { NButton, NSelect, NSpace, NTag } from 'naive-ui'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { DetailTabProps } from '@/components/resource/types'
import { useTerminal, type TerminalStatus } from '@/composables/useTerminal'

// A shell in one container. Closing the tab or leaving the page ends it.
const props = defineProps<DetailTabProps>()

interface ContainerStatus {
  name: string
  state?: { running?: object }
}
const running = computed(() =>
  ((props.object.status?.containerStatuses as ContainerStatus[]) ?? []).filter((c) => c.state?.running).map((c) => c.name),
)
const options = computed(() => running.value.map((n) => ({ label: n, value: n })))
const container = ref<string | null>(running.value[0] ?? null)

const host = ref<HTMLElement>()
const term = new Terminal({
  cursorBlink: true,
  fontSize: 13,
  fontFamily: "'Red Hat Mono', Menlo, Consolas, monospace",
  theme: { background: '#1d1c23', foreground: '#e6e1da', cursor: '#d4ad80', selectionBackground: '#4a4858' }, // --capy-console-*
  convertEol: false,
})
const fit = new FitAddon()
term.loadAddon(fit)

const colors = { info: '36', warning: '33', error: '31' } as const
const session = useTerminal(
  () =>
    container.value
      ? {
          cluster: props.cluster,
          namespace: props.object.metadata.namespace ?? '',
          pod: props.object.metadata.name,
          container: container.value,
        }
      : null,
  {
    output: (data) => term.write(data),
    info: (text, tone) => term.write(`\r\n\x1b[${colors[tone]}m${text}\x1b[0m\r\n`),
  },
)

const statusTone: Record<TerminalStatus, 'success' | 'warning' | 'error' | 'default'> = {
  idle: 'default',
  connecting: 'default',
  open: 'success',
  closed: 'warning',
  error: 'error',
}

let observer: ResizeObserver | null = null
onMounted(() => {
  if (!host.value) return
  term.open(host.value)
  const refit = () => {
    fit.fit()
    session.resize(term.cols, term.rows)
  }
  refit()
  observer = new ResizeObserver(refit)
  observer.observe(host.value)
  term.onData((d) => session.input(d))
  term.focus()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  session.close()
  term.dispose()
})

function reconnect() {
  term.reset()
  session.reconnect()
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
        :options="options"
        size="small"
        class="select"
        placeholder="No running container"
        data-test="terminal-container"
      />
      <NTag
        size="small"
        :type="statusTone[session.status.value]"
        :bordered="false"
        data-test="terminal-status"
      >
        {{ session.status.value }}
      </NTag>
      <NButton
        v-if="session.status.value === 'closed' || session.status.value === 'error'"
        size="small"
        type="primary"
        @click="reconnect"
      >
        Reconnect
      </NButton>
      <span class="hint">Sessions close after inactivity, and when you leave this page. Opening and closing are audited; what you type is not.</span>
    </NSpace>
    <div
      ref="host"
      class="terminal"
      data-test="terminal"
    />
  </div>
</template>

<style scoped>
.toolbar {
  margin-bottom: 8px;
}
.select {
  width: 200px;
}
.hint {
  color: var(--capy-text-muted);
  font-size: 12px;
}
.terminal {
  height: 60vh;
  background: var(--capy-console-bg);
  padding: 6px;
}
</style>
