import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { expect, type APIRequestContext } from '@playwright/test'
import { kubectl } from './kube'

export const repo = resolve(import.meta.dirname, '../..')
export const sampleProm = resolve(repo, 'deploy/samples/prometheus-connect.yaml')
export const installerFile = (id: string) => resolve(repo, `.local/kubeconfig/capybara-${id}-installer.yaml`)
export const sa = (...args: string[]) => execFileSync(resolve(repo, 'hack/capybara-sa.sh'), args, { stdio: 'pipe' })
export const connectFlags = ['--connect', '--set', 'namespace=monitoring', '--set', 'service=prometheus', '--set', 'port=9090']

export interface Inst {
  id: string
  uid: string
  spec: { cluster: string; mode: string }
  status: { phase?: string }
}

export async function installations(api: APIRequestContext): Promise<Inst[]> {
  return (await (await api.get('/api/plugins/_installations')).json()) as Inst[]
}

/** Creates a throwaway (1-hour) installer credential and stores it for the cluster. */
export async function setInstaller(api: APIRequestContext, id: string, ...extra: string[]) {
  sa(id, '--installer', 'monitoring', '--duration', '1h', ...extra)
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
    // Uninstalling needs the installer credentials.
    if (existing.some((i) => i.spec.cluster === 'dev-1')) await setInstaller(api, 'dev-1')
    if (existing.some((i) => i.spec.cluster === 'dev-2')) {
      await setInstaller(api, 'dev-2', ...(existing.find((i) => i.spec.cluster === 'dev-2')!.spec.mode === 'connect' ? connectFlags : []))
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
