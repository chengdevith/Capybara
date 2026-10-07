import { resolve } from 'node:path'
import { expect, test, type Page } from '@playwright/test'
import { DEMO_NS, kubectl, kubectlStdin } from './kube'
import { cleanup, installerCan, installFromMarketplace, phase, pluginInstalls, repo, setInstallerFor, tektonRelease } from './plugin-helpers'

// The Pipelines (Tekton) plugin end to end:
//  1. dev-1: Tekton installed from the Marketplace until Ready.
//  2. A sample run: its tasks and step logs; nothing of the plugin on dev-2.
//  3. Rerun and cancel from the console, both in the audit log.
//  4. dev-2: Connect existing to a hand-applied Tekton (the vendored
//     upstream release) with a connect-only installer.
//  5. Uninstall both: connect leaves that Tekton alone; install removes the
//     release and, after the scan, the CRDs.
// Installer credentials are throwaway (1-hour tokens) and deleted at the end.

const samplePipeline = resolve(repo, 'deploy/samples/tekton-pipeline.yaml')
const sampleRun = resolve(repo, 'deploy/samples/tekton-run.yaml')

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

const sider = (page: Page) => page.locator('.n-layout-sider')

/** Starts a run of the sample Pipeline (deploy/samples/tekton-run.yaml). */
const startRun = () => kubectl('dev-1', 'create', '-f', sampleRun, '-o', 'jsonpath={.metadata.name}')

/** A run whose second task works for 5 minutes (to cancel). */
const startLongRun = () =>
  kubectlStdin('dev-1', [
    'apiVersion: tekton.dev/v1',
    'kind: PipelineRun',
    `metadata: {generateName: hello-long-, namespace: ${DEMO_NS}}`,
    'spec:',
    '  pipelineRef: {name: hello}',
    '  params: [{name: seconds, value: "300"}]',
  ].join('\n'), 'create', '-f', '-', '-o', 'jsonpath={.metadata.name}')

const reason = (name: string) =>
  kubectl('dev-1', '-n', DEMO_NS, 'get', 'pipelinerun', name, '-o', 'jsonpath={.status.conditions[?(@.type=="Succeeded")].reason}')

async function runAction(page: Page, label: string) {
  await page.getByTestId('actions').click()
  await page.locator('.n-dropdown-option', { hasText: label }).click()
}

test('install on dev-1 from the Marketplace', async ({ page, request }) => {
  await setInstallerFor(request, 'dev-1', 'tekton')
  await expect.poll(() => pluginInstalls(request, 'dev-1'), { timeout: 60_000 }).toBe('Enabled')
  await installFromMarketplace(page, 'tekton', 'dev-1', 'Install')
  await expect(phase(page, 'dev-1')).toHaveText('Ready', { timeout: 300_000 })
  for (const step of ['chart', 'api', 'controller', 'webhook', 'resolvers', 'admission']) {
    await expect(page.getByTestId(`step-${step}`)).toBeVisible()
  }
  // Upstream's namespace labels survive the chart (the controller sets them),
  // and only the cluster resolver is on.
  expect(kubectl('dev-1', 'get', 'ns', 'tekton-pipelines', '-o', 'jsonpath={.metadata.labels.pod-security\\.kubernetes\\.io/enforce}')).toBe('restricted')
  const flags = JSON.parse(kubectl('dev-1', '-n', 'tekton-pipelines-resolvers', 'get', 'cm', 'resolvers-feature-flags', '-o', 'jsonpath={.data}')) as Record<string, string>
  expect(Object.entries(flags).filter(([, v]) => v === 'true').map(([k]) => k)).toEqual(['enable-cluster-resolver'])
})

test('a sample run with its tasks and step logs; nothing of the plugin on dev-2', async ({ page }) => {
  kubectl('dev-1', 'apply', '-f', samplePipeline)
  const run = startRun()
  await page.goto(`/c/dev-1/tekton/pipelineruns?ns=${DEMO_NS}`)
  await expect(page.getByRole('link', { name: run })).toBeVisible()
  await expect(sider(page).getByText('PipelineRuns', { exact: true })).toBeVisible()

  await page.getByRole('link', { name: run }).click()
  await page.locator('.n-tabs-tab', { hasText: 'Tasks' }).click()
  await expect(page.getByTestId('task-work').getByTestId('run-status')).toHaveText('Succeeded', { timeout: 180_000 })
  await page.getByTestId('task-greet').click()
  await expect(page.getByTestId('log-output')).toContainText('Hello, Capybara!', { timeout: 60_000 })
  await page.getByTestId('task-work').click()
  await expect(page.getByTestId('log-output')).toContainText('working 5/5', { timeout: 60_000 })

  // The TaskRun's own page has a Logs tab too.
  await page.getByTestId('task-work').getByRole('link').click()
  await page.locator('.n-tabs-tab', { hasText: 'Logs' }).click()
  await expect(page.getByTestId('tekton-taskrun-logs').getByTestId('log-output')).toContainText('done', { timeout: 60_000 })

  // dev-2 has no Tekton: no Pipelines section, no Tekton pages.
  await page.goto('/c/dev-2/workloads/pods')
  await expect(sider(page).getByText('Workloads', { exact: true })).toBeVisible()
  await expect(sider(page).getByText('PipelineRuns', { exact: true })).toHaveCount(0)
})

test('rerun and cancel from the console, both audited', async ({ page, request }) => {
  const original = kubectl('dev-1', '-n', DEMO_NS, 'get', 'pipelineruns', '-l', 'tekton.dev/pipeline=hello', '-o', 'jsonpath={.items[0].metadata.name}')
  await page.goto(`/c/dev-1/tekton/pipelineruns/${DEMO_NS}/${original}`)
  await runAction(page, 'Rerun')
  await page.getByTestId('confirm').click()
  const created = page.getByTestId('rerun-created').getByRole('link')
  await expect(created).toBeVisible()
  const rerun = (await created.innerText()).trim()
  expect(kubectl('dev-1', '-n', DEMO_NS, 'get', 'pipelinerun', rerun, '-o', 'jsonpath={.metadata.annotations.platform\\.capybara\\.io/copy-of}')).toBe(original)
  await created.click()
  await expect(page).toHaveURL(new RegExp(`/tekton/pipelineruns/${DEMO_NS}/${rerun}$`))

  // A long run, cancelled while its second task works.
  const long = startLongRun()
  await page.goto(`/c/dev-1/tekton/pipelineruns/${DEMO_NS}/${long}`)
  await page.locator('.n-tabs-tab', { hasText: 'Tasks' }).click()
  await expect(page.getByTestId('task-work').getByTestId('run-status')).toHaveText('Running', { timeout: 120_000 })
  await expect(page.getByTestId('log-output')).toContainText('working', { timeout: 60_000 })
  await runAction(page, 'Cancel run')
  await page.getByTestId('confirm').click()
  await expect.poll(() => reason(long), { timeout: 120_000 }).toBe('Cancelled')
  await expect(page.getByTestId('task-work').getByTestId('run-status')).toHaveText('TaskRunCancelled', { timeout: 60_000 })

  // Finished runs cannot be cancelled: the dialog says so, and the server refuses.
  await runAction(page, 'Cancel run')
  await expect(page.locator('.n-dialog')).toContainText('nothing to cancel')
  await page.getByTestId('confirm').click() // "Close"
  await expect(page.locator('.n-dialog')).toHaveCount(0)
  const uid = kubectl('dev-1', '-n', DEMO_NS, 'get', 'pipelinerun', long, '-o', 'jsonpath={.metadata.uid}')
  const refused = await request.post('/api/clusters/dev-1/plugin-actions/tekton/cancel', { data: { namespace: DEMO_NS, name: long, uid } })
  expect(refused.status()).toBe(409)

  // Audited, with the outcome.
  const audit = (await (await request.get('/api/audit?limit=100')).json()) as { items: { action: string; name: string; result: string; detail?: string }[] }
  const entry = (action: string, name: string) => audit.items.find((e) => e.action === action && e.name === name)
  expect(entry('tekton.rerun', original)).toMatchObject({ result: 'success', detail: `created PipelineRun ${rerun} from ${original}` })
  expect(audit.items.filter((e) => e.action === 'tekton.cancel' && e.name === long).map((e) => e.result).sort()).toEqual(['failure', 'success'])
})

test('Connect existing on dev-2 to a hand-applied Tekton with a connect-only installer', async ({ page, request }) => {
  kubectl('dev-2', 'apply', '--server-side', '-f', tektonRelease)
  for (const d of ['tekton-pipelines-controller', 'tekton-pipelines-webhook']) {
    kubectl('dev-2', '-n', 'tekton-pipelines', 'rollout', 'status', `deploy/${d}`, '--timeout=180s')
  }
  await setInstallerFor(request, 'dev-2', 'tekton', '--connect')
  // Connect mode only creates the console grant: no workloads, no Secrets.
  expect(installerCan('dev-2', 'create', 'deployments', '-n', 'tekton-pipelines')).toBe('no')
  expect(installerCan('dev-2', 'get', 'secrets', '-n', 'tekton-pipelines')).toBe('no')
  expect(installerCan('dev-2', 'delete', 'clusterroles', 'tekton-pipelines-controller-cluster-access')).toBe('no')
  await expect.poll(() => pluginInstalls(request, 'dev-2'), { timeout: 60_000 }).toBe('Enabled')

  await installFromMarketplace(page, 'tekton', 'dev-2', 'Connect existing')
  await expect(phase(page, 'dev-2')).toHaveText('Ready', { timeout: 180_000 })
  await page.goto('/c/dev-2/tekton/pipelineruns')
  await expect(page.getByText('Live', { exact: true })).toBeVisible({ timeout: 60_000 })
  await expect(sider(page).getByText('PipelineRuns', { exact: true })).toBeVisible()
})

const tektonCRDs = () => kubectl('dev-1', 'get', 'crd', '-o', 'name').split('\n').filter((n) => n.includes('tekton.dev'))

test('uninstall: connect leaves the existing Tekton; install removes the release and the CRDs', async ({ page }) => {
  await page.goto('/marketplace/tekton')
  await page.getByTestId('installation-dev-2').getByTestId('uninstall').click()
  await page.getByTestId('confirm-name').locator('input').fill('tekton.dev-2')
  await page.getByTestId('confirm').click()
  await expect(page.getByTestId('installation-dev-2')).toHaveCount(0, { timeout: 120_000 })
  expect(() => kubectl('dev-2', 'get', 'clusterrolebinding', 'capybara-plugin-tekton-console')).toThrow()
  expect(kubectl('dev-2', '-n', 'tekton-pipelines', 'get', 'deploy', 'tekton-pipelines-controller', '-o', 'name')).toBe('deployment.apps/tekton-pipelines-controller')

  await page.getByTestId('installation-dev-1').getByTestId('uninstall').click()
  await expect(page.getByTestId('keep-data')).toHaveCount(0) // Tekton keeps no data volumes
  await page.getByTestId('remove-crds').click()
  // The scan finds the sample runs (objects of the CRDs) and asks to confirm.
  await expect(page.getByTestId('foreign-objects')).toBeVisible({ timeout: 90_000 })
  await page.getByTestId('confirm-foreign').click()
  await page.getByTestId('confirm-name').locator('input').fill('tekton.dev-1')
  await page.getByTestId('confirm').click()
  await expect(page.getByTestId('installation-dev-1')).toHaveCount(0, { timeout: 300_000 })
  expect(kubectl('dev-1', '-n', 'tekton-pipelines', 'get', 'secret', '-l', 'owner=helm', '-o', 'name')).toBe('')
  expect(tektonCRDs()).toEqual([])
  expect(() => kubectl('dev-1', 'get', 'clusterrolebinding', 'capybara-plugin-tekton-console')).toThrow()
})
