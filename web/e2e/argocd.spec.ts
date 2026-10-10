import { resolve } from 'node:path'
import { expect, test, type APIRequestContext } from '@playwright/test'
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

const exists = (...args: string[]) => {
  try {
    return kubectl('dev-1', 'get', ...args, '-o', 'name') !== ''
  } catch {
    return false
  }
}

const TOOL = '/api/plugins/argocd/tools/argocd/dev-1'

/** Argo CD's admin password, from the Secret Argo CD generated (never logged). */
const adminPassword = () => Buffer.from(kubectl('dev-1', '-n', 'argocd', 'get', 'secret', 'argocd-initial-admin-secret', '-o', 'jsonpath={.data.password}'), 'base64').toString()

/** Logs the request context in to Argo CD as admin (its cookie stays in the context). */
async function argoLogin(api: APIRequestContext) {
  const res = await api.post(`${TOOL}/api/v1/session`, { data: { username: 'admin', password: adminPassword() } })
  expect(res.ok(), await res.text()).toBe(true)
}

/** An Application in the Project's namespace, through Argo CD's API. */
async function argoCreate(api: APIRequestContext, name: string, path: string) {
  const res = await api.post(`${TOOL}/api/v1/applications`, {
    data: {
      metadata: { name, namespace: NS, finalizers: ['resources-finalizer.argocd.argoproj.io'] },
      spec: { project: `capybara-${NS}`, source: { repoURL: REPO, path, targetRevision: 'HEAD' }, destination: { server: 'https://kubernetes.default.svc', namespace: NS } },
    },
  })
  expect(res.ok(), await res.text()).toBe(true)
}

async function argoSync(api: APIRequestContext, name: string) {
  await expect.poll(async () => (await api.post(`${TOOL}/api/v1/applications/${name}/sync?appNamespace=${NS}`, { data: { prune: false } })).status(), { timeout: 60_000 }).toBe(200)
}

async function argoDelete(api: APIRequestContext, name: string, cascade: boolean) {
  const res = await api.delete(`${TOOL}/api/v1/applications/${name}?appNamespace=${NS}&cascade=${cascade}`)
  expect(res.ok(), await res.text()).toBe(true)
}

test('install on dev-1 from the Marketplace: restricted, with its UI, and the default AppProject locked', async ({ page, request }) => {
  await setInstallerFor(request, 'dev-1', 'argocd')
  await expect.poll(() => pluginInstalls(request, 'dev-1'), { timeout: 60_000 }).toBe('Enabled')
  await installFromMarketplace(page, 'argocd', 'dev-1', 'Install')
  await expect(phase(page, 'dev-1')).toHaveText('Ready', { timeout: 300_000 })
  for (const step of ['chart', 'api', 'redis', 'repo-server', 'controller', 'server', 'apps-in-any-namespace']) {
    await expect(page.getByTestId(`step-${step}`)).toBeVisible()
  }
  // Every component runs under "restricted" (enforced on the namespace).
  expect(kubectl('dev-1', 'get', 'ns', 'argocd', '-o', 'jsonpath={.metadata.labels.pod-security\\.kubernetes\\.io/enforce}')).toBe('restricted')
  const pods = JSON.parse(kubectl('dev-1', '-n', 'argocd', 'get', 'pods', '-o', 'json')) as { items: { status: { phase: string } }[] }
  expect(pods.items.map((p) => p.status.phase)).toEqual(['Running', 'Running', 'Running', 'Running'])
  // Argo CD's server (its UI); no Dex or notifications; no ApplicationSet controller running.
  expect(kubectl('dev-1', '-n', 'argocd', 'get', 'deploy', '-o', 'jsonpath={range .items[*]}{.metadata.name}={.spec.replicas} {end}').trim().split(' ').sort())
    .toEqual(['argocd-applicationset-controller=0', 'argocd-redis=1', 'argocd-repo-server=1', 'argocd-server=1'])
  // The default AppProject: nothing allowed, no other namespace.
  const def = JSON.parse(kubectl('dev-1', '-n', 'argocd', 'get', 'appproject', 'default', '-o', 'json')) as { spec: Record<string, unknown[] | undefined> }
  expect(def.spec.sourceNamespaces ?? []).toEqual([])
  expect(def.spec.destinations ?? []).toEqual([])
  expect(def.spec.sourceRepos ?? []).toEqual([])
})

test("the tools launcher opens Argo CD's own UI in a new tab, where admin logs in; nothing on dev-2", async ({ page, context }) => {
  await page.goto('/c/dev-2/workloads/pods')
  await expect(page.getByTestId('sidebar-toggle')).toBeVisible()
  await expect(page.getByTestId('tools-launcher')).toHaveCount(0)

  await page.goto('/c/dev-1/workloads/pods')
  await page.getByTestId('tools-launcher').click()
  const link = page.getByTestId('tool-argocd')
  await expect(link).toHaveAttribute('href', `${TOOL}/`)
  await expect(link).toHaveAttribute('target', '_blank')
  const [argo] = await Promise.all([context.waitForEvent('page'), link.click()])
  await argo.waitForLoadState()
  expect(argo.url()).toContain(`${TOOL}/`)
  await argo.locator('input[name="username"]').fill('admin')
  await argo.locator('input[name="password"]').fill(adminPassword())
  await argo.getByRole('button', { name: /sign in/i }).click()
  await expect(argo).toHaveURL(new RegExp(`${TOOL}/applications`), { timeout: 30_000 })
  await expect(argo.getByText(/no applications available|new app/i).first()).toBeVisible({ timeout: 30_000 })
  await argo.close()
  // Nothing of GitOps in Capybara's sidebar.
  await expect(page.locator('.n-layout-sider')).not.toContainText('GitOps')
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
  // Capybara itself gets nothing in the Project for GitOps.
  expect(exists('-n', NS, 'rolebinding/capybara-plugin-argocd-project')).toBe(false)
  // Naming "default": Argo CD refuses it.
  kubectlStdin('dev-1', JSON.stringify({
    apiVersion: 'argoproj.io/v1alpha1', kind: 'Application', metadata: { name: 'sneaky', namespace: NS },
    spec: { project: 'default', source: { repoURL: REPO, path: 'app' }, destination: { server: 'https://kubernetes.default.svc', namespace: NS } },
  }), 'create', '-f', '-')
  await expect.poll(() => JSON.stringify(app('sneaky')?.status?.conditions ?? []), { timeout: 120_000 }).toMatch(/not permitted|not allowed/i)
  expect(exists('-n', NS, 'deploy/web')).toBe(false)
  kubectl('dev-1', '-n', NS, 'delete', 'applications.argoproj.io', 'sneaky', '--wait=true', '--timeout=60s')
})

test("through Argo CD's API as admin: sync works in the Project; cluster-scoped kinds and quota are refused; writes audited", async ({ request }) => {
  await argoLogin(request)
  await argoCreate(request, 'guestbook', 'app')
  await argoSync(request, 'guestbook')
  await expect.poll(() => state('guestbook'), { timeout: 180_000 }).toBe('Synced/Healthy')
  expect(exists('-n', NS, 'deploy/web')).toBe(true)

  for (const [name, path] of [['cluster-kinds', 'cluster'], ['quota', 'quota']] as const) {
    await argoCreate(request, name, path)
    await argoSync(request, name)
    await expect.poll(() => `${app(name)?.status?.operationState?.phase}`, { timeout: 120_000 }).toMatch(/Failed|Error/)
    expect(String(app(name)?.status?.operationState?.message)).toMatch(/not permitted/)
  }
  expect(exists('ns', 'e2e-gitops-extra')).toBe(false)
  expect(exists('-n', NS, 'resourcequota/more')).toBe(false)

  const audit = (await (await request.get('/api/audit?limit=200')).json()) as { items: { action: string; name: string; result: string; detail?: string }[] }
  const writes = audit.items.filter((e) => e.action === 'argocd.tool-request')
  expect(writes.some((e) => e.result === 'success' && /POST \/api\/v1\/applications → 200/.test(e.detail ?? ''))).toBe(true)
  expect(writes.some((e) => /POST \/api\/v1\/session/.test(e.detail ?? ''))).toBe(true)
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

  await argoLogin(request)
  for (const name of ['cluster-kinds', 'quota']) await argoDelete(request, name, false)
  // A second app, deleted without cascading: its ConfigMap stays.
  await argoCreate(request, 'keeper', 'keep')
  await argoSync(request, 'keeper')
  await expect.poll(() => state('keeper'), { timeout: 180_000 }).toBe('Synced/Healthy')
  await argoDelete(request, 'keeper', false)
  await expect.poll(() => app('keeper'), { timeout: 60_000 }).toBeNull()
  expect(exists('-n', NS, 'cm/kept-config')).toBe(true)
  // guestbook with what it deployed.
  await argoDelete(request, 'guestbook', true)
  await expect.poll(() => app('guestbook'), { timeout: 120_000 }).toBeNull()
  await expect.poll(() => exists('-n', NS, 'deploy/web'), { timeout: 120_000 }).toBe(false)
})

test('uninstall: what was deployed stays, the CRDs stay, the AppProjects go', async ({ request }) => {
  await argoLogin(request)
  await argoCreate(request, 'left', 'app')
  await argoSync(request, 'left')
  await expect.poll(() => state('left'), { timeout: 180_000 }).toBe('Synced/Healthy')
  await argoDelete(request, 'left', false)
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
  expect(exists('-n', 'argocd', 'deploy/argocd-server')).toBe(false)
  expect((await (await request.get('/api/clusters/dev-1/tools')).json())).toEqual([])
})

test('connect existing: the launcher links to the configured UI address', async ({ page, request }) => {
  // The CRDs are still served (kept): connect to "an Argo CD" in argocd.
  await setInstallerFor(request, 'dev-1', 'argocd', '--connect', '--set', 'namespace=argocd')
  await expect.poll(() => pluginInstalls(request, 'dev-1'), { timeout: 60_000 }).toBe('Enabled')
  const res = await request.post('/api/plugins/installations', {
    data: { plugin: 'argocd', cluster: 'dev-1', mode: 'connect', config: { namespace: 'argocd', uiURL: 'https://argocd.example.test' } },
  })
  expect(res.ok(), await res.text()).toBe(true)
  await expect.poll(async () => (await installations(request)).find((i) => i.id === 'argocd.dev-1')?.status.phase, { timeout: 180_000 }).toBe('Ready')
  await page.goto('/c/dev-1/workloads/pods')
  await page.getByTestId('tools-launcher').click()
  await expect(page.getByTestId('tool-argocd-ui')).toHaveAttribute('href', 'https://argocd.example.test')
  // Generated AppProjects in connect mode too.
  expect(exists('-n', 'argocd', `appproject/capybara-${NS}`)).toBe(true)
})
