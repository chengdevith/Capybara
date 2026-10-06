package project

import (
	"encoding/json"
	"strings"
	"testing"

	corev1 "k8s.io/api/core/v1"
	networkingv1 "k8s.io/api/networking/v1"
	rbacv1 "k8s.io/api/rbac/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/capybara/capybara/api/v1alpha1"
)

func testProject() *v1alpha1.Project {
	return &v1alpha1.Project{
		ObjectMeta: metav1.ObjectMeta{Name: "shop", UID: "uid-1"},
		Spec:       v1alpha1.ProjectSpec{Cluster: "dev-1", Namespace: "shop", Owner: "team-shop", Size: v1alpha1.SizeS},
	}
}

func repoConfig(t *testing.T) *Config {
	t.Helper()
	c, err := LoadConfig("../../deploy/project-sizes.yaml")
	if err != nil {
		t.Fatal(err)
	}
	return c
}

// roundTrip turns an apply configuration into the typed object it describes.
func roundTrip(t *testing.T, ac any, into any) {
	t.Helper()
	raw, err := json.Marshal(ac)
	if err != nil {
		t.Fatal(err)
	}
	if err := json.Unmarshal(raw, into); err != nil {
		t.Fatal(err)
	}
}

func TestRepoConfigLoads(t *testing.T) {
	c := repoConfig(t)
	s := c.Sizes[v1alpha1.SizeS]
	if q := s.Quota[corev1.ResourceRequestsCPU]; q.String() != "1" {
		t.Errorf("S requests.cpu = %s", q.String())
	}
	if m := c.Sizes[v1alpha1.SizeL].Limits.Max[corev1.ResourceMemory]; m.String() != "8Gi" {
		t.Errorf("L max memory = %s", m.String())
	}
	if len(c.IngressSources) != 2 {
		t.Errorf("ingress sources = %+v", c.IngressSources)
	}
}

func TestConfigValidation(t *testing.T) {
	cases := map[string]string{
		"missing size": `sizes: {S: {quota: {pods: "1"}}, M: {quota: {pods: "1"}}}`,
		"extra size":   `sizes: {S: {quota: {pods: "1"}}, M: {quota: {pods: "1"}}, L: {quota: {pods: "1"}}, XL: {quota: {pods: "1"}}}`,
		"empty quota":  `sizes: {S: {quota: {}}, M: {quota: {pods: "1"}}, L: {quota: {pods: "1"}}}`,
		"default>max":  `sizes: {S: {quota: {pods: "1"}, limits: {default: {cpu: "2"}, max: {cpu: "1"}}}, M: {quota: {pods: "1"}}, L: {quota: {pods: "1"}}}`,
		"bad source":   `sizes: {S: {quota: {pods: "1"}}, M: {quota: {pods: "1"}}, L: {quota: {pods: "1"}}}` + "\ningressSources: [{name: x}]",
		"unknown key":  `sizes: {S: {quota: {pods: "1"}}, M: {quota: {pods: "1"}}, L: {quota: {pods: "1"}}}` + "\nsurprise: true",
	}
	for name, raw := range cases {
		if _, err := ParseConfig([]byte(raw)); err == nil {
			t.Errorf("%s: expected an error", name)
		}
	}
}

func TestBuildLabelsEverythingAndSizesQuota(t *testing.T) {
	p := testProject()
	d := Build(p, repoConfig(t).Sizes[v1alpha1.SizeS], nil)

	var ns corev1.Namespace
	roundTrip(t, d.Namespace, &ns)
	var quota corev1.ResourceQuota
	roundTrip(t, d.Quota, &quota)
	var lr corev1.LimitRange
	roundTrip(t, d.LimitRange, &lr)
	var rb rbacv1.RoleBinding
	roundTrip(t, d.OwnerBinding, &rb)

	for _, meta := range []metav1.ObjectMeta{ns.ObjectMeta, quota.ObjectMeta, lr.ObjectMeta, rb.ObjectMeta} {
		if meta.Labels[v1alpha1.LabelProject] != "shop" || meta.Labels[v1alpha1.LabelManagedBy] != "capybara" ||
			meta.Annotations[v1alpha1.AnnotationProjectUID] != "uid-1" {
			t.Errorf("%s: labels %v annotations %v", meta.Name, meta.Labels, meta.Annotations)
		}
	}
	if ns.Name != "shop" || quota.Namespace != "shop" {
		t.Errorf("names: ns %q quota ns %q", ns.Name, quota.Namespace)
	}
	if v := quota.Spec.Hard[corev1.ResourceLimitsMemory]; v.String() != "4Gi" {
		t.Errorf("quota limits.memory = %s", v.String())
	}
	item := lr.Spec.Limits[0]
	if item.Type != corev1.LimitTypeContainer || item.Default.Cpu().String() != "500m" || item.Max.Memory().String() != "4Gi" {
		t.Errorf("limit range = %+v", item)
	}
	if rb.RoleRef.Kind != "ClusterRole" || rb.RoleRef.Name != "admin" ||
		len(rb.Subjects) != 1 || rb.Subjects[0].Kind != "Group" || rb.Subjects[0].Name != "team-shop" || rb.Subjects[0].APIGroup != "rbac.authorization.k8s.io" {
		t.Errorf("role binding = %+v / %+v", rb.RoleRef, rb.Subjects)
	}
}

func policies(t *testing.T, d Desired) map[string]networkingv1.NetworkPolicy {
	t.Helper()
	out := map[string]networkingv1.NetworkPolicy{}
	for _, ac := range d.NetworkPolicys {
		var np networkingv1.NetworkPolicy
		roundTrip(t, ac, &np)
		out[np.Name] = np
	}
	return out
}

func TestNetworkPolicies(t *testing.T) {
	c := repoConfig(t)
	nps := policies(t, Build(testProject(), c.Sizes[v1alpha1.SizeS], c.IngressSources))

	deny := nps[DenyIngressName]
	if len(deny.Spec.Ingress) != 0 || len(deny.Spec.PolicyTypes) != 1 || deny.Spec.PolicyTypes[0] != networkingv1.PolicyTypeIngress ||
		len(deny.Spec.PodSelector.MatchLabels) != 0 {
		t.Errorf("deny = %+v", deny.Spec)
	}
	same := nps[SameNamespaceName].Spec.Ingress
	if len(same) != 1 || len(same[0].From) != 1 || same[0].From[0].PodSelector == nil || same[0].From[0].NamespaceSelector != nil {
		t.Errorf("same-namespace = %+v", same)
	}
	for name, np := range nps {
		for _, pt := range np.Spec.PolicyTypes {
			if pt == networkingv1.PolicyTypeEgress {
				t.Errorf("%s restricts egress", name)
			}
		}
	}

	from := nps[FromIngressName].Spec.Ingress
	if len(from) != 1 || len(from[0].From) != 2 {
		t.Fatalf("from-ingress rules = %+v", from)
	}
	router, nginx := from[0].From[0].NamespaceSelector, from[0].From[1].NamespaceSelector
	if v, ok := router.MatchLabels["policy-group.network.openshift.io/ingress"]; !ok || v != "" {
		t.Errorf("OpenShift router peer = %+v", router)
	}
	if nginx.MatchLabels["kubernetes.io/metadata.name"] != "ingress-nginx" {
		t.Errorf("ingress-nginx peer = %+v", nginx)
	}
}

func TestNoIngressSourcesMeansNoRuleNotAllowAll(t *testing.T) {
	c := repoConfig(t)
	nps := policies(t, Build(testProject(), c.Sizes[v1alpha1.SizeS], nil))
	from := nps[FromIngressName]
	if len(from.Spec.Ingress) != 0 {
		t.Fatalf("with no sources the policy must have no rules (an empty from allows everyone): %+v", from.Spec.Ingress)
	}
	raw, _ := json.Marshal(from.Spec)
	if strings.Contains(string(raw), `"ingress":[{}]`) {
		t.Fatal("allow-all rule generated")
	}
}

func TestNamespaceOwnership(t *testing.T) {
	p := testProject()
	ns := func(labels, ann map[string]string) *corev1.Namespace {
		return &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: "shop", Labels: labels, Annotations: ann}}
	}
	cases := map[string]struct {
		ns   *corev1.Namespace
		want Ownership
	}{
		"absent":           {nil, Absent},
		"not ours":         {ns(nil, nil), Foreign},
		"other project":    {ns(map[string]string{v1alpha1.LabelProject: "other"}, map[string]string{v1alpha1.AnnotationProjectUID: "uid-1"}), Foreign},
		"earlier project":  {ns(map[string]string{v1alpha1.LabelProject: "shop"}, map[string]string{v1alpha1.AnnotationProjectUID: "uid-0"}), Stale},
		"label but no uid": {ns(map[string]string{v1alpha1.LabelProject: "shop"}, nil), Stale},
		"ours":             {ns(map[string]string{v1alpha1.LabelProject: "shop"}, map[string]string{v1alpha1.AnnotationProjectUID: "uid-1"}), Owned},
	}
	for name, tc := range cases {
		if got := NamespaceOwnership(tc.ns, p); got != tc.want {
			t.Errorf("%s: got %v, want %v", name, got, tc.want)
		}
	}
}

func TestResourcesListsWhatBuildCreates(t *testing.T) {
	rs := Resources(testProject())
	if len(rs) != 7 || rs[0].Kind != "Namespace" || rs[6].Kind != "RoleBinding" {
		t.Fatalf("resources = %+v", rs)
	}
}
