import assert from 'node:assert/strict'
import { test } from 'node:test'
import { explainRefusal, healthOf, historyOf, managedBy, rollbackBlocked, shortRevision, syncOf } from './status.ts'

const app = (spec: object = {}, status: object = {}, extra: object = {}) => ({ metadata: { name: 'web', namespace: 'team-a' }, spec, status, ...extra })

test('sync and health', () => {
  assert.deepEqual(syncOf(app({}, { sync: { status: 'Synced' } })), { text: 'Synced', tone: 'success' })
  assert.deepEqual(syncOf(app({}, { sync: { status: 'OutOfSync' } })), { text: 'OutOfSync', tone: 'warning' })
  assert.equal(syncOf(app({}, { sync: { status: 'Synced' }, operationState: { phase: 'Running' } })).text, 'Syncing')
  assert.equal(syncOf(app()).text, 'Unknown')
  assert.deepEqual(healthOf(app({}, { health: { status: 'Degraded' } })), { text: 'Degraded', tone: 'error' })
  // A resource entry of status.resources has health at the top level.
  assert.equal(healthOf({ health: { status: 'Progressing' } }).tone, 'info')
})

test('revisions', () => {
  assert.equal(shortRevision('0123456789abcdef0123456789abcdef01234567'), '0123456')
  assert.equal(shortRevision('v1.2.0'), 'v1.2.0')
  assert.equal(shortRevision(undefined), '—')
})

test('refusals are explained in Project terms', () => {
  assert.match(explainRefusal('resource rbac.authorization.k8s.io:RoleBinding is not permitted in project capybara-team-a'), /RoleBindings are refused/)
  assert.match(explainRefusal('resource :ResourceQuota is not permitted in project capybara-team-a'), /quota, limits and network policies/)
  assert.match(explainRefusal('cluster level Namespace "x" can not be managed when in namespaced mode'), /^$/)
  assert.match(explainRefusal('resource :Namespace is not permitted in project capybara-team-a: cluster level resources are not allowed'), /Cluster-scoped/)
  assert.match(explainRefusal('namespace kube-system is not permitted in project capybara-team-a'), /Project's own namespace/)
  assert.match(explainRefusal('pods "x" is forbidden: exceeded quota: capybara-project-quota'), /quota does not allow/)
  assert.equal(explainRefusal('successfully synced (all tasks run)'), '')
})

test('which Application manages an object', () => {
  const obj = (annotations?: Record<string, string>, labels?: Record<string, string>) => ({ metadata: { name: 'web', namespace: 'team-a', annotations, labels } })
  assert.deepEqual(managedBy(obj({ 'argocd.argoproj.io/tracking-id': 'team-a_guestbook:apps/Deployment:team-a/web' })), { namespace: 'team-a', name: 'guestbook', via: 'annotation' })
  assert.deepEqual(managedBy(obj({ 'argocd.argoproj.io/tracking-id': 'guestbook:apps/Deployment:team-a/web' })), { namespace: 'argocd', name: 'guestbook', via: 'annotation' })
  assert.deepEqual(managedBy(obj(undefined, { 'app.kubernetes.io/instance': 'team-a_guestbook' })), { namespace: 'team-a', name: 'guestbook', via: 'label' })
  // A Helm release's instance label is not Argo CD's.
  assert.equal(managedBy(obj(undefined, { 'app.kubernetes.io/instance': 'web', 'app.kubernetes.io/managed-by': 'Helm' })), null)
  assert.equal(managedBy(obj()), null)
})

test('history and rollback', () => {
  const a = app({}, { history: [{ id: 1, revision: 'a' }, { id: 3, revision: 'c' }, { id: 2, revision: 'b' }] })
  assert.deepEqual(historyOf(a).map((h) => h.revision), ['c', 'b', 'a'])
  assert.equal(rollbackBlocked(a), '')
  assert.match(rollbackBlocked(app({ syncPolicy: { automated: {} } })), /Auto-sync is on/)
  assert.match(rollbackBlocked(app({ sources: [{}] })), /several sources/)
  assert.match(rollbackBlocked(app({}, {}, { operation: { sync: {} } })), /in progress/)
})
