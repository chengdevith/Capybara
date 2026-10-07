import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { DEMO_NS, kubectl, runningDemoPods } from './kube'

// Plugin framework end to end, with the Monitoring plugin:
//  1. dev-1: installer credential set in the UI, kube-prometheus-stack
//     installed from the Marketplace until Ready, Metrics tab on dev-1 only,
//     disabling hides the UI while Prometheus keeps running.
//  2. dev-2: Connect existing to a hand-installed Prometheus with a
//     connect-only installer credential.
//  3. Uninstall both (dev-1 also removes the CRDs after the scan).
// Installer credentials are throwaway (1-hour tokens) and deleted at the end.

const repo = resolve(import.meta.dirname, '../..')
const sampleProm = resolve(repo, 'deploy/samples/prometheus-connect.yaml')
const installerFile = (id: string) => resolve(repo, `.local/kubeconfig/capybara-${id}-installer.yaml`)
const sa = (...args: string[]) => execFileSync(resolve(repo, 'hack/capybara-sa.sh'), args, { stdio: 'pipe' })

interface Inst {
  id: string
  uid: string
  spec: { cluster: string; mode: string }
  status: { phase?: string }
}

async function installations(api: APIRequestContext): Promise<Inst[]> {
  return (await (await api.get('/api/plugins/_installations')).json()) as Inst[]
}

async function setInstaller(api: APIRequestContext, id: string, ...extra: string[]) {
  sa(id, '--installer', 'monitoring', '--duration', '1h', ...extra)
  const res = await api.put(`/api/clusters/${id}/installer`, { data: { kubeconfig: readFileSync(installerFile(id), 'utf8') } })
  expect(res.ok(), await res.text()).toBe(true)
}

const connectFlags = ['--connect', '--set', 'namespace=monitoring', '--set', 'service=prometheus', '--set', 'port=9090']

/** Back to a clean slate: no installations, no installer credentials, no sample Prometheus. */
async function cleanup(api: APIRequestContext) {
  const existing = await installations(api)
  if (existing.length) {
    // Uninstalling needs the installer credentials.
    if (existing.some((i) => i.spec.cluster === 'dev-1')) await setInstaller(api, 'dev-1')
    if (existing.some((i) => i.spec.cluster === 'dev-2')) await setInstaller(api, 'dev-2', ...connectFlags)
    for (const i of existing) {
      await api.delete(`/api/plugins/installations/${i.id}?confirm=${i.id}&uid=${i.uid}&keepData=false`)
    }
    await expect.poll(async () => (await installations(api)).length, { timeout: 240_000, intervals: [3000] }).toBe(0)
  }
  for (const id of ['dev-1', 'dev-2']) {
    await api.delete(`/api/clusters/${id}/installer`)
    sa(id, '--sa', 'capybara-installer', '--delete')
  }
  kubectl('dev-2', 'delete', '-f', sampleProm, '--ignore-not-found', '--wait=false')
}

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
  await expect(page.locator('.n-layout-sider').getByText('Monitoring', { exact: true })).toBeVisible()

  await demoPodPage(page, 'dev-2')
  await expect(page.locator('.n-tabs-tab', { hasText: 'Metrics' })).toHaveCount(0)
  await expect(page.locator('.n-layout-sider').getByText('Monitoring', { exact: true })).toHaveCount(0)

  // Disable on dev-1.
  await page.goto('/marketplace/monitoring')
  await page.getByTestId('installation-dev-1').getByTestId('installation-enabled').click()
  await expect(phase(page, 'dev-1')).toHaveText('Disabled', { timeout: 60_000 })
  await expect.poll(async () => {
    await demoPodPage(page, 'dev-1')
    return page.locator('.n-tabs-tab', { hasText: 'Metrics' }).count()
  }, { timeout: 60_000 }).toBe(0)
  await expect(page.locator('.n-layout-sider').getByText('Monitoring', { exact: true })).toHaveCount(0)
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

test('uninstall: connect mode removes only the account; install mode removes the release and, after the scan, the CRDs', async ({ page }) => {
  await page.goto('/marketplace/monitoring')
  await page.getByTestId('installation-dev-2').getByTestId('uninstall').click()
  await page.getByTestId('confirm-name').locator('input').fill('monitoring.dev-2')
  await page.getByTestId('confirm').click()
  await expect(page.getByTestId('installation-dev-2')).toHaveCount(0, { timeout: 120_000 })
  expect(() => kubectl('dev-2', '-n', 'monitoring', 'get', 'serviceaccount', 'capybara-plugin-monitoring')).toThrow()
  expect(kubectl('dev-2', '-n', 'monitoring', 'get', 'deploy', 'prometheus', '-o', 'name')).toBe('deployment.apps/prometheus')

  await page.getByTestId('installation-dev-1').getByTestId('uninstall').click()
  await page.getByTestId('keep-data').click() // do not keep
  await page.getByTestId('remove-crds').click()
  await expect(page.getByTestId('no-foreign').or(page.getByTestId('foreign-objects'))).toBeVisible({ timeout: 60_000 })
  if (await page.getByTestId('confirm-foreign').count()) await page.getByTestId('confirm-foreign').click()
  await page.getByTestId('confirm-name').locator('input').fill('monitoring.dev-1')
  await page.getByTestId('confirm').click()
  await expect(page.getByTestId('installation-dev-1')).toHaveCount(0, { timeout: 300_000 })
  expect(kubectl('dev-1', 'get', 'crd', '-o', 'name').split('\n').filter((n) => n.includes('monitoring.coreos.com'))).toEqual([])
  expect(kubectl('dev-1', '-n', 'capybara-monitoring', 'get', 'pvc', '-o', 'name')).toBe('')
})
