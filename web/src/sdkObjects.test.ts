import { pluginObjects, PluginRequestError } from '@capybara/sdk'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('pluginObjects', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('posts to the object API and surfaces refusals with their problems', async () => {
    const calls: string[] = []
    vi.stubGlobal('fetch', vi.fn(async (url: string, init: RequestInit) => {
      calls.push(`${init.method} ${url} ${init.body ?? ''}`)
      if (init.method === 'POST' && !url.includes('_validate')) {
        return new Response(JSON.stringify({ error: 'refused', problems: [{ path: 'spec.x', message: 'no' }], warnings: ['w'] }), { status: 422 })
      }
      return new Response(JSON.stringify({ problems: [], warnings: [] }), { status: 200 })
    }))
    await pluginObjects.validate('dev-1', 'tekton', 'tasks', 'team', { metadata: { name: 'a' } }, 'a')
    const err = await pluginObjects.create('dev-1', 'tekton', 'tasks', 'team', {}).catch((e: unknown) => e)
    expect(err).toBeInstanceOf(PluginRequestError)
    expect((err as PluginRequestError).status).toBe(422)
    expect((err as PluginRequestError).problems).toEqual([{ path: 'spec.x', message: 'no' }])
    expect((err as PluginRequestError).warnings).toEqual(['w'])
    await pluginObjects.remove('dev-1', 'tekton', 'tasks', 'team', 'a b', 'u/1')
    expect(calls).toEqual([
      'POST /api/clusters/dev-1/plugin-objects/tekton/tasks/team/_validate {"object":{"metadata":{"name":"a"}},"name":"a"}',
      'POST /api/clusters/dev-1/plugin-objects/tekton/tasks/team {"object":{}}',
      'DELETE /api/clusters/dev-1/plugin-objects/tekton/tasks/team/a%20b?uid=u%2F1 ',
    ])
  })
})
