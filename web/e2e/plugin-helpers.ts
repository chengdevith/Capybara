import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, type APIRequestContext, type Page } from '@playwright/test'
import { kubectl } from './kube'

export const repo = resolve(import.meta.dirname, '../..')
export const sampleProm = resolve(repo, 'deploy/samples/prometheus-connect.yaml')
export const tektonRelease = resolve(repo, 'plugins/tekton/upstream/release-v1.17.0.yaml')
export const installerFile = (id: string) => resolve(repo, `.local/kubeconfig/capybara-${id}-installer.yaml`)
export const sa = (...args: string[]) => execFileSync(resolve(repo, 'hack/capybara-sa.sh'), args, { stdio: 'pipe' })
export const connectFlags = ['--connect', '--set', 'namespace=monitoring', '--set', 'service=prometheus', '--set', 'port=9090']
/** Installer flags per plugin for connect mode. */
const connectFlagsOf: Record<string, string[]> = { monitoring: connectFlags, tekton: ['--connect'] }

export interface Inst {
  id: string
  uid: string
  spec: { plugin: string; cluster: string; mode: string }
  status: { phase?: string }
}

export async function installations(api: APIRequestContext): Promise<Inst[]> {
  return (await (await api.get('/api/plugins/_installations')).json()) as Inst[]
}

/** Creates a throwaway (1-hour) Monitoring installer credential and stores it for the cluster. */
export async function setInstaller(api: APIRequestContext, id: string, ...extra: string[]) {
  await setInstallerFor(api, id, 'monitoring', ...extra)
}

/** Grants the installer account a plugin's permissions for one mode (grants
 * for other plugins stay), mints a 1-hour token and stores it. */
export async function setInstallerFor(api: APIRequestContext, id: string, plugin: string, ...extra: string[]) {
  sa(id, '--installer', plugin, '--duration', '1h', ...extra)
  const res = await api.put(`/api/clusters/${id}/installer`, { data: { kubeconfig: readFileSync(installerFile(id), 'utf8') } })
  expect(res.ok(), await res.text()).toBe(true)
}

export async function pluginInstalls(api: APIRequestContext, id: string): Promise<string | undefined> {
  const cs = (await (await api.get('/api/clusters')).json()) as { id: string; status: { pluginInstalls?: string } }[]
  return cs.find((c) => c.id === id)?.status.pluginInstalls
}

/** Back to a clean slate: no installations, no installer credentials, no sample Prometheus. */
export async function cleanup(api: APIRequestContext) {
  const existing = await installations(api)
  if (existing.length) {
    // Uninstalling needs the installer credentials: each plugin's, for its mode.
    for (const i of existing) {
      await setInstallerFor(api, i.spec.cluster, i.spec.plugin, ...(i.spec.mode === 'connect' ? (connectFlagsOf[i.spec.plugin] ?? []) : []))
    }
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
  kubectl('dev-2', 'delete', '-f', tektonRelease, '--ignore-not-found', '--wait=false')
}

/** Starts installing (or connecting) a plugin from its Marketplace page. */
export async function installFromMarketplace(page: Page, plugin: string, cluster: string, mode: 'Install' | 'Connect existing') {
  await page.goto('/marketplace')
  await page.getByTestId(`plugin-${plugin}`).click()
  await page.getByTestId('install-plugin').click()
  await page.getByTestId('install-cluster').click()
  await page.locator('.n-base-select-option', { hasText: `(${cluster})` }).click()
  await page.getByTestId('install-mode').getByText(mode, { exact: true }).click()
  await page.getByTestId('install-submit').click()
  await expect(page.getByTestId(`installation-${cluster}`)).toBeVisible()
}

export const phase = (page: Page, cluster: string) => page.getByTestId(`installation-${cluster}`).getByTestId('installation-phase')

/** kubectl auth can-i as the installer account ("yes"/"no"). */
export function installerCan(cluster: 'dev-1' | 'dev-2', ...args: string[]): string {
  try {
    return kubectl(cluster, 'auth', 'can-i', ...args, '--as', 'system:serviceaccount:capybara-system:capybara-installer')
  } catch (e) {
    return String((e as { stdout?: string }).stdout ?? '').trim() // "no" exits 1
  }
}

/** Connect-mode Monitoring on dev-2 against the sample Prometheus, until Ready. */
export async function connectOnDev2(api: APIRequestContext) {
  kubectl('dev-2', 'apply', '-f', sampleProm)
  kubectl('dev-2', '-n', 'monitoring', 'rollout', 'status', 'deploy/prometheus', '--timeout=180s')
  await setInstaller(api, 'dev-2', ...connectFlags)
  await expect.poll(() => pluginInstalls(api, 'dev-2'), { timeout: 60_000 }).toBe('Enabled')
  const res = await api.post('/api/plugins/installations', {
    data: { plugin: 'monitoring', cluster: 'dev-2', mode: 'connect', config: { namespace: 'monitoring', service: 'prometheus', port: '9090' } },
  })
  expect(res.ok(), await res.text()).toBe(true)
  await expect.poll(async () => (await installations(api)).find((i) => i.id === 'monitoring.dev-2')?.status.phase, { timeout: 180_000 }).toBe('Ready')
}
