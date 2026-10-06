import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, test } from '@playwright/test'
import { DEMO_NS, kubectl, runningDemoPods } from './kube'

// Multi-cluster: dev-2 is unregistered, registered again from a fresh
// ServiceAccount kubeconfig through the UI, then stopped and started while
// dev-1 keeps working. Leaves dev-2 registered and running.

const repo = resolve(import.meta.dirname, '../..')
const saKubeconfig = resolve(repo, '.local/kubeconfig/capybara-dev-2-sa.yaml')
const k3d = (...args: string[]) => execFileSync('k3d', args, { encoding: 'utf8', stdio: 'pipe' })

test.describe.configure({ mode: 'serial' })

test('registering dev-2 from a ServiceAccount kubeconfig in the UI connects it', async ({ page, request }) => {
  // Unregister through the API, so the refusal rules apply (it must not
  // have Projects).
  const res = await request.delete('/api/clusters/dev-2?confirm=dev-2')
  expect([200, 404], await res.text()).toContain(res.status())
  execFileSync(resolve(repo, 'hack/capybara-sa.sh'), ['dev-2', '--with-secrets'], { stdio: 'pipe' })
  const token = /token: (\S+)/.exec(readFileSync(saKubeconfig, 'utf8'))![1]!

  const sent: string[] = []
  page.on('response', async (r) => {
    if (r.url().includes('/api/')) sent.push(await r.text().catch(() => ''))
  })

  await page.goto('/clusters')
  await expect(page.getByTestId('status-dev-1')).toBeVisible()
  await expect(page.getByTestId('status-dev-2')).toHaveCount(0)
  await page.getByTestId('add-cluster').click()
  await page.getByTestId('kubeconfig-file').setInputFiles(saKubeconfig)
  await expect(page.getByTestId('kubeconfig-summary')).toContainText('system:serviceaccount:capybara-system:capybara')
  await page.getByTestId('test-connection').click()
  await expect(page.getByTestId('test-ok')).toContainText('Connected as system:serviceaccount:capybara-system:capybara')
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

test('switching clusters keeps the page and shows the environment', async ({ page }) => {
  await page.goto('/c/dev-1/workloads/pods')
  await expect(page.getByTestId('current-environment')).toHaveText('dev')
  await page.getByTestId('cluster-switcher').click()
  await page.locator('.n-base-select-option', { hasText: 'Dev 2' }).click()
  await expect(page).toHaveURL(/\/c\/dev-2\/workloads\/pods$/)
  await expect(page.getByText('Live', { exact: true })).toBeVisible()
  await expect(page.getByTestId('prod-masthead')).toHaveCount(0)
})
