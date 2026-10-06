package main

import (
	"errors"
	"fmt"
	"regexp"
	"time"
)

// Only predefined queries run: the UI picks a query name and a target,
// never PromQL. Target names are validated, so they cannot inject PromQL.

var (
	nameRE = regexp.MustCompile(`^[a-z0-9]([-a-z0-9.]{0,251}[a-z0-9])?$`)
	nodeRE = regexp.MustCompile(`^[a-zA-Z0-9]([-a-zA-Z0-9._]{0,251}[a-zA-Z0-9])?$`)
)

// Range is a supported time range.
type Range struct {
	Name  string
	Span  time.Duration
	Step  time.Duration
	Cache time.Duration
}

// Ranges are the time ranges the UI offers.
var Ranges = map[string]Range{
	"1h":  {"1h", time.Hour, 30 * time.Second, 30 * time.Second},
	"6h":  {"6h", 6 * time.Hour, 2 * time.Minute, time.Minute},
	"24h": {"24h", 24 * time.Hour, 5 * time.Minute, 2 * time.Minute},
	"7d":  {"7d", 7 * 24 * time.Hour, 30 * time.Minute, 5 * time.Minute},
}

// Target is what a metrics query is about.
type Target struct {
	Kind      string // pod, deployment, node, namespace
	Namespace string
	Name      string
}

func (t Target) validate() error {
	switch t.Kind {
	case "pod", "deployment":
		if !nameRE.MatchString(t.Namespace) || !nameRE.MatchString(t.Name) {
			return errors.New("namespace and name must be Kubernetes names")
		}
	case "node":
		if !nodeRE.MatchString(t.Name) {
			return errors.New("name must be a node name")
		}
	case "namespace":
		if !nameRE.MatchString(t.Namespace) {
			return errors.New("namespace must be a Kubernetes name")
		}
	default:
		return fmt.Errorf("unknown kind %q", t.Kind)
	}
	return nil
}

// selector is the container-metrics label selector for a target.
func (t Target) selector() string {
	switch t.Kind {
	case "pod":
		return fmt.Sprintf(`namespace=%q,pod=%q,container!=""`, t.Namespace, t.Name)
	case "deployment":
		// Pods of a Deployment: <name>-<replicaset hash>-<pod suffix>.
		return fmt.Sprintf(`namespace=%q,pod=~%q,container!=""`, t.Namespace, regexp.QuoteMeta(t.Name)+`-[a-z0-9]{5,10}-[a-z0-9]{5}`)
	case "node":
		return fmt.Sprintf(`node=%q,container!=""`, t.Name)
	default: // namespace
		return fmt.Sprintf(`namespace=%q,container!=""`, t.Namespace)
	}
}

// by is how a target's series are split.
func (t Target) by() string {
	switch t.Kind {
	case "pod":
		return "container"
	case "deployment":
		return "pod"
	default:
		return ""
	}
}

// Series are the range queries for a target: CPU (cores) and memory
// (working set bytes), split per container (pod) or per pod (deployment).
func (t Target) Series() (cpu, memory string) {
	sel, by := t.selector(), t.by()
	agg := "sum"
	if by != "" {
		agg = "sum by (" + by + ")"
	}
	return fmt.Sprintf(`%s (rate(container_cpu_usage_seconds_total{%s}[5m]))`, agg, sel),
		fmt.Sprintf(`%s (container_memory_working_set_bytes{%s})`, agg, sel)
}

// Capacity queries (nodes only).
func (t Target) Capacity() (cpu, memory string) {
	if t.Kind != "node" {
		return "", ""
	}
	return fmt.Sprintf(`sum(machine_cpu_cores{node=%q})`, t.Name), fmt.Sprintf(`sum(machine_memory_bytes{node=%q})`, t.Name)
}

// Overview queries (instant) for a cluster.
var Overview = map[string]string{
	"cpuUsed":        `sum(rate(container_cpu_usage_seconds_total{container!=""}[5m]))`,
	"cpuCapacity":    `sum(machine_cpu_cores)`,
	"memoryUsed":     `sum(container_memory_working_set_bytes{container!=""})`,
	"memoryCapacity": `sum(machine_memory_bytes)`,
	"targetsUp":      `count(up == 1)`,
	"targetsDown":    `count(up == 0) or vector(0)`,
}

// NamespaceUsage queries (instant) for a Project's namespace.
func NamespaceUsage(ns string) map[string]string {
	sel := fmt.Sprintf(`namespace=%q,container!=""`, ns)
	return map[string]string{
		"cpu":    fmt.Sprintf(`sum(rate(container_cpu_usage_seconds_total{%s}[5m])) or vector(0)`, sel),
		"memory": fmt.Sprintf(`sum(container_memory_working_set_bytes{%s}) or vector(0)`, sel),
		"pods":   fmt.Sprintf(`count(count by (pod) (container_memory_working_set_bytes{%s})) or vector(0)`, sel),
	}
}
