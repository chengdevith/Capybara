package project

import (
	"context"
	"log/slog"
	"strings"
	"testing"
	"time"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"sigs.k8s.io/controller-runtime/pkg/cache"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/deploy"
)

func sizesConfigMap(data string) *corev1.ConfigMap {
	return &corev1.ConfigMap{
		ObjectMeta: metav1.ObjectMeta{Namespace: v1alpha1.SystemNamespace, Name: SizesConfigMap},
		Data:       map[string]string{SizesKey: data},
	}
}

func TestConfigSourceKeepsLastGood(t *testing.T) {
	s, err := NewConfigSource(deploy.ProjectSizes, slog.New(slog.DiscardHandler))
	if err != nil {
		t.Fatal(err)
	}
	if st := s.Status(); !st.Builtin || st.Problem != "" {
		t.Fatalf("start = %+v, want built-in", st)
	}
	changed := 0
	s.Subscribe(func() { changed++ })
	var problems []string
	s.OnProblem(func(_ *corev1.ConfigMap, p string) { problems = append(problems, p) })

	custom := strings.Replace(string(deploy.ProjectSizes), `pods: "10"`, `pods: "11"`, 1)
	s.Apply(sizesConfigMap(custom))
	if q := s.Get().Sizes[v1alpha1.SizeS].Quota[corev1.ResourcePods]; q.String() != "11" || changed != 1 || s.Status().Builtin {
		t.Fatalf("valid ConfigMap not applied: pods=%s changed=%d status=%+v", q.String(), changed, s.Status())
	}

	s.Apply(sizesConfigMap("sizes: {S: {quota: {pods: lots}}}"))
	if q := s.Get().Sizes[v1alpha1.SizeS].Quota[corev1.ResourcePods]; q.String() != "11" {
		t.Fatal("an invalid ConfigMap replaced the last good config")
	}
	if st := s.Status(); !strings.Contains(st.Problem, "is invalid") || !strings.Contains(st.Problem, "still using ConfigMap") || changed != 1 || len(problems) != 1 {
		t.Fatalf("status = %+v changed=%d problems=%v", st, changed, problems)
	}

	s.Deleted()
	if !strings.Contains(s.Status().Problem, "deleted") || podsOf(s) != "11" {
		t.Fatal("deletion must keep the last good config and say so")
	}
}

func TestConfigSourceWatchesTheConfigMap(t *testing.T) {
	requireEnv(t)
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	_ = env.mgmt.Create(ctx, &corev1.Namespace{ObjectMeta: metav1.ObjectMeta{Name: v1alpha1.SystemNamespace}})

	s, _ := NewConfigSource(deploy.ProjectSizes, slog.New(slog.DiscardHandler))
	c, err := cache.New(env.mgmtCfg, cache.Options{Scheme: env.mgmt.Scheme(), ByObject: CacheOptions()})
	if err != nil {
		t.Fatal(err)
	}
	go func() { _ = c.Start(ctx) }()
	if err := s.Watch(ctx, c); err != nil {
		t.Fatal(err)
	}
	c.WaitForCacheSync(ctx)

	// Not the presets ConfigMap: ignored (not even cached).
	_ = env.mgmt.Create(ctx, &corev1.ConfigMap{ObjectMeta: metav1.ObjectMeta{Namespace: v1alpha1.SystemNamespace, Name: "unrelated"}, Data: map[string]string{SizesKey: "x"}})

	cm := sizesConfigMap(strings.Replace(string(deploy.ProjectSizes), `pods: "10"`, `pods: "12"`, 1))
	if err := env.mgmt.Create(ctx, cm); err != nil {
		t.Fatal(err)
	}
	eventually(t, 10*time.Second, func() string {
		if podsOf(s) != "12" {
			return "ConfigMap not applied"
		}
		return ""
	})
	cm.Data[SizesKey] = "not: [valid"
	if err := env.mgmt.Update(ctx, cm); err != nil {
		t.Fatal(err)
	}
	eventually(t, 10*time.Second, func() string {
		if s.Status().Problem == "" {
			return "invalid ConfigMap not reported"
		}
		return ""
	})
	if podsOf(s) != "12" {
		t.Fatal("last good config lost")
	}
}

func podsOf(s *ConfigSource) string {
	q := s.Get().Sizes[v1alpha1.SizeS].Quota[corev1.ResourcePods]
	return q.String()
}
