import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import { DEMO_NS, kubectl, runningDemoPods } from './kube'

// Multi-cluster: dev-2 is unregistered, registered again through the UI
// from a kubeconfig for a throwaway ServiceAccount (capybara-e2e, 1-hour
// token), then stopped and started while dev-1 keeps working. Afterwards
// dev-2's original credentials are put back and the e2e account is
// deleted, which invalidates its token: runs leave no valid tokens behind.

const repo = resolve(import.meta.dirname, '../..')
const sa = (...args: string[]) => execFileSync(resolve(repo, 'hack/capybara-sa.sh'), ['dev-2', '--sa', 'capybara-e2e', ...args], { stdio: 'pipe' })
const e2eKubeconfig = resolve(repo, '.local/kubeconfig/capybara-dev-2-e2e.yaml')
const k3d = (...args: string[]) => execFileSync('k3d', args, { encoding: 'utf8', stdio: 'pipe' })

/** dev-2's registered kubeconfig, read from capybara-mgmt with the host's
 * admin kubeconfig and held only in memory. After an interrupted run it is
 * the e2e one; then fall back to the account file make cluster-up wrote. */
function originalKubeconfig(): string {
  let registered = ''
  try {
    const b64 = kubectl('mgmt', '-n', 'capybara-system', 'get', 'secret', 'dev-2-kubeconfig', '-o', 'jsonpath={.data.kubeconfig}')
    registered = Buffer.from(b64, 'base64').toString('utf8')
  } catch {
    // not registered
  }
  if (registered && !registered.includes('capybara-e2e')) return registered
  const fallback = resolve(repo, '.local/kubeconfig/capybara-dev-2-sa.yaml')
  if (!existsSync(fallback)) throw new Error('no kubeconfig to restore dev-2 with; run make cluster-up')
  return readFileSync(fallback, 'utf8')
}

let original = ''

test.describe.configure({ mode: 'serial' })

test.beforeAll(() => {
  original = originalKubeconfig()
})

test.afterAll(async ({ playwright }, testInfo) => {
  const api = await playwright.request.newContext({ baseURL: testInfo.project.use.baseURL })
  try {
    const registered = (await (await api.get('/api/clusters')).json()).some((c: { id: string }) => c.id === 'dev-2')
    const res = registered
      ? await api.put('/api/clusters/dev-2/kubeconfig', { data: { kubeconfig: original } })
      : await api.post('/api/clusters', { data: { id: 'dev-2', displayName: 'Dev 2', environment: 'dev', kubeconfig: original } })
    expect(res.ok(), `restoring dev-2: ${await res.text()}`).toBe(true)
  } finally {
    await api.dispose()
    sa('--delete')
  }
})

test('registering dev-2 from a ServiceAccount kubeconfig in the UI connects it', async ({ page, request }) => {
  // Unregister through the API, so the refusal rules apply (it must not
  // have Projects).
  const res = await request.delete('/api/clusters/dev-2?confirm=dev-2')
  expect([200, 404], await res.text()).toContain(res.status())
  sa('--duration', '1h')
  const token = /token: (\S+)/.exec(readFileSync(e2eKubeconfig, 'utf8'))![1]!

  const sent: string[] = []
  page.on('response', async (r) => {
    if (r.url().includes('/api/')) sent.push(await r.text().catch(() => ''))
  })

  await page.goto('/clusters')
  await expect(page.getByTestId('status-dev-1')).toBeVisible()
  await expect(page.getByTestId('status-dev-2')).toHaveCount(0)
  await page.getByTestId('add-cluster').click()
  await page.getByTestId('kubeconfig-file').setInputFiles(e2eKubeconfig)
  await expect(page.getByTestId('kubeconfig-summary')).toContainText('system:serviceaccount:capybara-system:capybara-e2e')
  await page.getByTestId('test-connection').click()
  await expect(page.getByTestId('test-ok')).toContainText('Connected as system:serviceaccount:capybara-system:capybara-e2e')
  await expect(page.getByTestId('cluster-admin-warning')).toHaveCount(0)
  await page.getByTestId('cluster-id').locator('input').fill('dev-2')
  await page.getByTestId('cluster-display-name').locator('input').fill('Dev 2')
  await page.getByTestId('save-cluster').click()

  await expect(page).toHaveURL(/\/clusters\/dev-2$/)
  await expect(page.getByTestId('cluster-status').first()).toHaveText('Connected', { timeout: 30_000 })
  expect(sent.some((s) => s.includes(token)), 'the token came back from the API').toBe(false)
})

test('a stopped cluster shows as Error while dev-1 keeps working, and recovers', async ({ browser }) => {
  test.setTimeout(300_000)
  const ctx = await browser.newContext()
  const pods = await ctx.newPage()
  const clusters = await ctx.newPage()
  await pods.goto(`/c/dev-1/workloads/pods?ns=${DEMO_NS}`)
  await expect(pods.getByText('Live', { exact: true })).toBeVisible()
  await clusters.goto('/clusters')
  await expect(clusters.getByTestId('status-dev-2')).toHaveText('Connected')

  try {
    k3d('cluster', 'stop', 'capybara-dev-2')
    await expect(clusters.getByTestId('status-dev-2')).toHaveText('Unreachable', { timeout: 60_000 })
    await expect(clusters.getByTestId('status-dev-1')).toHaveText('Connected')

    // dev-1 is unaffected: its Pods page still updates live.
    const [victim] = runningDemoPods()
    await expect(pods.getByRole('link', { name: victim })).toBeVisible()
    kubectl('dev-1', '-n', DEMO_NS, 'delete', 'pod', victim!, '--wait=false')
    await expect(pods.getByRole('link', { name: victim })).toHaveCount(0, { timeout: 30_000 })
    await expect(pods.getByRole('link', { name: /^demo-logger-/ })).toHaveCount(2, { timeout: 30_000 })

    // dev-2 stays selectable and explains itself.
    await clusters.goto('/c/dev-2/home')
    await expect(clusters.getByTestId('overview-card-core.card.health')).toContainText('Unreachable')
  } finally {
    k3d('cluster', 'start', 'capybara-dev-2', '--wait')
  }
  await clusters.goto('/clusters')
  await expect(clusters.getByTestId('status-dev-2')).toHaveText('Connected', { timeout: 120_000 })
  await ctx.close()
})

test('switching clusters keeps the page and shows the environment', async ({ page, request }) => {
  // Whatever the clusters' environments are now (they can be edited).
  const envs = Object.fromEntries(((await (await request.get('/api/clusters')).json()) as { id: string; environment: string }[]).map((c) => [c.id, c.environment]))
  await page.goto('/c/dev-1/workloads/pods')
  await expect(page.getByTestId('current-environment')).toHaveText(envs['dev-1']!)
  await page.getByTestId('cluster-switcher').click()
  await page.locator('.n-base-select-option', { hasText: 'Dev 2' }).click()
  await expect(page).toHaveURL(/\/c\/dev-2\/workloads\/pods$/)
  await expect(page.getByTestId('current-environment')).toHaveText(envs['dev-2']!)
  await expect(page.getByText('Live', { exact: true })).toBeVisible()
  await expect(page.getByTestId('prod-masthead')).toHaveCount(envs['dev-2'] === 'prod' ? 1 : 0)
})
