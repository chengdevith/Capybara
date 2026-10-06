import { describe, expect, it } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import type { SocketLike } from './useLiveList'
import { useLogStream, type LogStreamSource } from './useLogStream'

class FakeSocket implements SocketLike {
  onopen: SocketLike['onopen'] = null
  onmessage: SocketLike['onmessage'] = null
  onclose: SocketLike['onclose'] = null
  onerror: SocketLike['onerror'] = null
  closed = false
  constructor(readonly url: string) {}
  send(msg: unknown) {
    this.onmessage?.({ data: JSON.stringify(msg) } as MessageEvent)
  }
  close() {
    this.closed = true
  }
}

const src: LogStreamSource = { cluster: 'dev-1', namespace: 'demo', pod: 'web', container: 'app', tailLines: 100 }

function run(source: LogStreamSource | null | (() => LogStreamSource | null), maxLines?: number) {
  const sockets: FakeSocket[] = []
  const scope = effectScope()
  const stream = scope.run(() =>
    useLogStream(source, { maxLines, createSocket: (u) => (sockets.push(new FakeSocket(u)), sockets.at(-1)!) }),
  )!
  return { stream, sockets, scope }
}

describe('useLogStream', () => {
  it('builds the logs URL and joins chunks into lines', () => {
    const { stream, sockets } = run(src)
    const ws = sockets[0]!
    const q = new URL(ws.url).searchParams
    expect(new URL(ws.url).pathname).toBe('/api/clusters/dev-1/logs')
    expect([q.get('namespace'), q.get('pod'), q.get('container'), q.get('tailLines')]).toEqual(['demo', 'web', 'app', '100'])

    ws.onopen?.(new Event('open'))
    expect(stream.status.value).toBe('streaming')
    ws.send({ type: 'log', data: 'one\ntw' })
    expect(stream.lines.value).toEqual(['one'])
    ws.send({ type: 'log', data: 'o\nthree\n' })
    expect(stream.lines.value).toEqual(['one', 'two', 'three'])
  })

  it('caps lines and counts what was dropped', () => {
    const { stream, sockets } = run(src, 2)
    sockets[0]!.send({ type: 'log', data: 'a\nb\nc\n' })
    expect(stream.lines.value).toEqual(['b', 'c'])
    expect(stream.dropped.value).toBe(1)
  })

  it('reports end and errors, flushing a trailing partial line', () => {
    const { stream, sockets } = run(src)
    sockets[0]!.send({ type: 'log', data: 'last line without newline' })
    sockets[0]!.send({ type: 'end' })
    expect(stream.lines.value).toEqual(['last line without newline'])
    expect(stream.status.value).toBe('ended')

    const failed = run(src)
    failed.sockets[0]!.send({ type: 'error', message: 'container not found' })
    expect(failed.stream.status.value).toBe('error')
    expect(failed.stream.error.value).toBe('container not found')
  })

  it('marks an unexpected close as disconnected', () => {
    const { stream, sockets } = run(src)
    sockets[0]!.onopen?.(new Event('open'))
    sockets[0]!.onclose?.({ code: 1006 } as CloseEvent)
    expect(stream.status.value).toBe('disconnected')
  })

  it('reconnects on source change and closes on dispose', async () => {
    const container = ref('app')
    const { sockets, scope } = run(() => ({ ...src, container: container.value }))
    container.value = 'sidecar'
    await nextTick()
    expect(sockets[0]!.closed).toBe(true)
    expect(new URL(sockets[1]!.url).searchParams.get('container')).toBe('sidecar')
    scope.stop()
    expect(sockets[1]!.closed).toBe(true)
  })
})
