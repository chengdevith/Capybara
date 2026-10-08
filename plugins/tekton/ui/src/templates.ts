// Starter templates for the editor. Images must already be on the cluster's
// nodes (busybox:1.36 is, after `make demo`).

export interface Template {
  id: string
  label: string
  yaml: (name: string) => string
}

export const taskTemplates: Template[] = [
  {
    id: 'script',
    label: 'Script step',
    yaml: (name) => `apiVersion: tekton.dev/v1
kind: Task
metadata:
  name: ${name}
spec:
  description: Runs a shell script.
  params:
    - name: message
      type: string
      default: Hello from Tekton
  steps:
    - name: run
      image: busybox:1.36
      script: |
        #!/bin/sh
        echo "$(params.message)"
`,
  },
  {
    id: 'workspace',
    label: 'Step with a workspace',
    yaml: (name) => `apiVersion: tekton.dev/v1
kind: Task
metadata:
  name: ${name}
spec:
  description: Writes a file into a shared workspace.
  workspaces:
    - name: work
  steps:
    - name: write
      image: busybox:1.36
      script: |
        #!/bin/sh
        date > $(workspaces.work.path)/stamp
        cat $(workspaces.work.path)/stamp
`,
  },
]

export const pipelineTemplates: Template[] = [
  {
    id: 'two-tasks',
    label: 'Two tasks in order',
    yaml: (name) => `apiVersion: tekton.dev/v1
kind: Pipeline
metadata:
  name: ${name}
spec:
  description: Runs one Task twice, the second after the first.
  params:
    - name: app
      type: string
      default: shop
  tasks:
    - name: test
      taskRef:
        name: say
      params:
        - name: message
          value: Testing $(params.app)
    - name: build
      runAfter: [test]
      taskRef:
        name: say
      params:
        - name: message
          value: Building $(params.app)
`,
  },
  {
    id: 'inline',
    label: 'Inline task (no Task needed)',
    yaml: (name) => `apiVersion: tekton.dev/v1
kind: Pipeline
metadata:
  name: ${name}
spec:
  params:
    - name: seconds
      type: string
      default: "5"
  tasks:
    - name: work
      params:
        - name: seconds
          value: $(params.seconds)
      taskSpec:
        params:
          - name: seconds
        steps:
          - name: count
            image: busybox:1.36
            script: |
              #!/bin/sh
              n=$(params.seconds); i=1
              while [ "$i" -le "$n" ]; do echo "working $i/$n"; sleep 1; i=$((i + 1)); done
`,
  },
]
