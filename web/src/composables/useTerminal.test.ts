import { describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { useTerminal, type TerminalSource } from './useTerminal'

class FakeExecSocket {
  onopen: ((e: Event) => void) | null = null
  onmessage: ((e: MessageEvent) => void) | null = null
  onclose: ((e: CloseEvent) => void) | null = null
  onerror: ((e: Event) => void) | null = null
  binaryType = 'blob'
  readyState = 0
  sent: unknown[] = []
  closed = false
  constructor(readonly url: string) {}
  open() {
    this.readyState = 1
    this.onopen?.(new Event('open'))
  }
  send(data: string) {
    this.sent.push(JSON.parse(data))
  }
  close() {
    this.closed = true
  }
  receive(data: string | ArrayBuffer) {
    this.onmessage?.({ data } as MessageEvent)
  }
}

const src: TerminalSource = { cluster: 'dev-1', namespace: 'demo', pod: 'web', container: 'app' }

function run(source: TerminalSource | null | (() => TerminalSource | null)) {
  const sockets: FakeExecSocket[] = []
  const output: string[] = []
  const info: [string, string][] = []
  const scope = effectScope()
  const term = scope.run(() =>
    useTerminal(
      source,
      { output: (d) => output.push(new TextDecoder().decode(d)), info: (t, tone) => info.push([t, tone]) },
      (url) => {
        const s = new FakeExecSocket(url)
        sockets.push(s)
        return s
      },
    ),
  )!
  return { term, sockets, output, info, scope }
}

describe('useTerminal', () => {
  it('connects to the exec endpoint and wires input, resize and output', () => {
    const { term, sockets, output } = run(src)
    const ws = sockets[0]!
    const u = new URL(ws.url)
    expect(u.pathname).toBe('/api/clusters/dev-1/exec')
    expect([...u.searchParams.entries()]).toEqual([['namespace', 'demo'], ['pod', 'web'], ['container', 'app']])
    expect(ws.binaryType).toBe('arraybuffer')

    term.resize(100, 30) // before open: remembered, sent on open
    ws.open()
    expect(term.status.value).toBe('open')
    term.input('ls\r')
    expect(ws.sent).toEqual([
      { type: 'resize', cols: 100, rows: 30 },
      { type: 'stdin', data: 'ls\r' },
    ])

    ws.receive(new TextEncoder().encode('hello').buffer as ArrayBuffer)
    expect(output).toEqual(['hello'])
  })

  it('reports exit, notices and errors', () => {
    const { term, sockets, info } = run(src)
    const ws = sockets[0]!
    ws.open()
    ws.receive(JSON.stringify({ type: 'notice', message: 'Session closed after 15m0s without input.' }))
    ws.receive(JSON.stringify({ type: 'exit', code: 3 }))
    expect(info).toEqual([
      ['Session closed after 15m0s without input.', 'warning'],
      ['Shell exited (code 3).', 'info'],
    ])
    ws.receive(JSON.stringify({ type: 'error', message: 'container "x" is not running' }))
    expect(term.status.value).toBe('error')
  })

  it('closes on dispose (navigation) and reconnects on container change', async () => {
    const container = ref('app')
    const { sockets, scope } = run(() => ({ ...src, container: container.value }))
    container.value = 'sidecar'
    await nextTick()
    expect(sockets[0]!.closed).toBe(true)
    expect(new URL(sockets[1]!.url).searchParams.get('container')).toBe('sidecar')
    scope.stop()
    expect(sockets[1]!.closed).toBe(true)
  })

  it('does not send before the socket is open', () => {
    const { term, sockets } = run(src)
    term.input('x')
    expect(sockets[0]!.sent).toEqual([])
    vi.restoreAllMocks()
  })
})
