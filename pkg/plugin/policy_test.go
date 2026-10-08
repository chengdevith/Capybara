package plugin

import (
	"context"
	"slices"
	"strings"
	"testing"

	"k8s.io/apimachinery/pkg/api/resource"
	"sigs.k8s.io/yaml"

	"github.com/capybara/capybara/api/v1alpha1"
)

func tektonPolicy(t *testing.T, name string) []v1alpha1.ObjectRule {
	t.Helper()
	_, spec, err := LoadDir("../../plugins/tekton", "builtin")
	if err != nil {
		t.Fatal(err)
	}
	rules, err := ResolvePolicy(spec.Policies, name)
	if err != nil {
		t.Fatal(err)
	}
	return rules
}

func obj(t *testing.T, y string) map[string]any {
	t.Helper()
	out := map[string]any{}
	if err := yaml.Unmarshal([]byte(y), &out); err != nil {
		t.Fatal(err)
	}
	return out
}

// quota: 5Gi of storage and 2 claims left.
func quota(_ context.Context, name string) (resource.Quantity, bool, error) {
	switch name {
	case "requests.storage":
		return resource.MustParse("5Gi"), true, nil
	case "persistentvolumeclaims":
		return resource.MustParse("2"), true, nil
	}
	return resource.Quantity{}, false, nil
}

func check(t *testing.T, rules []v1alpha1.ObjectRule, o map[string]any) []Violation {
	t.Helper()
	v, err := ApplyPolicy(context.Background(), rules, o, quota)
	if err != nil {
		t.Fatal(err)
	}
	return v
}

// wantViolation asserts exactly the violations whose paths are given.
func wantViolation(t *testing.T, name string, got []Violation, paths ...string) {
	t.Helper()
	var have []string
	for _, v := range got {
		have = append(have, v.Path)
	}
	paths = slices.Sorted(slices.Values(paths))
	if strings.Join(have, ",") != strings.Join(paths, ",") {
		t.Errorf("%s: violations %v, want paths %v", name, got, paths)
	}
}

const goodTask = `
apiVersion: tekton.dev/v1
kind: Task
metadata: {name: say}
spec:
  params: [{name: text}]
  stepTemplate: {env: [{name: LANG, value: C}]}
  steps:
    - name: say
      image: busybox:1.36
      env: [{name: FROM_MAP, valueFrom: {configMapKeyRef: {name: cfg, key: k}}}]
      script: echo "$(params.text)"
  sidecars:
    - name: helper
      image: busybox:1.36
  volumes:
    - {name: scratch, emptyDir: {}}
    - {name: cfg, configMap: {name: cfg}}
`

func TestTektonWorkloadPolicyAcceptsAPlainTaskAndPipeline(t *testing.T) {
	rules := tektonPolicy(t, "workload")
	wantViolation(t, "task", check(t, rules, obj(t, goodTask)))
	wantViolation(t, "pipeline", check(t, rules, obj(t, `
kind: Pipeline
spec:
  tasks:
    - {name: a, taskRef: {name: say}}
    - {name: b, runAfter: [a], taskRef: {name: say, kind: Task}}
  finally:
    - {name: c, taskSpec: {steps: [{name: s, image: busybox:1.36, script: "true"}]}}
`)))
}

func TestTektonPolicySteps(t *testing.T) {
	rules := tektonPolicy(t, "workload")
	wantViolation(t, "secretKeyRef", check(t, rules, obj(t, `
spec: {steps: [{name: s, image: x, env: [{name: P, valueFrom: {secretKeyRef: {name: db, key: password}}}]}]}`)),
		"spec.steps[0].env[0].valueFrom.secretKeyRef")
	wantViolation(t, "envFrom", check(t, rules, obj(t, `
spec: {steps: [{name: s, image: x, envFrom: [{secretRef: {name: db}}]}]}`)),
		"spec.steps[0].envFrom[0].secretRef")
	wantViolation(t, "privileged", check(t, rules, obj(t, `
spec: {steps: [{name: s, image: x, securityContext: {privileged: true}}, {name: t, image: x, securityContext: {privileged: false}}]}`)),
		"spec.steps[0].securityContext.privileged")
	wantViolation(t, "capabilities", check(t, rules, obj(t, `
spec: {steps: [{name: s, image: x, securityContext: {capabilities: {add: [NET_ADMIN], drop: [ALL]}}}]}`)),
		"spec.steps[0].securityContext.capabilities.add")
	wantViolation(t, "StepAction ref", check(t, rules, obj(t, `
spec: {steps: [{name: s, ref: {name: git-clone}}]}`)),
		"spec.steps[0].ref")
}

func TestTektonPolicyStepTemplate(t *testing.T) {
	rules := tektonPolicy(t, "workload")
	wantViolation(t, "secretKeyRef", check(t, rules, obj(t, `
spec: {stepTemplate: {env: [{name: P, valueFrom: {secretKeyRef: {name: db, key: p}}}]}, steps: [{name: s, image: x}]}`)),
		"spec.stepTemplate.env[0].valueFrom.secretKeyRef")
	wantViolation(t, "envFrom", check(t, rules, obj(t, `
spec: {stepTemplate: {envFrom: [{secretRef: {name: db}}]}, steps: [{name: s, image: x}]}`)),
		"spec.stepTemplate.envFrom[0].secretRef")
	wantViolation(t, "privileged", check(t, rules, obj(t, `
spec: {stepTemplate: {securityContext: {privileged: true, capabilities: {add: [SYS_ADMIN]}}}, steps: [{name: s, image: x}]}`)),
		"spec.stepTemplate.securityContext.capabilities.add", "spec.stepTemplate.securityContext.privileged")
}

func TestTektonPolicySidecars(t *testing.T) {
	rules := tektonPolicy(t, "workload")
	wantViolation(t, "env", check(t, rules, obj(t, `
spec:
  steps: [{name: s, image: x}]
  sidecars:
    - name: db
      image: x
      env: [{name: P, valueFrom: {secretKeyRef: {name: db, key: p}}}]
      envFrom: [{secretRef: {name: db}}]`)),
		"spec.sidecars[0].env[0].valueFrom.secretKeyRef", "spec.sidecars[0].envFrom[0].secretRef")
	wantViolation(t, "security and host ports", check(t, rules, obj(t, `
spec:
  steps: [{name: s, image: x}]
  sidecars:
    - {name: db, image: x, securityContext: {privileged: true, capabilities: {add: [NET_RAW]}}, ports: [{containerPort: 80, hostPort: 80}]}`)),
		"spec.sidecars[0].ports[0].hostPort", "spec.sidecars[0].securityContext.capabilities.add", "spec.sidecars[0].securityContext.privileged")
	// Sidecars mount the Task's volumes: a Secret volume is refused there.
	got := check(t, rules, obj(t, `
spec:
  steps: [{name: s, image: x}]
  sidecars: [{name: db, image: x, volumeMounts: [{name: creds, mountPath: /c}]}]
  volumes: [{name: creds, secret: {secretName: db}}]`))
	if len(got) == 0 || !strings.HasPrefix(got[0].Path, "spec.volumes[0]") {
		t.Errorf("secret volume: %v", got)
	}
}

func TestTektonPolicyVolumes(t *testing.T) {
	rules := tektonPolicy(t, "workload")
	for _, v := range []string{"secret: {secretName: db}", "projected: {sources: []}", "hostPath: {path: /}"} {
		got := check(t, rules, obj(t, "spec: {steps: [{name: s, image: x}], volumes: [{name: v, "+v+"}]}"))
		if len(got) == 0 || !strings.HasPrefix(got[0].Path, "spec.volumes[0]") {
			t.Errorf("%s: %v", v, got)
		}
	}
	// Two sources in one volume are refused too.
	got := check(t, rules, obj(t, "spec: {steps: [{name: s, image: x}], volumes: [{name: v, emptyDir: {}, configMap: {name: c}}]}"))
	if len(got) != 1 || got[0].Path != "spec.volumes[0]" {
		t.Errorf("two sources: %v", got)
	}
}

func TestTektonPolicyReferences(t *testing.T) {
	rules := tektonPolicy(t, "workload")
	wantViolation(t, "resolver", check(t, rules, obj(t, `
spec: {tasks: [{name: a, taskRef: {resolver: git, params: [{name: url, value: x}]}}]}`)),
		"spec.tasks[0].taskRef.resolver", "spec.tasks[0].taskRef.params")
	wantViolation(t, "custom and cluster tasks", check(t, rules, obj(t, `
spec: {tasks: [{name: a, taskRef: {name: x, kind: ClusterTask}}, {name: b, taskRef: {apiVersion: example.dev/v1, kind: Wait}}]}`)),
		"spec.tasks[0].taskRef.kind", "spec.tasks[1].taskRef.apiVersion", "spec.tasks[1].taskRef.kind")
	// Inline task specs get the volume rule too.
	wantViolation(t, "inline task volumes", check(t, rules, obj(t, `
spec: {tasks: [{name: a, taskSpec: {steps: [{name: s, image: x}], volumes: [{name: c, secret: {secretName: db}}]}}]}`)),
		"spec.tasks[0].taskSpec.volumes[0]", "spec.tasks[0].taskSpec.volumes[0].secret")
}

func TestTektonRunPolicy(t *testing.T) {
	rules := tektonPolicy(t, "run")

	run := obj(t, `
kind: PipelineRun
spec:
  pipelineRef: {name: build}
  params: [{name: app, value: shop}]
  workspaces:
    - {name: src, volumeClaimTemplate: {spec: {accessModes: [ReadWriteOnce], resources: {requests: {storage: 1Gi}}}}}
    - {name: tmp, emptyDir: {}}
    - {name: cfg, configMap: {name: settings}}`)
	wantViolation(t, "plain run", check(t, rules, run))
	if sa := Values(run, "spec.taskRunTemplate.serviceAccountName"); len(sa) != 1 || sa[0] != "pipeline" {
		t.Errorf("service account not defaulted: %v", sa)
	}

	wantViolation(t, "another service account", check(t, rules, obj(t, `
spec: {pipelineRef: {name: b}, taskRunTemplate: {serviceAccountName: builder}, taskRunSpecs: [{pipelineTaskName: a, serviceAccountName: admin}]}`)),
		"spec.taskRunTemplate.serviceAccountName", "spec.taskRunSpecs[0].serviceAccountName")

	wantViolation(t, "secret workspace", check(t, rules, obj(t, `
spec: {pipelineRef: {name: b}, workspaces: [{name: creds, secret: {secretName: db}}]}`)),
		"spec.workspaces[0]", "spec.workspaces[0].secret")

	wantViolation(t, "claims beyond the quota", check(t, rules, obj(t, `
spec:
  pipelineRef: {name: b}
  workspaces:
    - {name: a, volumeClaimTemplate: {spec: {resources: {requests: {storage: 4Gi}}}}}
    - {name: b, volumeClaimTemplate: {spec: {resources: {requests: {storage: 2Gi}}}}}
    - {name: c, volumeClaimTemplate: {spec: {resources: {requests: {storage: 1Mi}}}}}`)),
		"spec.workspaces[0].volumeClaimTemplate.spec.resources.requests.storage", "spec.workspaces[0].volumeClaimTemplate")

	// taskRunTemplate.podTemplate: Secret volumes, Secret env, pull Secrets, host network.
	wantViolation(t, "pod template", check(t, rules, obj(t, `
spec:
  pipelineRef: {name: b}
  taskRunTemplate:
    podTemplate:
      volumes: [{name: creds, secret: {secretName: db}}]
      env: [{name: P, valueFrom: {secretKeyRef: {name: db, key: p}}}]
      imagePullSecrets: [{name: reg}]
      hostNetwork: true`)),
		"spec.taskRunTemplate.podTemplate.env[0].valueFrom.secretKeyRef", "spec.taskRunTemplate.podTemplate.hostNetwork",
		"spec.taskRunTemplate.podTemplate.imagePullSecrets",
		"spec.taskRunTemplate.podTemplate.volumes[0]", "spec.taskRunTemplate.podTemplate.volumes[0].secret")

	// Inline specs inside a run are held to the workload rules at any depth.
	wantViolation(t, "inline pipelineSpec", check(t, rules, obj(t, `
spec:
  pipelineSpec:
    tasks:
      - name: a
        taskSpec:
          steps: [{name: s, image: x, env: [{name: P, valueFrom: {secretKeyRef: {name: db, key: p}}}], securityContext: {privileged: true}}]`)),
		"spec.pipelineSpec.tasks[0].taskSpec.steps[0].env[0].valueFrom.secretKeyRef", "spec.pipelineSpec.tasks[0].taskSpec.steps[0].securityContext.privileged")
}

func TestPolicyEngine(t *testing.T) {
	policies := map[string]v1alpha1.ObjectPolicy{
		"a": {Include: []string{"b"}, Rules: []v1alpha1.ObjectRule{{Path: "x", Deny: true}}},
		"b": {Rules: []v1alpha1.ObjectRule{{Path: "y", Deny: true}}},
		"c": {Include: []string{"c"}},
	}
	rules, err := ResolvePolicy(policies, "a")
	if err != nil || len(rules) != 2 || rules[0].Path != "y" {
		t.Errorf("include order: %v %v", rules, err)
	}
	if _, err := ResolvePolicy(policies, "c"); err == nil {
		t.Error("a policy including itself was accepted")
	}
	if _, err := ResolvePolicy(policies, "missing"); err == nil {
		t.Error("a missing policy was accepted")
	}
	// "**" matches at the top level as well as deeper.
	o := obj(t, "x: 1\na: {x: 2, b: [{x: 3}]}")
	got := match(o, splitPath("**.x"))
	if len(got) != 3 || got[0].path != "x" || got[2].path != "a.b[0].x" {
		t.Errorf("** matches = %+v", got)
	}
	// Defaults never overwrite and never go through wildcards.
	d := obj(t, "spec: {sa: given}")
	setDefault(d, splitPath("spec.sa"), "pipeline")
	setDefault(d, splitPath("spec.*.sa"), "pipeline")
	if Values(d, "spec.sa")[0] != "given" || len(d["spec"].(map[string]any)) != 1 {
		t.Errorf("defaults = %v", d)
	}
	// Manifests refuse malformed rules.
	problems := validatePolicies(map[string]v1alpha1.ObjectPolicy{"p": {Rules: []v1alpha1.ObjectRule{
		{Path: "a", Deny: true, Allow: []string{"x"}},
		{Path: "a..b", Deny: true},
		{Path: "a", Allow: []string{"x"}, Equals: "y"},
	}}})
	if len(problems) != 3 {
		t.Errorf("problems = %v", problems)
	}
}
