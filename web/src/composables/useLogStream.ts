import { onScopeDispose, ref, shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { logsUrl, type LogMessage, type LogOptions } from '@/api/k8s'
import type { SocketLike } from './useLiveList'

export type LogStatus = 'idle' | 'connecting' | 'streaming' | 'ended' | 'disconnected' | 'error'

export interface LogStreamSource extends LogOptions {
  cluster: string
}

export interface LogStream {
  lines: Ref<string[]>
  status: Ref<LogStatus>
  error: Ref<string | null>
  /** Lines dropped from the top because of `maxLines`. */
  dropped: Ref<number>
  clear: () => void
  reconnect: () => void
}

export interface LogStreamOptions {
  maxLines?: number
  createSocket?: (url: string) => SocketLike
}

/**
 * Streams a container's logs over the logs websocket. Keeps at most
 * `maxLines` complete lines; a chunk that ends mid-line is held until the
 * rest arrives. The socket closes when the source changes or the scope ends.
 */
export function useLogStream(
  source: MaybeRefOrGetter<LogStreamSource | null>,
  opts: LogStreamOptions = {},
): LogStream {
  const maxLines = opts.maxLines ?? 5000
  const createSocket = opts.createSocket ?? ((url: string) => new WebSocket(url) as SocketLike)

  const lines = shallowRef<string[]>([])
  const status = ref<LogStatus>('idle')
  const error = ref<string | null>(null)
  const dropped = ref(0)
  let partial = ''
  let socket: SocketLike | null = null

  function append(chunk: string) {
    const parts = (partial + chunk).split('\n')
    partial = parts.pop() ?? ''
    if (parts.length === 0) return
    let next = lines.value.concat(parts)
    if (next.length > maxLines) {
      dropped.value += next.length - maxLines
      next = next.slice(next.length - maxLines)
    }
    lines.value = next
  }

  function flushPartial() {
    if (partial) {
      const rest = partial
      partial = ''
      append(rest + '\n')
    }
  }

  function close() {
    if (socket) {
      socket.onopen = socket.onmessage = socket.onclose = socket.onerror = null
      socket.close(1000, 'done')
      socket = null
    }
  }

  function start(src: LogStreamSource | null) {
    close()
    lines.value = []
    partial = ''
    dropped.value = 0
    error.value = null
    if (!src) {
      status.value = 'idle'
      return
    }
    status.value = 'connecting'
    const { cluster, ...logOpts } = src
    const ws = createSocket(logsUrl(cluster, logOpts))
    socket = ws
    ws.onopen = () => (status.value = 'streaming')
    ws.onmessage = (ev) => {
      const msg = JSON.parse(String(ev.data)) as LogMessage
      if (msg.type === 'log') append(msg.data)
      else if (msg.type === 'end') {
        flushPartial()
        status.value = 'ended'
      } else {
        error.value = msg.message
        status.value = 'error'
      }
    }
    ws.onclose = () => {
      flushPartial()
      socket = null
      if (status.value === 'streaming' || status.value === 'connecting') status.value = 'disconnected'
    }
    ws.onerror = () => {}
  }

  watch(
    () => toValue(source),
    (src, old) => {
      if (JSON.stringify(src) !== JSON.stringify(old)) start(src)
    },
    { immediate: true },
  )
  onScopeDispose(close)

  return {
    lines,
    status,
    error,
    dropped,
    clear: () => {
      lines.value = []
      dropped.value = 0
    },
    reconnect: () => start(toValue(source)),
  }
}
