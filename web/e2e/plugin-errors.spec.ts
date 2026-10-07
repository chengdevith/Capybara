import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import { DEMO_NS, kubectl } from './kube'
import { cleanup, connectOnDev2, repo } from './plugin-helpers'

// Run by playwright.plugin-dev.config.ts: the server serves unpinned dev
// bundles from .local/e2e-plugin-dev (--plugin-dev-dir). Deliberately broken
// Monitoring bundles must show visible errors, never blank areas.

const devBundle = resolve(repo, '.local/e2e-plugin-dev/monitoring/ui/dist/monitoring.js')
const writeBundle = (code: string) => {
  mkdirSync(dirname(devBundle), { recursive: true })
  writeFileSync(devBundle, code)
}

test.describe.configure({ mode: 'serial' })
test.setTimeout(300_000)

test.beforeAll(async ({ playwright }, info) => {
  writeBundle('export default { name: "monitoring", apiVersion: 1, register() {} }')
  const api = await playwright.request.newContext({ baseURL: info.project.use.baseURL })
  await cleanup(api)
  await connectOnDev2(api)
  await api.dispose()
})

test.afterAll(async ({ playwright }, info) => {
  const api = await playwright.request.newContext({ baseURL: info.project.use.baseURL })
  await cleanup(api)
  await api.dispose()
  rmSync(resolve(repo, '.local/e2e-plugin-dev'), { recursive: true, force: true })
})

test('a plugin bundle that fails to load shows an error on the cluster where it is enabled', async ({ page }) => {
  writeBundle('throw new Error("broken on purpose: the bundle throws while loading")\nexport default {}')
  await page.goto('/c/dev-2/home')
  await expect(page.getByTestId('plugin-load-error')).toContainText('broken on purpose: the bundle throws while loading')
  await expect(page.getByTestId('plugin-load-error')).toContainText("The monitoring plugin's UI could not be loaded")
  // dev-1 does not have the plugin: no banner there.
  await page.goto('/c/dev-1/home')
  await expect(page.getByTestId('overview-card-core.card.health')).toBeVisible()
  await expect(page.getByTestId('plugin-load-error')).toHaveCount(0)
  await page.goto('/marketplace/monitoring')
  await expect(page.getByTestId('ui-load-error')).toContainText('broken on purpose')
})

test('a plugin component that fails to load or render shows an error in its place', async ({ page }) => {
  writeBundle(`export default {
  name: 'monitoring',
  apiVersion: 1,
  register(api) {
    api.register({ type: 'resource-detail-tab', id: 'monitoring.tab.metrics', label: 'Metrics', order: 60, kinds: ['Pod'],
      component: () => Promise.resolve({ default: { setup() { throw new Error('broken on purpose: render') } } }) })
    api.register({ type: 'cluster-overview-card', id: 'monitoring.card.cluster', title: 'Resource usage', order: 40,
      component: () => Promise.reject(new Error('broken on purpose: missing chunk')) })
  },
}`)
  const pod = kubectl('dev-2', '-n', DEMO_NS, 'get', 'pods', '-o', 'jsonpath={.items[0].metadata.name}')
  await page.goto(`/c/dev-2/workloads/pods/${DEMO_NS}/${pod}`)
  await page.locator('.n-tabs-tab', { hasText: 'Metrics' }).click()
  const tabError = page.getByTestId('extension-error')
  await expect(tabError).toContainText('Metrics tab could not be shown')
  await expect(tabError).toContainText('broken on purpose: render')
  await expect(tabError).toContainText('monitoring plugin')
  // The rest of the page still works.
  await page.locator('.n-tabs-tab', { hasText: 'YAML' }).click()
  await expect(page.getByTestId('yaml-editor')).toBeVisible()

  await page.goto('/c/dev-2/home')
  const card = page.getByTestId('overview-card-monitoring.card.cluster')
  await expect(card.getByTestId('extension-error')).toContainText('broken on purpose: missing chunk')
  await expect(page.getByTestId('overview-card-core.card.health')).toBeVisible()
  await expect(page.getByTestId('plugin-load-error')).toHaveCount(0)
})
