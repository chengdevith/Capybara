import assert from 'node:assert/strict'
import { test } from 'node:test'
import { freeNodeGlobals } from './check-bundle.mjs'

const names = (code) => freeNodeGlobals(code).map((f) => f.name)

test('flags free references to Node globals', () => {
  assert.deepEqual(names('export default () => [process.env.X, Buffer.from("a"), global.y, require("z")]'), ['process', 'Buffer', 'global', 'require'])
  assert.deepEqual(names('export const ok = typeof Buffer < "u"'), ['Buffer'])
})

test('ignores keys, properties, strings and local variables', () => {
  const code = `
    const o = { global: 1, process: 2, ['x']: 3 }; o.require = 4; o.global
    const s = "uses process and require"
    function f(require) { return require('x') }
    function g() { var Buffer = 1; return Buffer }
    class C { process() {} }
    export default [o, s, f, g, C]`
  assert.deepEqual(names(code), [])
})
