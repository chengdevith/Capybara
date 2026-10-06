import { DEMO_DEPLOYMENT, DEMO_NS, kubectl } from './kube'

// Start every run from a known demo state: 2 replicas, rolled out, and no
// label left over from an earlier run's YAML-edit test.
export default function globalSetup() {
  kubectl('dev-1', '-n', DEMO_NS, 'label', `deployment/${DEMO_DEPLOYMENT}`, 'e2e.capybara.io/edited-', '--overwrite')
  kubectl('dev-1', '-n', DEMO_NS, 'scale', `deployment/${DEMO_DEPLOYMENT}`, '--replicas=2')
  kubectl('dev-1', '-n', DEMO_NS, 'rollout', 'status', `deployment/${DEMO_DEPLOYMENT}`, '--timeout=120s')
}
