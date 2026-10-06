import { describe, expect, it } from 'vitest'
import { importMap, sharedModules } from './shared-modules'

describe('shared modules', () => {
  it('maps the shared packages to Capybara-served modules', () => {
    expect(importMap().imports).toEqual({
      vue: '/capybara-shared/vue.js',
      pinia: '/capybara-shared/pinia.js',
      'naive-ui': '/capybara-shared/naive-ui.js',
      '@capybara/sdk': '/capybara-shared/sdk.js',
    })
  })

  it('re-exports the console’s own copies', () => {
    const p = sharedModules() as unknown as { resolveId: (id: string) => string | undefined; load: (id: string) => string | undefined }
    const id = p.resolveId('/capybara-shared/naive-ui.js')!
    expect(p.load(id)).toBe("export * from 'naive-ui'\nexport { default } from 'naive-ui'\n")
    expect(p.load(p.resolveId('/capybara-shared/vue.js')!)).toBe("export * from 'vue'\n")
    expect(p.resolveId('/capybara-shared/lodash.js')).toBeUndefined()
  })
})
