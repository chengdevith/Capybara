import assert from 'node:assert/strict'
import { test } from 'node:test'
import { explain, imagePullProblems } from './pulls.ts'

test('finds steps and sidecars waiting on an image pull, with the image', () => {
  const tr = {
    status: {
      taskSpec: { steps: [{ name: 'build', image: 'golang:1.30' }, { name: 'ok', image: 'busybox:1.36' }], sidecars: [{ name: 'db', image: 'postgres:18' }] },
      steps: [
        { name: 'build', container: 'step-build', waiting: { reason: 'ImagePullBackOff', message: 'Back-off pulling image "golang:1.30"' } },
        { name: 'ok', container: 'step-ok', waiting: { reason: 'PodInitializing' } },
      ],
      sidecars: [{ name: 'db', container: 'sidecar-db', waiting: { reason: 'ErrImageNeverPull' } }],
    },
  }
  const got = imagePullProblems(tr)
  assert.deepEqual(got.map((p) => [p.container, p.image, p.reason]), [
    ['step-build', 'golang:1.30', 'ImagePullBackOff'],
    ['sidecar-db', 'postgres:18', 'ErrImageNeverPull'],
  ])
  assert.match(explain(got[0]!, 'dev-1'), /golang:1\.30 is not on dev-1/)
})

test('takes the image from the kubelet message when the spec is missing', () => {
  const got = imagePullProblems({ status: { steps: [{ name: 's', waiting: { reason: 'ErrImagePull', message: 'failed to pull image "alpine:9"' } }] } })
  assert.equal(got[0]?.image, 'alpine:9')
})

test('nothing for healthy or missing status', () => {
  assert.deepEqual(imagePullProblems({}), [])
  assert.deepEqual(imagePullProblems({ status: { steps: [{ name: 's', running: {} }] } }), [])
})
