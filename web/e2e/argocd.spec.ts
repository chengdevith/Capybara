import { resolve } from 'node:path'
import { expect, test, type APIRequestContext, type Page } from '@playwright/test'
import { kubectl, kubectlStdin } from './kube'
import { cleanup, installations, installFromMarketplace, phase, pluginInstalls, repo, setInstallerFor } from './plugin-helpers'

// The GitOps (Argo CD) plugin end to end, against an in-cluster Git server:
//  1. dev-1: installed from the Marketplace until Ready, every component
//     running under Pod Security "restricted"; the default AppProject locked.
//  2. A Project (e2e-gitops) gets its own AppProject; the default one
//     accepts no Applications from Project namespaces.
//  3. An Application created from the form, synced, healthy; its Resources,
//     the GitOps tab on what it deployed; a change in Git, refresh, sync
//     with prune (type the name); sync to an earlier revision.
//  4. Refusals: a destination outside the Project (422); a cluster-scoped
//     resource and a quota override refused at sync, explained.
//  5. Uninstall refused while Applications exist; both delete choices; after
//     uninstalling, what was deployed is untouched and the CRDs stay.
//  6. Connect existing on dev-1: view-only without apps-in-any-namespace,
//     writable with it. Nothing on dev-2. Everything audited.

const NS = 'e2e-gitops'
const REPO = 'http://git.e2e-git.svc.cluster.local/cgi-bin/git/apps'
const gitServer = resolve(repo, 'web/e2e/git-server.yaml')

test.describe.configure({ mode: 'serial' })
test.setTimeout(600_000)

async function deleteProject(api: APIRequestContext) {
  const res = await api.get('/api/projects')
  const body = (await res.json()) as { items?: { metadata: { name: string; uid: string } }[] }
  const p = (body.items ?? []).find((x) => x.metadata.name === NS)
  if (p) await api.delete(`/api/projects/${NS}?uid=${p.metadata.uid}`)
}

function removeLeftovers() {
  for (const kind of ['deploy/web', 'svc/web', 'cm/web-config', 'cm/kept-config']) {
    try {
      kubectl('dev-1', '-n', NS, 'delete', kind, '--ignore-not-found', '--wait=false')
    } catch {
      // the namespace may be gone already
    }
  }
}

test.beforeAll(async ({ playwright }, info) => {
  const api = await playwright.request.newContext({ baseURL: info.project.use.baseURL })
  await cleanup(api)
  removeLeftovers()
  await deleteProject(api)
  await api.dispose()
  // The connect test's hand-made ConfigMap (left by an E2E_KEEP run).
  kubectl('dev-1', '-n', 'argocd', 'delete', 'cm', '-l', '!app.kubernetes.io/managed-by', '--ignore-not-found')
  kubectl('dev-1', 'delete', 'ns', 'e2e-git', '--ignore-not-found', '--wait=true', '--timeout=120s')
  kubectl('dev-1', 'apply', '-f', gitServer)
  kubectl('dev-1', '-n', 'e2e-git', 'rollout', 'status', 'deploy/git', '--timeout=120s')
})

test.afterAll(async ({ playwright }, info) => {
  // E2E_KEEP=1 leaves everything in place to look at a failure.
  if (process.env.E2E_KEEP) return
  const api = await playwright.request.newContext({ baseURL: info.project.use.baseURL })
  await cleanup(api)
  removeLeftovers()
  await deleteProject(api)
  await api.dispose()
  kubectl('dev-1', 'delete', 'ns', 'e2e-git', '--ignore-not-found', '--wait=false')
  kubectl('dev-1', '-n', 'argocd', 'delete', 'cm', 'argocd-cmd-params-cm', '--ignore-not-found')
  // The CRDs outlive uninstall by design; remove them so later runs start clean.
  kubectl('dev-1', 'delete', 'crd', 'applications.argoproj.io', 'applicationsets.argoproj.io', 'appprojects.argoproj.io', '--ignore-not-found')
})

const objects = '/api/clusters/dev-1/plugin-objects/argocd/applications'

interface App {
  metadata: { uid: string; finalizers?: string[] }
  spec: Record<string, unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  status?: Record<string, any>
}
function app(name: string): App | null {
  try {
    return JSON.parse(kubectl('dev-1', '-n', NS, 'get', 'applications.argoproj.io', name, '-o', 'json')) as App
  } catch {
    return null
  }
}
const state = (name: string) => `${app(name)?.status?.sync?.status}/${app(name)?.status?.health?.status}`

async function act(api: APIRequestContext, action: string, name: string, extra: Record<string, unknown> = {}) {
  return api.post(`/api/clusters/dev-1/plugin-actions/argocd/${action}`, { data: { namespace: NS, name, uid: app(name)?.metadata.uid, ...extra } })
}

async function createApp(api: APIRequestContext, name: string, path: string, extra: Record<string, unknown> = {}) {
  const res = await api.post(`${objects}/${NS}`, {
    data: { object: { metadata: { name, finalizers: ['resources-finalizer.argocd.argoproj.io'] }, spec: { source: { repoURL: REPO, path, targetRevision: 'HEAD' }, ...extra } } },
  })
  expect(res.ok(), await res.text()).toBe(true)
}

async function runAction(page: Page, label: string | RegExp) {
  await page.getByTestId('actions').click()
  await page.locator('.n-dropdown-option', { hasText: label }).click()
}

function git(script: string) {
  kubectl('dev-1', '-n', 'e2e-git', 'exec', 'deploy/git', '--', 'sh', '-c', `cd /srv/apps && ${script} && git add -A && git commit -q -m change`)
}

const exists = (...args: string[]) => {
  try {
    return kubectl('dev-1', 'get', ...args, '-o', 'name') !== ''
  } catch {
    return false
  }
}

test('install on dev-1 from the Marketplace: restricted, and the default AppProject locked', async ({ page, request }) => {
  await setInstallerFor(request, 'dev-1', 'argocd')
  await expect.poll(() => pluginInstalls(request, 'dev-1'), { timeout: 60_000 }).toBe('Enabled')
  await installFromMarketplace(page, 'argocd', 'dev-1', 'Install')
  await expect(phase(page, 'dev-1')).toHaveText('Ready', { timeout: 300_000 })
  for (const step of ['chart', 'api', 'redis', 'repo-server', 'controller', 'apps-in-any-namespace']) {
    await expect(page.getByTestId(`step-${step}`)).toBeVisible()
  }
  // Every component runs under "restricted" (enforced on the namespace).
  expect(kubectl('dev-1', 'get', 'ns', 'argocd', '-o', 'jsonpath={.metadata.labels.pod-security\\.kubernetes\\.io/enforce}')).toBe('restricted')
  const pods = JSON.parse(kubectl('dev-1', '-n', 'argocd', 'get', 'pods', '-o', 'json')) as { items: { status: { phase: string } }[] }
  expect(pods.items.map((p) => p.status.phase)).toEqual(['Running', 'Running', 'Running'])
  // No Argo CD API server, Dex or notifications; no ApplicationSet controller running.
  expect(kubectl('dev-1', '-n', 'argocd', 'get', 'deploy', '-o', 'jsonpath={range .items[*]}{.metadata.name}={.spec.replicas} {end}').trim().split(' ').sort())
    .toEqual(['argocd-applicationset-controller=0', 'argocd-redis=1', 'argocd-repo-server=1'])
  // The default AppProject: nothing allowed, no other namespace.
  const def = JSON.parse(kubectl('dev-1', '-n', 'argocd', 'get', 'appproject', 'default', '-o', 'json')) as { spec: Record<string, unknown[] | undefined> }
  expect(def.spec.sourceNamespaces ?? []).toEqual([])
  expect(def.spec.destinations ?? []).toEqual([])
  expect(def.spec.sourceRepos ?? []).toEqual([])
})

test('a Project gets its own AppProject; the default one accepts none of its Applications', async ({ request }) => {
  const res = await request.post('/api/projects', { data: { name: NS, cluster: 'dev-1', owner: 'devs', size: 'S' } })
  expect(res.ok(), await res.text()).toBe(true)
  await expect.poll(() => {
    try {
      return kubectl('dev-1', '-n', 'argocd', 'get', 'appproject', `capybara-${NS}`, '-o', 'jsonpath={.spec.sourceNamespaces}')
    } catch {
      return ''
    }
  }, { timeout: 120_000 }).toBe(`["${NS}"]`)
  expect(kubectl('dev-1', '-n', NS, 'get', 'rolebinding', 'capybara-plugin-argocd-project', '-o', 'jsonpath={.roleRef.name}')).toBe('capybara-plugin-argocd-project')
  // Written directly (not through Capybara) and naming "default": Argo CD refuses it.
  kubectlStdin('dev-1', JSON.stringify({
    apiVersion: 'argoproj.io/v1alpha1', kind: 'Application', metadata: { name: 'sneaky', namespace: NS },
    spec: { project: 'default', source: { repoURL: REPO, path: 'app' }, destination: { server: 'https://kubernetes.default.svc', namespace: NS } },
  }), 'create', '-f', '-')
  await expect.poll(() => JSON.stringify(app('sneaky')?.status?.conditions ?? []), { timeout: 120_000 }).toMatch(/not permitted|not allowed/i)
  expect(exists('-n', NS, 'deploy/web')).toBe(false)
  kubectl('dev-1', '-n', NS, 'delete', 'applications.argoproj.io', 'sneaky', '--wait=true', '--timeout=60s')
})

test('create an Application from the form, sync it, see its resources and the GitOps tab', async ({ page }) => {
  await page.goto(`/c/dev-1/gitops/applications?ns=${NS}`)
  await page.getByTestId('resource-create').click()
  await expect(page.getByTestId('argocd-form')).toBeVisible()
  await page.getByTestId('app-name').locator('input').fill('guestbook')
  await page.getByTestId('app-repo').locator('input').fill(REPO)
  await page.getByTestId('app-path').locator('input').fill('app')
  await page.getByTestId('app-validate').click()
  await expect(page.getByTestId('app-valid')).toBeVisible()
  await page.getByTestId('app-save').click()
  await expect(page).toHaveURL(new RegExp(`/gitops/applications/${NS}/guestbook$`))
  const a = app('guestbook')!
  expect(a.spec.project).toBe(`capybara-${NS}`)
  expect(a.metadata.finalizers).toEqual(['resources-finalizer.argocd.argoproj.io'])

  await expect.poll(() => app('guestbook')?.status?.sync?.status, { timeout: 120_000 }).toBe('OutOfSync')
  await runAction(page, /^Sync$/)
  await page.getByTestId('sync-confirm').click()
  await expect.poll(() => state('guestbook'), { timeout: 180_000 }).toBe('Synced/Healthy')
  expect(exists('-n', NS, 'deploy/web')).toBe(true)

  await page.locator('.n-tabs-tab', { hasText: 'Resources' }).click()
  const resources = page.getByTestId('argocd-resources')
  await expect(resources).toContainText('Deployment')
  await expect(resources).toContainText('web-config')

  // The Deployment it deployed says which Application manages it.
  await page.goto(`/c/dev-1/workloads/deployments/${NS}/web`)
  await page.locator('.n-tabs-tab', { hasText: 'GitOps' }).click()
  await expect(page.getByTestId('gitops-app-link')).toHaveText('guestbook')
  await expect(page.getByTestId('gitops-object-sync')).toHaveText('Synced')
})

test('a change in Git: refresh, then sync with prune (type the name), then back to the first revision', async ({ page, request }) => {
  const first = app('guestbook')!.status!.sync.revision as string
  git('rm app/configmap.yaml')
  expect((await act(request, 'refresh', 'guestbook')).ok()).toBe(true)
  await expect.poll(() => app('guestbook')?.status?.sync?.status, { timeout: 120_000 }).toBe('OutOfSync')

  await page.goto(`/c/dev-1/gitops/applications/${NS}/guestbook`)
  await runAction(page, /^Sync$/)
  await page.getByTestId('sync-prune').click()
  await expect(page.getByTestId('sync-confirm')).toBeDisabled()
  await page.getByTestId('sync-confirm-name').locator('input').fill('guestbook')
  await page.getByTestId('sync-confirm').click()
  await expect.poll(() => state('guestbook'), { timeout: 180_000 }).toBe('Synced/Healthy')
  expect(exists('-n', NS, 'cm/web-config')).toBe(false)

  // History: sync the first revision again (manual sync, no prune).
  await page.locator('.n-tabs-tab', { hasText: 'History' }).click()
  await page.getByTestId('history-rollback').first().click()
  await page.getByTestId('confirm').click()
  await expect.poll(() => app('guestbook')?.status?.operationState?.syncResult?.revision, { timeout: 180_000 }).toBe(first)
  await expect.poll(() => exists('-n', NS, 'cm/web-config'), { timeout: 60_000 }).toBe(true)
})

test('refusals: a destination outside the Project; cluster-scoped kinds and quota at sync, explained', async ({ page, request }) => {
  const res = await request.post(`${objects}/${NS}/_validate`, {
    data: { object: { metadata: { name: 'elsewhere' }, spec: { source: { repoURL: REPO, path: 'app' }, destination: { namespace: 'kube-system' } } } },
  })
  const body = (await res.json()) as { problems: { path: string }[] }
  expect(body.problems.map((p) => p.path)).toEqual(['spec.destination.namespace'])
  const created = await request.post(`${objects}/${NS}`, {
    data: { object: { metadata: { name: 'elsewhere' }, spec: { source: { repoURL: REPO, path: 'app' }, destination: { namespace: 'kube-system' } } } },
  })
  expect(created.status()).toBe(422)

  for (const [name, path, hint] of [['cluster-kinds', 'cluster', /Cluster-scoped resources/], ['quota', 'quota', /quota, limits and network policies/]] as const) {
    await createApp(request, name, path)
    await expect.poll(async () => (await act(request, 'sync', name, { inputs: { prune: false } })).status(), { timeout: 60_000 }).toBe(200)
    await expect.poll(() => `${app(name)?.status?.operationState?.phase}`, { timeout: 120_000 }).toMatch(/Failed|Error/)
    await page.goto(`/c/dev-1/gitops/applications/${NS}/${name}`)
    await page.locator('.n-tabs-tab', { hasText: 'Resources' }).click()
    await expect(page.getByTestId('argocd-refusal-hint').first()).toHaveText(hint)
  }
  expect(exists('ns', 'e2e-gitops-extra')).toBe(false)
  expect(exists('-n', NS, 'resourcequota/more')).toBe(false)
})

test('uninstall is refused while Applications exist; both delete choices', async ({ page, request }) => {
  const inst = (await installations(request)).find((i) => i.id === 'argocd.dev-1')!
  const refused = await request.delete(`/api/plugins/installations/${inst.id}?confirm=${inst.id}&uid=${inst.uid}&keepData=false`)
  expect(refused.status()).toBe(409)
  const body = (await refused.json()) as { error: string; blockers: string[] }
  expect(body.blockers).toContain(`Application ${NS}/guestbook (deletes its resources when deleted)`)
  await page.goto('/marketplace/argocd')
  await page.getByTestId('installation-dev-1').getByTestId('uninstall').click()
  await page.getByTestId('confirm-name').locator('input').fill(inst.id)
  await page.getByTestId('confirm').click()
  await expect(page.getByText(/must be deleted first/)).toBeVisible()
  await page.keyboard.press('Escape')

  // The failing ones: Application only (nothing was deployed).
  for (const name of ['cluster-kinds', 'quota']) {
    expect((await request.delete(`${objects}/${NS}/${name}?uid=${app(name)!.metadata.uid}&mode=app-only`)).ok()).toBe(true)
  }
  // A second app, deleted Application-only from the UI: its ConfigMap stays.
  await createApp(request, 'keeper', 'keep')
  await expect.poll(async () => (await act(request, 'sync', 'keeper', { inputs: { prune: false } })).status(), { timeout: 60_000 }).toBe(200)
  await expect.poll(() => state('keeper'), { timeout: 180_000 }).toBe('Synced/Healthy')
  await page.goto(`/c/dev-1/gitops/applications/${NS}/keeper`)
  await runAction(page, 'Delete')
  await page.getByTestId('delete-mode-app-only').click()
  await page.getByTestId('delete-confirm-name').locator('input').fill('keeper')
  await page.getByTestId('delete-confirm').click()
  await expect.poll(() => app('keeper'), { timeout: 60_000 }).toBeNull()
  expect(exists('-n', NS, 'cm/kept-config')).toBe(true)

  // guestbook with what it deployed.
  await page.goto(`/c/dev-1/gitops/applications/${NS}/guestbook`)
  await runAction(page, 'Delete')
  await page.getByTestId('delete-mode-cascade').click()
  await page.getByTestId('delete-confirm-name').locator('input').fill('guestbook')
  await page.getByTestId('delete-confirm').click()
  await expect.poll(() => app('guestbook'), { timeout: 120_000 }).toBeNull()
  await expect.poll(() => exists('-n', NS, 'deploy/web'), { timeout: 120_000 }).toBe(false)
})

test('uninstall: what was deployed stays, the CRDs stay, the AppProjects go', async ({ request }) => {
  // Something deployed by an Application that is then deleted Application-only
  // (kept-config), and a workload deployed and left behind the same way.
  await createApp(request, 'left', 'app')
  await expect.poll(async () => (await act(request, 'sync', 'left', { inputs: { prune: false } })).status(), { timeout: 60_000 }).toBe(200)
  await expect.poll(() => state('left'), { timeout: 180_000 }).toBe('Synced/Healthy')
  expect((await request.delete(`${objects}/${NS}/left?uid=${app('left')!.metadata.uid}&mode=app-only`)).ok()).toBe(true)
  await expect.poll(() => app('left'), { timeout: 60_000 }).toBeNull()
  const before = kubectl('dev-1', '-n', NS, 'get', 'deploy', 'web', '-o', 'jsonpath={.metadata.uid}')

  const inst = (await installations(request)).find((i) => i.id === 'argocd.dev-1')!
  const res = await request.delete(`/api/plugins/installations/${inst.id}?confirm=${inst.id}&uid=${inst.uid}&keepData=false`)
  expect(res.ok(), await res.text()).toBe(true)
  await expect.poll(async () => (await installations(request)).some((i) => i.id === inst.id), { timeout: 240_000 }).toBe(false)

  expect(kubectl('dev-1', '-n', NS, 'get', 'deploy', 'web', '-o', 'jsonpath={.metadata.uid}')).toBe(before)
  expect(exists('-n', NS, 'cm/kept-config')).toBe(true)
  expect(exists('crd', 'applications.argoproj.io')).toBe(true)
  expect(exists('-n', 'argocd', `appproject/capybara-${NS}`)).toBe(false)
  expect(exists('-n', 'argocd', 'deploy/argocd-repo-server')).toBe(false)
})

test('connect existing: view-only without apps in any namespace, writable with it; nothing on dev-2', async ({ page, request }) => {
  // The CRDs are still served (kept): connect to "an Argo CD" in argocd.
  await setInstallerFor(request, 'dev-1', 'argocd', '--connect', '--set', 'namespace=argocd')
  await expect.poll(() => pluginInstalls(request, 'dev-1'), { timeout: 60_000 }).toBe('Enabled')
  const res = await request.post('/api/plugins/installations', { data: { plugin: 'argocd', cluster: 'dev-1', mode: 'connect', config: { namespace: 'argocd' } } })
  expect(res.ok(), await res.text()).toBe(true)
  await expect.poll(async () => (await installations(request)).find((i) => i.id === 'argocd.dev-1')?.status.phase, { timeout: 180_000 }).toBe('Ready')
  await page.goto('/marketplace/argocd')
  await expect(page.getByTestId('step-apps-in-any-namespace')).toContainText('not available')

  const view = await request.post(`${objects}/${NS}`, { data: { object: { metadata: { name: 'v' }, spec: { source: { repoURL: REPO, path: 'app' } } } } })
  expect(view.status()).toBe(403)
  expect(await view.text()).toMatch(/view-only/)
  await page.goto(`/c/dev-1/gitops/applications?ns=${NS}`)
  await expect(page.getByTestId('resource-create')).toHaveCount(0)

  // The connected Argo CD accepts Applications in any namespace: writable.
  kubectl('dev-1', '-n', 'argocd', 'create', 'configmap', 'argocd-cmd-params-cm', '--from-literal=application.namespaces=*')
  await expect.poll(async () => {
    const i = (await (await request.get('/api/plugins/installations/argocd.dev-1')).json()) as { status: { steps?: { name: string; state: string }[] } }
    return i.status.steps?.find((s) => s.name === 'apps-in-any-namespace')?.state
  }, { timeout: 180_000 }).toBe('Done')
  await createApp(request, 'connected', 'keep')
  expect(exists('-n', 'argocd', `appproject/capybara-${NS}`)).toBe(true)
  expect((await request.delete(`${objects}/${NS}/connected?uid=${app('connected')!.metadata.uid}&mode=app-only`)).ok()).toBe(true)

  // Nothing of GitOps on dev-2.
  await page.goto('/c/dev-2/')
  await expect(page.locator('.n-layout-sider')).not.toContainText('GitOps')

  // Everything audited.
  const audit = (await (await request.get('/api/audit?limit=300')).json()) as { items: { action: string; result: string }[] }
  for (const a of ['argocd.create', 'argocd.sync', 'argocd.refresh', 'argocd.sync-revision', 'argocd.delete']) {
    expect(audit.items.some((e) => e.action === a && e.result === 'success'), a).toBe(true)
  }
  expect(audit.items.some((e) => e.action === 'uninstall' && e.result === 'failure')).toBe(true)
})
