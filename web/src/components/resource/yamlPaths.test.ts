import { describe, expect, it } from 'vitest'
import { lineOf, pathSegments } from './yamlPaths'

const text = `apiVersion: tekton.dev/v1
kind: Task
metadata:
  name: say
spec:
  steps:
    - name: s
      image: busybox
      env:
        - name: P
          valueFrom:
            secretKeyRef:
              name: db
              key: p
`

describe('yaml paths', () => {
  it('splits dotted paths with list indexes', () => {
    expect(pathSegments('spec.steps[0].env[1].valueFrom')).toEqual(['spec', 'steps', 0, 'env', 1, 'valueFrom'])
    expect(pathSegments('a[2][3].b')).toEqual(['a', 2, 3, 'b'])
  })

  it('finds the lines of a field, or its nearest existing parent', () => {
    expect(lineOf(text, 'spec.steps[0].env[0].valueFrom.secretKeyRef')).toEqual({ start: 13, end: 14 })
    expect(lineOf(text, 'spec.steps[0].image').start).toBe(8)
    // securityContext is not there: the step is marked.
    expect(lineOf(text, 'spec.steps[0].securityContext.privileged').start).toBe(7)
    expect(lineOf(text, '')).toEqual({ start: 1, end: 1 })
  })
})
