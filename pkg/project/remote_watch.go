package project

import (
	"context"
	"log/slog"
	"time"

	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/informers"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/cache"
	"sigs.k8s.io/controller-runtime/pkg/event"

	"github.com/capybara/capybara/api/v1alpha1"
	"github.com/capybara/capybara/pkg/cluster"
)

// Clusters lists the managed clusters and their clients.
type Clusters interface {
	List() []cluster.Info
	Client(id string) (kubernetes.Interface, error)
}

// RemoteWatcher watches Capybara-managed objects (by label) in every
// managed cluster and requeues their Project when one changes, so drift is
// corrected in seconds. An unreachable cluster just keeps retrying in its
// own informers; nothing else waits for it.
type RemoteWatcher struct {
	Clusters Clusters
	Events   chan<- event.GenericEvent
	Logger   *slog.Logger
	// Resync of the informers themselves (0 = none; the reconciler resyncs).
	Resync time.Duration
}

// Start implements manager.Runnable.
func (w *RemoteWatcher) Start(ctx context.Context) error {
	for _, c := range w.Clusters.List() {
		cs, err := w.Clusters.Client(c.ID)
		if err != nil {
			w.Logger.Warn("not watching cluster", "cluster", c.ID, "err", err)
			continue
		}
		w.watch(ctx, c.ID, cs)
	}
	<-ctx.Done()
	return nil
}

func (w *RemoteWatcher) watch(ctx context.Context, id string, cs kubernetes.Interface) {
	f := informers.NewSharedInformerFactoryWithOptions(cs, w.Resync,
		informers.WithTweakListOptions(func(o *metav1.ListOptions) { o.LabelSelector = v1alpha1.LabelProject }))
	h := cache.ResourceEventHandlerFuncs{
		AddFunc:    w.enqueue,
		UpdateFunc: func(_, obj any) { w.enqueue(obj) },
		DeleteFunc: w.enqueue,
	}
	for _, inf := range []cache.SharedIndexInformer{
		f.Core().V1().Namespaces().Informer(),
		f.Core().V1().ResourceQuotas().Informer(),
		f.Core().V1().LimitRanges().Informer(),
		f.Networking().V1().NetworkPolicies().Informer(),
		f.Rbac().V1().RoleBindings().Informer(),
	} {
		if _, err := inf.AddEventHandler(h); err != nil {
			w.Logger.Error("watch setup failed", "cluster", id, "err", err)
		}
	}
	f.Start(ctx.Done())
	w.Logger.Info("watching managed objects", "cluster", id)
}

func (w *RemoteWatcher) enqueue(obj any) {
	if d, ok := obj.(cache.DeletedFinalStateUnknown); ok {
		obj = d.Obj
	}
	m, err := meta.Accessor(obj)
	if err != nil {
		return
	}
	name := m.GetLabels()[v1alpha1.LabelProject]
	if name == "" {
		return
	}
	w.Events <- event.GenericEvent{Object: &v1alpha1.Project{ObjectMeta: metav1.ObjectMeta{Name: name}}}
}
