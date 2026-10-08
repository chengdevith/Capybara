import { resolve } from 'node:path'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { kubectl, kubectlStdin } from './kube'
import { cleanup, installerCan, installFromMarketplace, phase, pluginInstalls, repo, setInstallerFor, tektonRelease } from './plugin-helpers'

// The Pipelines (Tekton) plugin end to end:
//  1. dev-1: an installer made for another plugin is refused (the fix shown
//     and kept), then Tekton installed from the Marketplace until Ready.
//  2. In a Project namespace (e2e-ci): Capybara's per-Project access and the
//     "pipeline" ServiceAccount; a Task and a Pipeline created in the
//     editor; a run started from the form with parameters; graph and logs.
//  3. Refusals: another ServiceAccount, a Secret workspace, a non-Project
//     namespace, a privileged step; reruns as another account.
//  4. Rerun, cancel, delete; all in the audit log. Nothing on dev-2.
//  5. dev-2: Connect existing to a hand-applied Tekton (the vendored
//     upstream release) with a connect-only installer.
//  6. Uninstall both: connect leaves that Tekton alone; install removes the
//     release, the per-Project access and, after the scan, the CRDs.
// Installer credentials are throwaway (1-hour tokens) and deleted at the end.

const samplePipeline = resolve(repo, 'deploy/samples/tekton-pipeline.yaml')
const NS = 'e2e-ci'

test.describe.configure({ mode: 'serial' })
test.setTimeout(600_000)
// The editor is Monaco: tests paste YAML into it (typing would auto-indent).
test.use({ permissions: ['clipboard-read', 'clipboard-write'] })

async function deleteProject(api: APIRequestContext) {
  const res = await api.get('/api/projects')
  const body = (await res.json()) as { items?: { metadata: { name: string; uid: string } }[] }
  const p = (body.items ?? []).find((x) => x.metadata.name === NS)
  if (p) await api.delete(`/api/projects/${NS}?uid=${p.metadata.uid}`)
}

test.beforeAll(async ({ playwright }, info) => {
  const api = await playwright.request.newContext({ baseURL: info.project.use.baseURL })
  await cleanup(api)
  await deleteProject(api)
  await api.dispose()
})

test.afterAll(async ({ playwright }, info) => {
  const api = await playwright.request.newContext({ baseURL: info.project.use.baseURL })
  await cleanup(api)
  await deleteProject(api)
  await api.dispose()
})

const sider = (page: Page) => page.locator('.n-layout-sider')
const objects = (object: string) => `/api/clusters/dev-1/plugin-objects/tekton/${object}`

async function runAction(page: Page, label: string) {
  await page.getByTestId('actions').click()
  await page.locator('.n-dropdown-option', { hasText: label }).click()
}

async function pasteYaml(page: Page, ...lines: string[]) {
  await page.locator('.monaco-editor .view-lines').first().waitFor()
  await page.waitForTimeout(500)
  await page.evaluate((v) => navigator.clipboard.writeText(v), lines.join('\n') + '\n')
  await page.locator('.monaco-editor .view-lines').first().click()
  await page.keyboard.press('ControlOrMeta+a')
  await page.keyboard.press('ControlOrMeta+v')
}

const reason = (name: string) =>
  kubectl('dev-1', '-n', NS, 'get', 'pipelinerun', name, '-o', 'jsonpath={.status.conditions[?(@.type=="Succeeded")].reason}')

test('an installer made for another plugin is refused, with the fix shown and kept', async ({ page, request }) => {
  await setInstallerFor(request, 'dev-1', 'monitoring')
  await expect.poll(() => pluginInstalls(request, 'dev-1'), { timeout: 60_000 }).toBe('Enabled')
  const res = await request.post('/api/plugins/installations', { data: { plugin: 'tekton', cluster: 'dev-1', mode: 'install' } })
  expect(res.ok(), await res.text()).toBe(true)
  await page.goto('/marketplace/tekton')
  const card = page.getByTestId('installation-dev-1')
  await expect(phase(page, 'dev-1')).toHaveText('Refused', { timeout: 60_000 })
  await expect(card.getByTestId('installation-subtitle')).toHaveText('install requested · v0.2.0')
  await expect(card.getByTestId('installation-enabled')).toHaveCount(0)
  await expect(card.getByTestId('uninstall')).toHaveCount(0)
  await expect(card.getByTestId('fix-command')).toHaveText('hack/capybara-sa.sh dev-1 --installer tekton')
  await expect(card.getByTestId('step-preflight')).toBeVisible()
  await page.waitForTimeout(10_000)
  await expect(phase(page, 'dev-1')).toHaveText('Refused')
  await card.getByTestId('cancel-request').click()
  await page.getByTestId('confirm-cancel').click()
  await expect(card).toHaveCount(0, { timeout: 60_000 })
  expect(() => kubectl('dev-1', 'get', 'ns', 'tekton-pipelines')).toThrow()
})

test('install on dev-1 from the Marketplace', async ({ page, request }) => {
  await setInstallerFor(request, 'dev-1', 'tekton')
  await expect.poll(() => pluginInstalls(request, 'dev-1'), { timeout: 60_000 }).toBe('Enabled')
  await installFromMarketplace(page, 'tekton', 'dev-1', 'Install')
  await expect(phase(page, 'dev-1')).toHaveText('Ready', { timeout: 300_000 })
  for (const step of ['chart', 'api', 'controller', 'webhook', 'resolvers']) {
    await expect(page.getByTestId(`step-${step}`)).toBeVisible()
  }
  expect(kubectl('dev-1', 'get', 'ns', 'tekton-pipelines', '-o', 'jsonpath={.metadata.labels.pod-security\\.kubernetes\\.io/enforce}')).toBe('restricted')
  const flags = JSON.parse(kubectl('dev-1', '-n', 'tekton-pipelines-resolvers', 'get', 'cm', 'resolvers-feature-flags', '-o', 'jsonpath={.data}')) as Record<string, string>
  expect(Object.entries(flags).filter(([, v]) => v === 'true').map(([k]) => k)).toEqual(['enable-cluster-resolver'])
  // Outside Projects, Capybara may only read Tekton objects.
  const can = (...args: string[]) => {
    try {
      return kubectl('dev-1', 'auth', 'can-i', ...args, '--as', 'system:serviceaccount:capybara-system:capybara')
    } catch (e) {
      return String((e as { stdout?: string }).stdout ?? '').trim()
    }
  }
  expect(can('list', 'pipelineruns.tekton.dev', '-A')).toBe('yes')
  expect(can('create', 'pipelineruns.tekton.dev', '-n', 'default')).toBe('no')
})

test('a Project gets Pod Security, per-Project access and the pipeline ServiceAccount', async ({ page, request }) => {
  const res = await request.post('/api/projects', { data: { name: NS, cluster: 'dev-1', owner: 'devs', size: 'S' } })
  expect(res.ok(), await res.text()).toBe(true)
  await expect.poll(() => {
    try {
      return kubectl('dev-1', '-n', NS, 'get', 'rolebinding', 'capybara-plugin-tekton-project', '-o', 'jsonpath={.roleRef.name}')
    } catch {
      return ''
    }
  }, { timeout: 120_000 }).toBe('capybara-plugin-tekton-project')
  expect(kubectl('dev-1', 'get', 'ns', NS, '-o', 'jsonpath={.metadata.labels.pod-security\\.kubernetes\\.io/enforce}')).toBe('baseline')
  expect(kubectl('dev-1', '-n', NS, 'get', 'sa', 'pipeline', '-o', 'jsonpath={.automountServiceAccountToken}')).toBe('false')
  await page.goto(`/c/dev-1/projects/${NS}`)
  await expect(page.getByTestId('pod-security')).toHaveText('baseline')
})

test('create a Task and a Pipeline in the editor, start a run from the form, see the graph and logs', async ({ page }) => {
  // Task from the "Script step" template (named "say").
  await page.goto(`/c/dev-1/tekton/tasks?ns=${NS}`)
  await page.getByTestId('resource-create').click()
  await expect(page.getByTestId('tekton-editor')).toBeVisible()
  await page.getByTestId('editor-validate').click()
  await expect(page.getByTestId('editor-valid')).toBeVisible()
  await page.getByTestId('editor-save').click()
  await expect(page).toHaveURL(new RegExp(`/tekton/tasks/${NS}/say$`))

  // Pipeline from the "Two tasks in order" template (my-pipeline: test, then build).
  await page.goto(`/c/dev-1/tekton/pipelines?ns=${NS}`)
  await page.getByTestId('resource-create').click()
  await page.getByTestId('editor-save').click()
  await expect(page).toHaveURL(new RegExp(`/tekton/pipelines/${NS}/my-pipeline$`))
  await page.locator('.n-tabs-tab', { hasText: 'Graph' }).click()
  await expect(page.getByTestId('graph-node-test')).toBeVisible()
  await expect(page.getByTestId('graph-node-build')).toBeVisible()

  // Start run with a parameter from the form.
  await runAction(page, 'Start run')
  await page.getByTestId('param-app').locator('input').fill('billing')
  await page.getByTestId('start-submit').click()
  await expect(page).toHaveURL(new RegExp(`/tekton/pipelineruns/${NS}/my-pipeline-`))
  await page.locator('.n-tabs-tab', { hasText: 'Graph' }).click()
  await expect(page.locator('[data-test="graph-node-build"][data-state="Succeeded"]')).toBeVisible({ timeout: 180_000 })
  await page.getByTestId('graph-node-build').click()
  await expect(page.getByTestId('log-output')).toContainText('Building billing', { timeout: 60_000 })
  const run = page.url().split('/').at(-1)!
  expect(kubectl('dev-1', '-n', NS, 'get', 'pipelinerun', run, '-o', 'jsonpath={.spec.taskRunTemplate.serviceAccountName}')).toBe('pipeline')

  // Core's YAML tab is read-only for Tekton kinds, with a way to the editor.
  await page.goto(`/c/dev-1/tekton/tasks/${NS}/say`)
  await page.locator('.n-tabs-tab', { hasText: 'YAML' }).click()
  await expect(page.getByTestId('yaml-governed-edit')).toBeVisible()
  await expect(page.getByTestId('yaml-edit')).toHaveCount(0)
})

test('refusals: another ServiceAccount, a Secret workspace, a non-Project namespace, a privileged step', async ({ page, request }) => {
  const start = (ns: string, spec: Record<string, unknown>) =>
    request.post(`${objects('pipelineruns')}/${ns}`, { data: { object: { metadata: { generateName: 'x-' }, spec: { pipelineRef: { name: 'my-pipeline' }, ...spec } } } })
  const problems = async (res: Awaited<ReturnType<typeof start>>) => ((await res.json()) as { problems?: { path: string }[] }).problems?.map((p) => p.path) ?? []

  let res = await start(NS, { taskRunTemplate: { serviceAccountName: 'builder' } })
  expect(res.status()).toBe(422)
  expect(await problems(res)).toEqual(['spec.taskRunTemplate.serviceAccountName'])

  res = await start(NS, { workspaces: [{ name: 'w', secret: { secretName: 'db' } }] })
  expect(res.status()).toBe(422)
  expect(await problems(res)).toContain('spec.workspaces[0].secret')

  res = await request.post(`${objects('tasks')}/capybara-demo`, { data: { object: { metadata: { name: 'nope' }, spec: { steps: [{ name: 's', image: 'busybox:1.36' }] } } } })
  expect(res.status()).toBe(403)

  // A privileged step, in the editor: refused, with the problem on its line.
  await page.goto(`/c/dev-1/tekton/tasks/${NS}/say/edit`)
  await pasteYaml(page, 'apiVersion: tekton.dev/v1', 'kind: Task', 'metadata:', '  name: say', 'spec:', '  steps:', '    - name: run',
    '      image: busybox:1.36', '      securityContext:', '        privileged: true', '      script: echo hi')
  await page.getByTestId('editor-save').click()
  await expect(page.getByTestId('editor-problem').first()).toContainText('privileged steps are not allowed')
  await expect(page.locator('.monaco-editor .squiggly-error').first()).toBeVisible()
})

test('rerun (and a rerun as another account offering a new run), cancel, delete; all audited', async ({ page, request }) => {
  kubectl('dev-1', 'apply', '-n', NS, '-f', samplePipeline)
  const create = (spec: string) => kubectlStdin('dev-1', `apiVersion: tekton.dev/v1\nkind: PipelineRun\nmetadata: {generateName: hello-}\nspec: ${spec}\n`,
    'create', '-n', NS, '-f', '-', '-o', 'jsonpath={.metadata.name}')
  const original = create('{pipelineRef: {name: hello}, taskRunTemplate: {serviceAccountName: pipeline}}')
  await expect.poll(() => reason(original), { timeout: 120_000 }).toBe('Succeeded')

  await page.goto(`/c/dev-1/tekton/pipelineruns/${NS}/${original}`)
  await runAction(page, 'Rerun')
  await page.getByTestId('confirm').click()
  const created = page.getByTestId('rerun-created').getByRole('link')
  await expect(created).toBeVisible()
  const rerun = (await created.innerText()).trim()

  // A run made with kubectl as another account: Rerun refuses, offers a new run.
  const foreign = create('{pipelineRef: {name: hello}, taskRunTemplate: {serviceAccountName: default}}')
  await page.goto(`/c/dev-1/tekton/pipelineruns/${NS}/${foreign}`)
  await runAction(page, 'Rerun')
  await page.getByTestId('confirm').click()
  await expect(page.getByTestId('rerun-error')).toContainText('pipeline ServiceAccount')
  await page.getByTestId('rerun-start-new').click()
  await expect(page.getByTestId('tekton-start')).toBeVisible()

  // Cancel a long run.
  const long = create('{pipelineRef: {name: hello}, taskRunTemplate: {serviceAccountName: pipeline}, params: [{name: seconds, value: "300"}]}')
  await page.goto(`/c/dev-1/tekton/pipelineruns/${NS}/${long}`)
  await page.locator('.n-tabs-tab', { hasText: 'Tasks' }).click()
  await expect(page.getByTestId('task-work').getByTestId('run-status')).toHaveText('Running', { timeout: 120_000 })
  await runAction(page, 'Cancel run')
  await page.getByTestId('confirm').click()
  await expect.poll(() => reason(long), { timeout: 120_000 }).toBe('Cancelled')

  // Delete the rerun (simple confirm) and the Task (typed name, used by my-pipeline).
  await page.goto(`/c/dev-1/tekton/pipelineruns/${NS}/${rerun}`)
  await runAction(page, 'Delete')
  await page.getByTestId('delete-confirm').click()
  await expect(page).toHaveURL(/tekton\/pipelineruns\?ns=/)
  await page.goto(`/c/dev-1/tekton/tasks/${NS}/say`)
  await runAction(page, 'Delete')
  await expect(page.getByTestId('delete-used-by')).toContainText('my-pipeline')
  await page.getByTestId('delete-confirm-name').locator('input').fill('say')
  await page.getByTestId('delete-confirm').click()
  await expect(page).toHaveURL(/tekton\/tasks\?ns=/)
  expect(() => kubectl('dev-1', '-n', NS, 'get', 'task', 'say')).toThrow()

  const audit = (await (await request.get('/api/audit?limit=200')).json()) as { items: { action: string; name: string; result: string }[] }
  const results = (action: string) => audit.items.filter((e) => e.action === action).map((e) => e.result)
  expect(results('tekton.create')).toContain('success')
  expect(results('tekton.start')).toEqual(expect.arrayContaining(['success', 'denied']))
  expect(results('tekton.rerun')).toEqual(expect.arrayContaining(['success', 'denied']))
  expect(results('tekton.cancel')).toContain('success')
  expect(results('tekton.delete')).toContain('success')
  expect(results('tekton.update')).toContain('denied')

  // dev-2 has no Tekton: no Pipelines section.
  await page.goto('/c/dev-2/workloads/pods')
  await expect(sider(page).getByText('Workloads', { exact: true })).toBeVisible()
  await expect(sider(page).getByText('PipelineRuns', { exact: true })).toHaveCount(0)
})

test('Connect existing on dev-2 to a hand-applied Tekton with a connect-only installer', async ({ page, request }) => {
  kubectl('dev-2', 'apply', '--server-side', '-f', tektonRelease)
  for (const d of ['tekton-pipelines-controller', 'tekton-pipelines-webhook']) {
    kubectl('dev-2', '-n', 'tekton-pipelines', 'rollout', 'status', `deploy/${d}`, '--timeout=180s')
  }
  await setInstallerFor(request, 'dev-2', 'tekton', '--connect')
  expect(installerCan('dev-2', 'create', 'deployments', '-n', 'tekton-pipelines')).toBe('no')
  expect(installerCan('dev-2', 'get', 'secrets', '-n', 'tekton-pipelines')).toBe('no')
  expect(installerCan('dev-2', 'delete', 'clusterroles/tekton-pipelines-controller-cluster-access')).toBe('no')
  await expect.poll(() => pluginInstalls(request, 'dev-2'), { timeout: 60_000 }).toBe('Enabled')

  await installFromMarketplace(page, 'tekton', 'dev-2', 'Connect existing')
  await expect(phase(page, 'dev-2')).toHaveText('Ready', { timeout: 180_000 })
  await page.goto('/c/dev-2/tekton/pipelineruns')
  await expect(page.getByText('Live', { exact: true })).toBeVisible({ timeout: 60_000 })
  await expect(sider(page).getByText('PipelineRuns', { exact: true })).toBeVisible()
})

const tektonCRDs = () => kubectl('dev-1', 'get', 'crd', '-o', 'name').split('\n').filter((n) => n.includes('tekton.dev'))

test('uninstall: connect leaves the existing Tekton; install removes the release, the per-Project access and the CRDs', async ({ page }) => {
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
  await expect(page.getByTestId('foreign-objects')).toBeVisible({ timeout: 90_000 })
  await page.getByTestId('confirm-foreign').click()
  await page.getByTestId('confirm-name').locator('input').fill('tekton.dev-1')
  await page.getByTestId('confirm').click()
  await expect(page.getByTestId('installation-dev-1')).toHaveCount(0, { timeout: 300_000 })
  expect(kubectl('dev-1', '-n', 'tekton-pipelines', 'get', 'secret', '-l', 'owner=helm', '-o', 'name')).toBe('')
  expect(tektonCRDs()).toEqual([])
  expect(() => kubectl('dev-1', 'get', 'clusterrolebinding', 'capybara-plugin-tekton-console')).toThrow()
  expect(() => kubectl('dev-1', '-n', NS, 'get', 'rolebinding', 'capybara-plugin-tekton-project')).toThrow()
  expect(() => kubectl('dev-1', '-n', NS, 'get', 'sa', 'pipeline')).toThrow()
  expect(() => kubectl('dev-1', 'get', 'clusterrole', 'capybara-plugin-tekton-project')).toThrow()
})
