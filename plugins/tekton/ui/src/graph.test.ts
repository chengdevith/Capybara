import assert from 'node:assert/strict'
import { test } from 'node:test'
import { dependencies, layout } from './graph.ts'

test('columns follow runAfter and result references', () => {
  const g = layout([
    { name: 'fetch' },
    { name: 'test', runAfter: ['fetch'] },
    { name: 'lint', runAfter: ['fetch'] },
    { name: 'build', params: [{ name: 'v', value: '$(tasks.test.results.version)' }] },
    { name: 'push', runAfter: ['build', 'lint'] },
  ], [{ name: 'notify' }])
  const at = Object.fromEntries(g.nodes.map((n) => [n.name, [n.column, n.row]]))
  assert.deepEqual(at, { fetch: [0, 0], test: [1, 0], lint: [1, 1], build: [2, 0], push: [3, 0], notify: [4, 0] })
  assert.equal(g.columns, 5)
  assert.equal(g.rows, 2)
  assert.ok(g.edges.some((e) => e.from === 'test' && e.to === 'build'))
  assert.ok(g.edges.some((e) => e.from === 'push' && e.to === 'notify'))
})

test('unknown and self references are ignored; cycles do not hang', () => {
  const names = new Set(['a', 'b'])
  assert.deepEqual(dependencies({ name: 'a', runAfter: ['zzz', 'a'], when: [{ input: '$(tasks.b.results.ok)' }] }, names), ['b'])
  const g = layout([{ name: 'a', runAfter: ['b'] }, { name: 'b', runAfter: ['a'] }])
  assert.equal(g.nodes.length, 2)
})

test('an empty pipeline has no columns', () => {
  assert.deepEqual(layout([]), { nodes: [], edges: [], columns: 0, rows: 1 })
})
