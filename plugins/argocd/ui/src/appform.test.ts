import assert from 'node:assert/strict'
import { test } from 'node:test'
import { applicationOf, emptyForm, formHides, formOf, formProblems } from './appform.ts'

test('a new Application from the form', () => {
  const f = { ...emptyForm(), name: 'guestbook', repoURL: ' https://git.example/apps.git ', path: 'guestbook', autoSync: true, selfHeal: true }
  assert.deepEqual(applicationOf(f, 'team-a'), {
    apiVersion: 'argoproj.io/v1alpha1',
    kind: 'Application',
    metadata: { name: 'guestbook', namespace: 'team-a', finalizers: ['resources-finalizer.argocd.argoproj.io'] },
    spec: {
      source: { repoURL: 'https://git.example/apps.git', targetRevision: 'HEAD', path: 'guestbook' },
      syncPolicy: { automated: { selfHeal: true, prune: false } },
      destination: { namespace: 'team-a', server: 'https://kubernetes.default.svc' },
    },
  })
  // App only: no finalizer; manual sync: no syncPolicy.
  const manual = applicationOf({ ...f, autoSync: false, cascade: false }, 'team-a') as { metadata: object; spec: object }
  assert.equal('finalizers' in manual.metadata, false)
  assert.equal('syncPolicy' in manual.spec, false)
})

test('editing keeps what the form does not show, and round-trips', () => {
  const base = {
    apiVersion: 'argoproj.io/v1alpha1', kind: 'Application',
    metadata: { name: 'web', namespace: 'team-a', uid: 'u1', finalizers: ['resources-finalizer.argocd.argoproj.io/background', 'other/x'] },
    spec: {
      project: 'capybara-team-a',
      source: { repoURL: 'https://git.example/x', targetRevision: 'main', path: 'web', helm: { valueFiles: ['v.yaml'] } },
      syncPolicy: { automated: { prune: true, selfHeal: false, allowEmpty: true }, syncOptions: ['ServerSideApply=true'] },
      destination: { namespace: 'team-a', server: 'https://kubernetes.default.svc' },
      ignoreDifferences: [{ kind: 'Deployment' }],
    },
  }
  const f = formOf(base)
  assert.deepEqual(f, { name: 'web', repoURL: 'https://git.example/x', targetRevision: 'main', path: 'web', autoSync: true, selfHeal: false, prune: true, cascade: true })
  const out = applicationOf({ ...f, autoSync: false }, 'team-a', base) as { metadata: { uid: string; finalizers: string[] }; spec: Record<string, unknown> & { source: { helm: unknown }; syncPolicy: object } }
  assert.equal(out.metadata.uid, 'u1')
  assert.deepEqual(out.metadata.finalizers, ['other/x', 'resources-finalizer.argocd.argoproj.io'])
  assert.deepEqual(out.spec.source.helm, { valueFiles: ['v.yaml'] })
  assert.deepEqual(out.spec.syncPolicy, { syncOptions: ['ServerSideApply=true'] })
  assert.equal(out.spec.project, 'capybara-team-a')
  assert.deepEqual(base.spec.syncPolicy.automated, { prune: true, selfHeal: false, allowEmpty: true }, 'the base is not changed')
  assert.deepEqual(formHides(base), ['spec.source.helm', 'spec.ignoreDifferences', 'spec.syncPolicy.syncOptions'])
})

test('quick form checks', () => {
  assert.deepEqual(formProblems({ ...emptyForm(), name: 'ok', repoURL: 'https://x' }), [])
  assert.equal(formProblems({ ...emptyForm(), name: 'Bad_Name', repoURL: '' }).length, 2)
  assert.match(formProblems({ ...emptyForm(), name: 'a', repoURL: 'git@github.com:x/y.git' })[0]!, /no SSH/)
  assert.match(formProblems({ ...emptyForm(), name: 'a', repoURL: 'https://x', path: '../etc' })[0]!, /\.\./)
})
