// Command plugin-images lists the container images a plugin chart would run
// with its preset values, so they can be pulled on the host and imported
// into k3d (nodes never pull):
//
//	go run ./cmd/plugin-images -chart plugins/monitoring/chart/x.tgz -values plugins/monitoring/chart/values-small.yaml
package main

import (
	"context"
	"flag"
	"fmt"
	"os"

	"sigs.k8s.io/yaml"

	"github.com/capybara/capybara/pkg/plugin"
)

func main() {
	chartPath := flag.String("chart", "", "chart archive (.tgz)")
	valuesPath := flag.String("values", "", "values file")
	kubeVersion := flag.String("kube-version", "v1.35.5", "target Kubernetes version")
	flag.Parse()
	if err := run(*chartPath, *valuesPath, *kubeVersion); err != nil {
		fmt.Fprintln(os.Stderr, "plugin-images:", err)
		os.Exit(1)
	}
}

func run(chartPath, valuesPath, kubeVersion string) error {
	archive, err := os.ReadFile(chartPath) //nolint:gosec // developer-supplied path
	if err != nil {
		return err
	}
	ch, err := plugin.LoadChart(archive)
	if err != nil {
		return err
	}
	vals := map[string]any{}
	if valuesPath != "" {
		raw, err := os.ReadFile(valuesPath) //nolint:gosec // developer-supplied path
		if err != nil {
			return err
		}
		if err := yaml.Unmarshal(raw, &vals); err != nil {
			return fmt.Errorf("values: %w", err)
		}
	}
	r, err := plugin.Render(context.Background(), ch, plugin.RenderOptions{
		ReleaseName: "capybara-monitoring", Namespace: "capybara-monitoring", Values: vals, KubeVersion: kubeVersion,
		APIVersions: []string{"monitoring.coreos.com/v1"},
	})
	if err != nil {
		return err
	}
	for _, img := range plugin.Images(r.Objects) {
		fmt.Println(img)
	}
	return nil
}
