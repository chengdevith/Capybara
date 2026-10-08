package project

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"sync"

	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/types"
	corev1ac "k8s.io/client-go/applyconfigurations/core/v1"
	"k8s.io/client-go/kubernetes"

	"github.com/capybara/capybara/api/v1alpha1"
)

// maxViolations caps what is kept in the Project's status.
const maxViolations = 50

// warningCollector keeps the API server's warnings for one request.
type warningCollector struct {
	mu   sync.Mutex
	msgs []string
}

func (c *warningCollector) HandleWarningHeaderWithContext(_ context.Context, _ int, _ string, msg string) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.msgs = append(c.msgs, msg)
}

// podSecurityDryRun applies ns (with its Pod Security labels) as a server-side
// dry run and returns what Pod Security admission says about the pods
// already in it. Labels only affect pods when they are created: existing
// pods that violate the level keep running, but fail on their next restart
// or rollout, so they are reported, not blocking.
func podSecurityDryRun(ctx context.Context, cs kubernetes.Interface, ns *corev1ac.NamespaceApplyConfiguration) ([]string, error) {
	body, err := json.Marshal(ns)
	if err != nil {
		return nil, err
	}
	var warnings warningCollector
	err = cs.CoreV1().RESTClient().Patch(types.ApplyPatchType).
		Resource("namespaces").Name(*ns.Name).
		Param("fieldManager", FieldManager).Param("force", "true").Param("dryRun", metav1.DryRunAll).
		Body(body).
		WarningHandlerWithContext(&warnings).
		Do(ctx).Error()
	if err != nil {
		return nil, fmt.Errorf("pod security dry run: %w", err)
	}
	var out []string
	for _, w := range warnings.msgs {
		w = strings.TrimSpace(w)
		if w != "" && len(out) < maxViolations {
			out = append(out, w)
		}
	}
	return out, nil
}

// podSecurityApplied reports whether ns already carries the levels
// Capybara sets (then nothing new is enforced and no dry run is needed).
func podSecurityApplied(labels map[string]string) bool {
	for k, v := range PodSecurityLabels {
		if labels[k] != v {
			return false
		}
	}
	return true
}

// recordPodSecurity sets the Project's Pod Security status and condition.
func recordPodSecurity(st *v1alpha1.ProjectStatus, violations []string, generation int64) {
	st.PodSecurity = &v1alpha1.PodSecurityStatus{
		Enforce: v1alpha1.PodSecurityEnforce, Warn: v1alpha1.PodSecurityWarn,
		CheckedAt: metav1.Now(), Violations: violations,
	}
	podSecurityCondition(st, generation)
}

func podSecurityCondition(st *v1alpha1.ProjectStatus, generation int64) {
	ps := st.PodSecurity
	if ps == nil {
		return
	}
	c := metav1.Condition{
		Type: v1alpha1.ConditionPodSecurity, Status: metav1.ConditionTrue, Reason: v1alpha1.ReasonEnforced,
		Message:            fmt.Sprintf("pods must meet Pod Security %q; %q violations are warned about", ps.Enforce, ps.Warn),
		ObservedGeneration: generation,
	}
	if len(ps.Violations) > 0 {
		c.Status, c.Reason = metav1.ConditionFalse, v1alpha1.ReasonExistingViolations
		c.Message = fmt.Sprintf("Pod Security %q is enforced; pods that existed when it was set violate it and will fail on their next restart or rollout: %s",
			ps.Enforce, strings.Join(ps.Violations, "; "))
	}
	meta.SetStatusCondition(&st.Conditions, c)
}
