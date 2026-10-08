package project

import (
	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	corev1ac "k8s.io/client-go/applyconfigurations/core/v1"
	metav1ac "k8s.io/client-go/applyconfigurations/meta/v1"
	networkingv1ac "k8s.io/client-go/applyconfigurations/networking/v1"
	rbacv1ac "k8s.io/client-go/applyconfigurations/rbac/v1"

	"github.com/capybara/capybara/api/v1alpha1"
)

// Names of the resources inside a Project namespace.
const (
	QuotaName         = "capybara-project-quota"
	LimitRangeName    = "capybara-project-limits"
	DenyIngressName   = "capybara-default-deny-ingress"
	SameNamespaceName = "capybara-allow-same-namespace"
	FromIngressName   = "capybara-allow-from-ingress"
	OwnerBindingName  = "capybara-project-owner"
	OwnerClusterRole  = "admin"
	rbacAPIGroup      = "rbac.authorization.k8s.io"
	networkingV1      = "networking.k8s.io/v1"
	rbacV1            = "rbac.authorization.k8s.io/v1"
	coreV1            = "v1"
)

// Desired is everything a Project consists of in its cluster.
type Desired struct {
	Namespace      *corev1ac.NamespaceApplyConfiguration
	Quota          *corev1ac.ResourceQuotaApplyConfiguration
	LimitRange     *corev1ac.LimitRangeApplyConfiguration
	NetworkPolicys []*networkingv1ac.NetworkPolicyApplyConfiguration
	OwnerBinding   *rbacv1ac.RoleBindingApplyConfiguration
}

// Labels every remote resource of p carries.
func Labels(p *v1alpha1.Project) map[string]string {
	return map[string]string{
		v1alpha1.LabelProject:   p.Name,
		v1alpha1.LabelManagedBy: v1alpha1.ManagedByValue,
	}
}

// PodSecurityLabels are set on every Project namespace: pods must meet the
// baseline level; restricted violations are reported as warnings.
var PodSecurityLabels = map[string]string{
	LabelPodSecurityEnforce: v1alpha1.PodSecurityEnforce,
	LabelPodSecurityWarn:    v1alpha1.PodSecurityWarn,
}

// Pod Security admission labels.
const (
	LabelPodSecurityEnforce = "pod-security.kubernetes.io/enforce"
	LabelPodSecurityWarn    = "pod-security.kubernetes.io/warn"
)

// Annotations every remote resource of p carries.
func Annotations(p *v1alpha1.Project) map[string]string {
	return map[string]string{v1alpha1.AnnotationProjectUID: string(p.UID)}
}

// Build returns the desired remote resources of p for its size.
func Build(p *v1alpha1.Project, size SizeSpec, sources []IngressSource) Desired {
	ns := p.Spec.Namespace
	labels, ann := Labels(p), Annotations(p)

	d := Desired{
		Namespace: corev1ac.Namespace(ns).WithLabels(labels).WithLabels(PodSecurityLabels).WithAnnotations(ann),
		Quota: corev1ac.ResourceQuota(QuotaName, ns).WithLabels(labels).WithAnnotations(ann).
			WithSpec(corev1ac.ResourceQuotaSpec().WithHard(size.Quota.DeepCopy())),
		LimitRange: corev1ac.LimitRange(LimitRangeName, ns).WithLabels(labels).WithAnnotations(ann).
			WithSpec(corev1ac.LimitRangeSpec().WithLimits(corev1ac.LimitRangeItem().
				WithType(corev1.LimitTypeContainer).
				WithDefault(size.Limits.Default.DeepCopy()).
				WithDefaultRequest(size.Limits.DefaultRequest.DeepCopy()).
				WithMax(size.Limits.Max.DeepCopy()))),
		OwnerBinding: rbacv1ac.RoleBinding(OwnerBindingName, ns).WithLabels(labels).WithAnnotations(ann).
			WithRoleRef(rbacv1ac.RoleRef().WithAPIGroup(rbacAPIGroup).WithKind("ClusterRole").WithName(OwnerClusterRole)).
			WithSubjects(rbacv1ac.Subject().WithKind("Group").WithAPIGroup(rbacAPIGroup).WithName(p.Spec.Owner)),
	}

	policy := func(name string) *networkingv1ac.NetworkPolicyApplyConfiguration {
		return networkingv1ac.NetworkPolicy(name, ns).WithLabels(labels).WithAnnotations(ann)
	}
	allPods := metav1ac.LabelSelector()

	// 1. Deny all ingress by default (no rules = nothing allowed).
	deny := policy(DenyIngressName).WithSpec(networkingv1ac.NetworkPolicySpec().
		WithPodSelector(allPods).WithPolicyTypes("Ingress"))
	// 2. Allow from pods in the same namespace.
	same := policy(SameNamespaceName).WithSpec(networkingv1ac.NetworkPolicySpec().
		WithPodSelector(metav1ac.LabelSelector()).WithPolicyTypes("Ingress").
		WithIngress(networkingv1ac.NetworkPolicyIngressRule().
			WithFrom(networkingv1ac.NetworkPolicyPeer().WithPodSelector(metav1ac.LabelSelector()))))
	// 3. Allow from the configured ingress controllers. With no sources the
	// policy has no rules at all: an ingress rule with an empty "from"
	// would allow everything.
	fromSpec := networkingv1ac.NetworkPolicySpec().WithPodSelector(metav1ac.LabelSelector()).WithPolicyTypes("Ingress")
	if peers := ingressPeers(sources); len(peers) > 0 {
		fromSpec = fromSpec.WithIngress(networkingv1ac.NetworkPolicyIngressRule().WithFrom(peers...))
	}
	from := policy(FromIngressName).WithSpec(fromSpec)

	d.NetworkPolicys = []*networkingv1ac.NetworkPolicyApplyConfiguration{deny, same, from}
	return d
}

func ingressPeers(sources []IngressSource) []*networkingv1ac.NetworkPolicyPeerApplyConfiguration {
	var peers []*networkingv1ac.NetworkPolicyPeerApplyConfiguration
	for _, s := range sources {
		peer := networkingv1ac.NetworkPolicyPeer()
		if s.NamespaceSelector != nil {
			peer = peer.WithNamespaceSelector(selector(s.NamespaceSelector))
		}
		if s.PodSelector != nil {
			peer = peer.WithPodSelector(selector(s.PodSelector))
		}
		peers = append(peers, peer)
	}
	return peers
}

func selector(s *metav1.LabelSelector) *metav1ac.LabelSelectorApplyConfiguration {
	out := metav1ac.LabelSelector().WithMatchLabels(s.MatchLabels)
	for _, e := range s.MatchExpressions {
		out = out.WithMatchExpressions(metav1ac.LabelSelectorRequirement().
			WithKey(e.Key).WithOperator(e.Operator).WithValues(e.Values...))
	}
	return out
}

// Resources lists what Build produces, for the Project's status.
func Resources(p *v1alpha1.Project) []v1alpha1.ManagedResource {
	ns := p.Spec.Namespace
	return []v1alpha1.ManagedResource{
		{APIVersion: coreV1, Kind: "Namespace", Name: ns},
		{APIVersion: coreV1, Kind: "ResourceQuota", Name: QuotaName, Namespace: ns},
		{APIVersion: coreV1, Kind: "LimitRange", Name: LimitRangeName, Namespace: ns},
		{APIVersion: networkingV1, Kind: "NetworkPolicy", Name: DenyIngressName, Namespace: ns},
		{APIVersion: networkingV1, Kind: "NetworkPolicy", Name: SameNamespaceName, Namespace: ns},
		{APIVersion: networkingV1, Kind: "NetworkPolicy", Name: FromIngressName, Namespace: ns},
		{APIVersion: rbacV1, Kind: "RoleBinding", Name: OwnerBindingName, Namespace: ns},
	}
}
