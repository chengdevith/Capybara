import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

const repo = resolve(import.meta.dirname, '../..')

/** kubectl against one local cluster, through its own kubeconfig only. */
export function kubectl(cluster: 'dev-1' | 'dev-2' | 'mgmt', ...args: string[]): string {
  return execFileSync('kubectl', ['--kubeconfig', resolve(repo, `.local/kubeconfig/capybara-${cluster}.yaml`), ...args], {
    encoding: 'utf8',
  }).trim()
}

export const DEMO_NS = 'capybara-demo'
export const DEMO_DEPLOYMENT = 'demo-logger'
/** The demo Secret's value (deploy/samples/demo.yaml; not a real credential). */
export const DEMO_SECRET_VALUE = 'capybara-demo-not-a-real-password'

export function runningDemoPods(): string[] {
  const pods = JSON.parse(kubectl('dev-1', '-n', DEMO_NS, 'get', 'pods', '-o', 'json')) as {
    items: { metadata: { name: string; deletionTimestamp?: string }; status: { phase: string } }[]
  }
  return pods.items
    .filter((p) => p.status.phase === 'Running' && !p.metadata.deletionTimestamp)
    .map((p) => p.metadata.name)
}
