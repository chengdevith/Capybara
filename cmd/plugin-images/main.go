// Command plugin-images lists the container images a plugin's chart would
// run with its preset values (container images, and images controllers are
// told to start through -…-image flags), so they can be pulled on the host
// and imported into k3d (nodes never pull). make lint compares the list with
// plugins/<name>/images.txt.
//
//	go run ./cmd/plugin-images -plugin plugins/tekton
package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"github.com/capybara/capybara/pkg/plugin"
)

func main() {
	dir := flag.String("plugin", "", "plugin directory, e.g. plugins/monitoring")
	kubeVersion := flag.String("kube-version", "v1.35.5", "target Kubernetes version")
	flag.Parse()
	if err := run(*dir, *kubeVersion); err != nil {
		fmt.Fprintln(os.Stderr, "plugin-images:", err)
		os.Exit(1)
	}
}

func run(dir, kubeVersion string) error {
	if dir == "" {
		return fmt.Errorf("-plugin is required")
	}
	_, spec, err := plugin.LoadDir(filepath.Clean(dir), "builtin")
	if err != nil {
		return err
	}
	if spec.Chart == nil {
		return nil // nothing to install
	}
	ch, values, err := plugin.LoadInstallChart(dir, spec, "dev-1")
	if err != nil {
		return err
	}
	// The chart's own CRDs are served once it is installed: let templates
	// that check for them (.Capabilities.APIVersions) render as they will.
	apiVersions, err := plugin.ChartAPIVersions(ch)
	if err != nil {
		return err
	}
	r, err := plugin.Render(context.Background(), ch, plugin.RenderOptions{
		ReleaseName: spec.Chart.ReleaseName, Namespace: spec.Chart.Namespace, Values: values,
		KubeVersion: kubeVersion, APIVersions: apiVersions,
	})
	if err != nil {
		return err
	}
	for _, img := range plugin.Images(r.Objects) {
		fmt.Println(img)
	}
	return nil
}
