import { onScopeDispose, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import type { SocketLike } from './useLiveList'

export type TerminalStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error'

export interface TerminalSource {
  cluster: string
  namespace: string
  pod: string
  container: string
}

export interface TerminalHandlers {
  /** Raw terminal output (binary frames). */
  output: (data: Uint8Array) => void
  /** A message to show in the terminal (exit, notice, error). */
  info: (text: string, tone: 'info' | 'warning' | 'error') => void
}

export interface TerminalSession {
  status: Ref<TerminalStatus>
  input: (data: string) => void
  resize: (cols: number, rows: number) => void
  reconnect: () => void
  close: () => void
}

interface ExecSocket extends SocketLike {
  binaryType: string
  readyState: number
  send(data: string): void
}

export function execUrl(src: TerminalSource): string {
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  const q = new URLSearchParams({ namespace: src.namespace, pod: src.pod, container: src.container })
  return `${proto}//${window.location.host}/api/clusters/${encodeURIComponent(src.cluster)}/exec?${q}`
}

/**
 * One shell session over the exec websocket. The session closes when the
 * source changes or the component goes away (e.g. navigation).
 */
export function useTerminal(
  source: MaybeRefOrGetter<TerminalSource | null>,
  on: TerminalHandlers,
  createSocket: (url: string) => ExecSocket = (url) => new WebSocket(url) as unknown as ExecSocket,
): TerminalSession {
  const status = ref<TerminalStatus>('idle')
  let socket: ExecSocket | null = null
  let size: { cols: number; rows: number } | null = null

  function send(msg: object) {
    if (socket && socket.readyState === 1) socket.send(JSON.stringify(msg))
  }

  function close() {
    if (socket) {
      socket.onopen = socket.onmessage = socket.onclose = socket.onerror = null
      socket.close(1000, 'closed')
      socket = null
    }
    if (status.value === 'open' || status.value === 'connecting') status.value = 'closed'
  }

  function open(src: TerminalSource | null) {
    close()
    if (!src) {
      status.value = 'idle'
      return
    }
    status.value = 'connecting'
    const ws = createSocket(execUrl(src))
    ws.binaryType = 'arraybuffer'
    socket = ws
    ws.onopen = () => {
      status.value = 'open'
      if (size) send({ type: 'resize', ...size })
    }
    ws.onmessage = (ev) => {
      if (typeof ev.data !== 'string') {
        on.output(new Uint8Array(ev.data as ArrayBuffer))
        return
      }
      const m = JSON.parse(ev.data) as { type: string; code?: number; message?: string }
      if (m.type === 'exit') on.info(`Shell exited (code ${m.code ?? 0}).`, 'info')
      else if (m.type === 'notice') on.info(m.message ?? '', 'warning')
      else if (m.type === 'error') {
        on.info(m.message ?? 'Terminal error', 'error')
        status.value = 'error'
      }
    }
    ws.onclose = () => {
      socket = null
      if (status.value !== 'error') status.value = 'closed'
    }
    ws.onerror = () => {}
  }

  watch(
    () => toValue(source),
    (src, old) => {
      if (JSON.stringify(src) !== JSON.stringify(old)) open(src)
    },
    { immediate: true },
  )
  onScopeDispose(close)

  return {
    status,
    input: (data) => send({ type: 'stdin', data }),
    resize: (cols, rows) => {
      size = { cols, rows }
      send({ type: 'resize', cols, rows })
    },
    reconnect: () => open(toValue(source)),
    close,
  }
}
