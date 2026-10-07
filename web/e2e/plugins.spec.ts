import { expect, test, type Page } from '@playwright/test'
import { DEMO_NS, kubectl, runningDemoPods } from './kube'
import { cleanup, connectFlags, installerFile, sa, sampleProm, setInstaller } from './plugin-helpers'

// Plugin framework end to end, with the Monitoring plugin (shown as "Observe"):
//  1. dev-1: installer credential set in the UI, kube-prometheus-stack
//     installed from the Marketplace until Ready, Metrics tab on dev-1 only,
//     disabling hides the UI while Prometheus keeps running.
//  2. dev-2: Connect existing to a hand-installed Prometheus with a
//     connect-only installer credential.
//  3. Uninstall both (dev-1 also removes the CRDs after the scan).
// Installer credentials are throwaway (1-hour tokens) and deleted at the end.

test.describe.configure({ mode: 'serial' })
test.setTimeout(600_000)

test.beforeAll(async ({ playwright }, info) => {
  const api = await playwright.request.newContext({ baseURL: info.project.use.baseURL })
  await cleanup(api)
  await api.dispose()
})

test.afterAll(async ({ playwright }, info) => {
  const api = await playwright.request.newContext({ baseURL: info.project.use.baseURL })
  await cleanup(api)
  await api.dispose()
})

async function installFromMarketplace(page: Page, cluster: string, mode: 'Install' | 'Connect existing') {
  await page.goto('/marketplace')
  await page.getByTestId('plugin-monitoring').click()
  await page.getByTestId('install-plugin').click()
  await page.getByTestId('install-cluster').click()
  await page.locator('.n-base-select-option', { hasText: `(${cluster})` }).click()
  await page.getByTestId('install-mode').getByText(mode, { exact: true }).click()
  await page.getByTestId('install-submit').click()
  await expect(page.getByTestId(`installation-${cluster}`)).toBeVisible()
}

const phase = (page: Page, cluster: string) => page.getByTestId(`installation-${cluster}`).getByTestId('installation-phase')

async function demoPodPage(page: Page, cluster: string) {
  const pod = cluster === 'dev-1' ? runningDemoPods()[0]! : kubectl('dev-2', '-n', DEMO_NS, 'get', 'pods', '-o', 'jsonpath={.items[0].metadata.name}')
  await page.goto(`/c/${cluster}/workloads/pods/${DEMO_NS}/${pod}`)
  await expect(page.locator('.n-tabs-tab', { hasText: 'YAML' })).toBeVisible()
}

test('install on dev-1 from the Marketplace with an installer credential set in the UI', async ({ page }) => {
  // Without an installer credential, installs are refused up front.
  await page.goto('/marketplace')
  await page.getByTestId('plugin-monitoring').click()
  await page.getByTestId('install-plugin').click()
  await page.getByTestId('install-cluster').click()
  await page.locator('.n-base-select-option', { hasText: '(dev-1)' }).click()
  await expect(page.getByTestId('installs-disabled')).toBeVisible()
  await expect(page.getByTestId('install-submit')).toBeDisabled()

  sa('dev-1', '--installer', 'monitoring', '--duration', '1h')
  await page.goto('/clusters/dev-1')
  await expect(page.getByTestId('plugin-installs')).toHaveText('Disabled')
  await page.getByTestId('set-installer').click()
  await page.getByTestId('kubeconfig-file').setInputFiles(installerFile('dev-1'))
  await page.getByTestId('test-connection').click()
  await expect(page.getByTestId('test-ok')).toContainText('capybara-installer')
  await page.getByTestId('save-installer').click()
  await expect(page.getByTestId('plugin-installs')).toHaveText('Enabled', { timeout: 60_000 })

  await installFromMarketplace(page, 'dev-1', 'Install')
  await expect(phase(page, 'dev-1')).toHaveText('Ready', { timeout: 480_000 })
  for (const step of ['chart', 'prometheus', 'targets', 'grafana']) {
    await expect(page.getByTestId(`step-${step}`)).toBeVisible()
  }
})

test('the Metrics tab shows on dev-1 only, and disabling hides the UI while Prometheus keeps running', async ({ page }) => {
  await demoPodPage(page, 'dev-1')
  await page.locator('.n-tabs-tab', { hasText: 'Metrics' }).click()
  await expect(page.getByTestId('monitoring-metrics').locator('canvas').first()).toBeVisible({ timeout: 60_000 })
  await expect(page.locator('.n-layout-sider').getByText('Observe', { exact: true })).toBeVisible()

  await demoPodPage(page, 'dev-2')
  await expect(page.locator('.n-tabs-tab', { hasText: 'Metrics' })).toHaveCount(0)
  await expect(page.locator('.n-layout-sider').getByText('Observe', { exact: true })).toHaveCount(0)

  // Grafana through Capybara: dashboard queries may POST, admin/user/org/data-source writes may not.
  const post = (path: string, body: unknown) =>
    page.evaluate(async ([p, b]) => (await fetch(p as string, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) })).status, [path, body] as const)
  const g = '/api/plugins/monitoring/grafana/dev-1'
  expect(await post(`${g}/api/ds/query`, {
    queries: [{ refId: 'A', datasource: { uid: 'prometheus', type: 'prometheus' }, expr: 'up', instant: true }], from: 'now-5m', to: 'now',
  })).toBe(200)
  for (const path of ['/api/admin/users', '/api/user/password', '/api/orgs', '/api/datasources']) {
    expect(await post(`${g}${path}`, {}), path).toBe(403)
  }

  // Disable on dev-1.
  await page.goto('/marketplace/monitoring')
  await page.getByTestId('installation-dev-1').getByTestId('installation-enabled').click()
  await expect(phase(page, 'dev-1')).toHaveText('Disabled', { timeout: 60_000 })
  await expect.poll(async () => {
    await demoPodPage(page, 'dev-1')
    return page.locator('.n-tabs-tab', { hasText: 'Metrics' }).count()
  }, { timeout: 60_000 }).toBe(0)
  await expect(page.locator('.n-layout-sider').getByText('Observe', { exact: true })).toHaveCount(0)
  // The tool itself keeps running.
  const running = kubectl('dev-1', '-n', 'capybara-monitoring', 'get', 'pods', '-o', 'jsonpath={range .items[*]}{.metadata.name}={.status.phase} {end}')
  expect(running).toMatch(/prometheus-capybara-monitoring-prometheus-0=Running/)
  expect(running).toMatch(/capybara-monitoring-grafana-[^=]+=Running/)

  // And back.
  await page.goto('/marketplace/monitoring')
  await page.getByTestId('installation-dev-1').getByTestId('installation-enabled').click()
  await expect(phase(page, 'dev-1')).toHaveText('Ready', { timeout: 60_000 })
})

test('Connect existing on dev-2 to a hand-installed Prometheus with a connect-only installer', async ({ page, request }) => {
  kubectl('dev-2', 'apply', '-f', sampleProm)
  kubectl('dev-2', '-n', 'monitoring', 'rollout', 'status', 'deploy/prometheus', '--timeout=180s')
  await setInstaller(request, 'dev-2', ...connectFlags)
  // The connect-only credential cannot do anything cluster-wide.
  const canI = (...args: string[]) => {
    try {
      return kubectl('dev-2', 'auth', 'can-i', ...args, '--as', 'system:serviceaccount:capybara-system:capybara-installer')
    } catch (e) {
      return String((e as { stdout?: string }).stdout ?? '').trim() // "no" exits 1
    }
  }
  expect(canI('create', 'clusterroles')).toBe('no')
  expect(canI('get', 'secrets', '-n', 'monitoring')).toBe('no')
  expect(canI('create', 'serviceaccounts', '-n', 'monitoring')).toBe('yes')

  await expect.poll(async () => {
    const cs = (await (await request.get('/api/clusters')).json()) as { id: string; status: { pluginInstalls?: string } }[]
    return cs.find((c) => c.id === 'dev-2')?.status.pluginInstalls
  }, { timeout: 60_000 }).toBe('Enabled')

  await installFromMarketplace(page, 'dev-2', 'Connect existing')
  await expect(phase(page, 'dev-2')).toHaveText('Ready', { timeout: 180_000 })

  await page.goto('/c/dev-2/monitoring')
  await expect(page.getByTestId('targets')).toContainText('up', { timeout: 60_000 })
  await demoPodPage(page, 'dev-2')
  await page.locator('.n-tabs-tab', { hasText: 'Metrics' }).click()
  await expect(page.getByTestId('monitoring-metrics').locator('canvas').first()).toBeVisible({ timeout: 60_000 })
})

const pvcs = () => kubectl('dev-1', '-n', 'capybara-monitoring', 'get', 'pvc', '-o', 'name').split('\n').filter(Boolean)
const helmReleases = () => kubectl('dev-1', '-n', 'capybara-monitoring', 'get', 'secret', '-l', 'owner=helm', '-o', 'name')
const monitoringCRDs = () => kubectl('dev-1', 'get', 'crd', '-o', 'name').split('\n').filter((n) => n.includes('monitoring.coreos.com'))

test('uninstall keeping data: the release goes, the Prometheus volume stays', async ({ page }) => {
  // Connect mode first: only the plugin's account goes; the connected Prometheus stays.
  await page.goto('/marketplace/monitoring')
  await page.getByTestId('installation-dev-2').getByTestId('uninstall').click()
  await page.getByTestId('confirm-name').locator('input').fill('monitoring.dev-2')
  await page.getByTestId('confirm').click()
  await expect(page.getByTestId('installation-dev-2')).toHaveCount(0, { timeout: 120_000 })
  expect(() => kubectl('dev-2', '-n', 'monitoring', 'get', 'serviceaccount', 'capybara-plugin-monitoring')).toThrow()
  expect(kubectl('dev-2', '-n', 'monitoring', 'get', 'deploy', 'prometheus', '-o', 'name')).toBe('deployment.apps/prometheus')

  const before = pvcs()
  expect(before.some((n) => n.includes('prometheus-capybara-monitoring-prometheus'))).toBe(true)
  await page.getByTestId('installation-dev-1').getByTestId('uninstall').click()
  await expect(page.getByTestId('keep-data')).toBeChecked() // keeping data is the default
  await page.getByTestId('confirm-name').locator('input').fill('monitoring.dev-1')
  await page.getByTestId('confirm').click()
  await expect(page.getByTestId('installation-dev-1')).toHaveCount(0, { timeout: 300_000 })

  expect(helmReleases()).toBe('')
  expect(pvcs()).toEqual(before) // the metrics volume is still there
  expect(monitoringCRDs().length).toBeGreaterThan(0) // CRDs were not asked to go
  await expect.poll(() => kubectl('dev-1', '-n', 'capybara-monitoring', 'get', 'statefulset', '-o', 'name'), { timeout: 120_000 }).toBe('')
})

test('reinstall over the kept CRDs and volume, then uninstall removing data and CRDs', async ({ page, request }) => {
  // The CRDs an earlier uninstall kept are recognised as this plugin's.
  const res = await request.post('/api/plugins/installations', { data: { plugin: 'monitoring', cluster: 'dev-1', mode: 'install' } })
  expect(res.ok(), await res.text()).toBe(true)
  await page.goto('/marketplace/monitoring')
  await expect(phase(page, 'dev-1')).toHaveText('Ready', { timeout: 480_000 })

  await page.getByTestId('installation-dev-1').getByTestId('uninstall').click()
  await page.getByTestId('keep-data').click() // do not keep
  await page.getByTestId('remove-crds').click()
  await expect(page.getByTestId('no-foreign').or(page.getByTestId('foreign-objects'))).toBeVisible({ timeout: 60_000 })
  if (await page.getByTestId('confirm-foreign').count()) await page.getByTestId('confirm-foreign').click()
  await page.getByTestId('confirm-name').locator('input').fill('monitoring.dev-1')
  await page.getByTestId('confirm').click()
  await expect(page.getByTestId('installation-dev-1')).toHaveCount(0, { timeout: 300_000 })
  expect(monitoringCRDs()).toEqual([])
  expect(pvcs()).toEqual([])
})
