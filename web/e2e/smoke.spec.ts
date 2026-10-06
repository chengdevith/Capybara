import { expect, test, type Page } from '@playwright/test'
import { DEMO_DEPLOYMENT, DEMO_NS, DEMO_SECRET_VALUE, kubectl, runningDemoPods } from './kube'

// Smoke suite over the real stack. Only the capybara-demo namespace on
// dev-1 is changed, and global setup resets it.

const podPage = (name: string, tab?: string) =>
  `/c/dev-1/workloads/pods/${DEMO_NS}/${name}${tab ? `?tab=core.tab.${tab}` : ''}`
const deploymentPage = (tab?: string) =>
  `/c/dev-1/workloads/deployments/${DEMO_NS}/${DEMO_DEPLOYMENT}${tab ? `?tab=core.tab.${tab}` : ''}`

async function pickAction(page: Page, label: string) {
  await page.getByTestId('actions').click()
  await page.locator('.n-dropdown-option-body', { hasText: label }).click()
}

test('/ redirects to the first cluster and the sidebar comes from the registry', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/c\/dev-1\/home$/)
  const sidebar = page.locator('.n-layout-sider')
  for (const item of ['Home', 'Projects', 'Workloads', 'Pods', 'Deployments', 'Networking', 'Services', 'Config', 'ConfigMaps', 'Secrets', 'Administration', 'Namespaces', 'Audit']) {
    await expect(sidebar.getByText(item, { exact: true })).toBeVisible()
  }
})

test('the Pods page updates live when a pod is deleted with kubectl', async ({ page }) => {
  await page.goto(`/c/dev-1/workloads/pods?ns=${DEMO_NS}`)
  await expect(page.getByText('Live', { exact: true })).toBeVisible()
  const [victim] = runningDemoPods()
  await expect(page.getByRole('link', { name: victim })).toBeVisible()

  kubectl('dev-1', '-n', DEMO_NS, 'delete', 'pod', victim!, '--wait=false')

  // No reload: the row goes away and the replacement shows up.
  await expect(page.getByRole('link', { name: victim })).toHaveCount(0, { timeout: 30_000 })
  await expect(page.getByRole('link', { name: /^demo-logger-/ })).toHaveCount(2, { timeout: 30_000 })
})

test('pod logs stream live', async ({ page }) => {
  const [pod] = runningDemoPods()
  await page.goto(podPage(pod!, 'logs'))
  const output = page.getByTestId('log-output')
  await expect(output).toContainText('tick')
  const lastTick = async () => Math.max(...[...(await output.innerText()).matchAll(/tick (\d+)/g)].map((m) => Number(m[1])))
  const first = await lastTick()
  await expect.poll(lastTick, { timeout: 15_000 }).toBeGreaterThan(first)
})

test("editing a Deployment's YAML changes it in the cluster", async ({ page }) => {
  const value = `e2e-${Date.now()}`
  await page.goto(deploymentPage('yaml'))
  await page.getByTestId('yaml-edit').click()

  // Add a label: go to the end of an existing label line and press Enter;
  // Monaco keeps that line's indent, so the new line is a sibling label.
  const editor = page.getByTestId('yaml-editor')
  await editor.locator('.view-line', { hasText: 'app.kubernetes.io/name: demo-logger' }).first().click()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await page.keyboard.insertText(`e2e.capybara.io/edited: ${value}`)

  await page.getByTestId('yaml-review').click()
  await expect(page.getByTestId('yaml-diff')).toContainText(value)
  await page.getByTestId('yaml-apply').click()
  await expect(page.getByText('Deployment updated')).toBeVisible()

  expect(kubectl('dev-1', '-n', DEMO_NS, 'get', 'deployment', DEMO_DEPLOYMENT, '-o', 'jsonpath={.metadata.labels.e2e\\.capybara\\.io/edited}')).toBe(value)
})

test('scale, restart and delete work and show up in the Audit page', async ({ page }) => {
  await page.goto(deploymentPage())

  await pickAction(page, 'Scale')
  await page.getByTestId('replicas').locator('input').fill('3')
  await page.getByTestId('confirm').click()
  await expect.poll(() => kubectl('dev-1', '-n', DEMO_NS, 'get', 'deployment', DEMO_DEPLOYMENT, '-o', 'jsonpath={.spec.replicas}')).toBe('3')

  await pickAction(page, 'Restart rollout')
  await page.getByTestId('confirm').click()
  await expect
    .poll(() => kubectl('dev-1', '-n', DEMO_NS, 'get', 'deployment', DEMO_DEPLOYMENT, '-o', 'jsonpath={.spec.template.metadata.annotations.kubectl\\.kubernetes\\.io/restartedAt}'))
    .not.toBe('')

  const [victim] = runningDemoPods()
  await page.goto(podPage(victim!))
  await pickAction(page, 'Delete')
  await page.getByTestId('confirm').click() // Pods: simple confirmation
  await expect(page.getByText(/This Pod was deleted|is being deleted/).first()).toBeVisible()

  await page.goto('/c/dev-1/audit')
  const table = page.getByTestId('audit-table')
  await expect(table).toContainText('replicas 2 → 3')
  await expect(table.locator('tr', { hasText: 'restart' }).first()).toContainText('success')
  await expect(table.locator('tr', { hasText: `Pod/${victim}` }).first()).toContainText('delete')

  kubectl('dev-1', '-n', DEMO_NS, 'scale', `deployment/${DEMO_DEPLOYMENT}`, '--replicas=2')
  kubectl('dev-1', '-n', DEMO_NS, 'rollout', 'status', `deployment/${DEMO_DEPLOYMENT}`, '--timeout=120s')
})

test('the terminal opens a shell in a container and closes cleanly', async ({ page }) => {
  const [pod] = runningDemoPods()
  await page.goto(podPage(pod!, 'terminal'))
  await expect(page.getByTestId('terminal-status')).toHaveText('open')

  await page.getByTestId('terminal').click()
  await page.keyboard.type('echo capybara-$((1+1))')
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('terminal').locator('.xterm-rows')).toContainText('capybara-2')

  // Leaving the page ends the session; the audit log says how it ended.
  await page.locator('.n-layout-sider').getByText('Audit', { exact: true }).click()
  const table = page.getByTestId('audit-table')
  await expect(table.locator('tr', { hasText: 'exec-close' }).first()).toContainText('closed by the user')
  await expect(table.locator('tr', { hasText: 'exec-open' }).first()).toContainText('success')
  await expect(table).not.toContainText('capybara-$((1+1))')
})

test('the Secrets list and detail show no values until Reveal', async ({ page }) => {
  const b64 = Buffer.from(DEMO_SECRET_VALUE).toString('base64')
  const seen: string[] = []
  page.on('response', async (r) => {
    if (r.url().includes('/api/')) seen.push(await r.text().catch(() => ''))
  })
  page.on('websocket', (ws) => ws.on('framereceived', (f) => seen.push(String(f.payload))))
  const leaked = () => seen.some((s) => s.includes(DEMO_SECRET_VALUE) || s.includes(b64))

  await page.goto(`/c/dev-1/config/secrets?ns=${DEMO_NS}`)
  await expect(page.getByRole('link', { name: 'demo-credentials' })).toBeVisible()
  await page.getByRole('link', { name: 'demo-credentials' }).click()
  await page.locator('.n-tabs-tab', { hasText: 'YAML' }).click()
  await expect(page.getByTestId('secret-hidden')).toBeVisible()
  await expect(page.getByTestId('yaml-editor')).toContainText('demo-credentials')
  await page.waitForTimeout(1000) // let any stray request arrive
  expect(leaked(), 'a Secret value reached the browser before Reveal').toBe(false)
  await expect(page.getByTestId('yaml-editor')).not.toContainText('last-applied-configuration')

  await page.getByTestId('secret-reveal').click()
  await expect(page.getByTestId('yaml-editor')).toContainText(b64)
  expect(leaked()).toBe(true)
})

test('dark mode renders the pages without errors', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'dark' })
  const page = await context.newPage()
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`/c/dev-1/workloads/pods?ns=${DEMO_NS}`)
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.getByText('Live', { exact: true })).toBeVisible()
  await page.goto(deploymentPage('yaml'))
  await expect(page.getByTestId('yaml-editor')).toContainText('apiVersion')
  await page.goto('/c/dev-1/audit')
  await expect(page.getByTestId('audit-table')).toBeVisible()
  expect(errors).toEqual([])
  await context.close()
})
