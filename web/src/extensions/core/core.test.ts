import { describe, expect, it } from 'vitest'
import { createRegistry } from '../registry'
import { navTree } from '../resolve'
import { registerCoreExtensions } from '.'

describe('core extensions', () => {
  it('register without conflicts and give a Home landing page', () => {
    const r = createRegistry()
    registerCoreExtensions(r)
    const tree = navTree(r, { cluster: 'dev-1' })
    expect(tree[0]).toMatchObject({ kind: 'item', item: { label: 'Home', route: 'core.home' } })
    expect(r.all('route').every((route) => route.source === 'core')).toBe(true)
  })
})
