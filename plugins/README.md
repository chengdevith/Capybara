# plugins

First-party plugins, one folder each: `plugins/<name>/{plugin.yaml, chart/, backend/, ui/, upstream/, images.txt, docs/}`.

- `monitoring` (shown as Observe): Prometheus + Grafana, Phase 4.5.
- `tekton` (shown as Pipelines): Tekton Pipelines, Phase 4.6.

Shared tooling (the Makefile and `hack/` scripts loop over every plugin):

- `_ui-build/`: the Vite config factory and the Node-version and bundle
  checks every UI bundle uses. `make plugin-ui [PLUGIN=…]` builds and pins.
- `upstream/build.yaml`: for tools that ship plain YAML, not a chart;
  `make plugin-chart PLUGIN=…` builds a deterministic chart from the
  vendored manifest (`cmd/plugin-chart`).
- `images.txt`: every image the chart names, pinned by digest (`skip` for
  ones never run here); `make plugin-images [PLUGIN=…]` imports them into k3d.
- `backend/dev.addr`: a backend's local listen address for `make dev`.

`make lint` rebuilds every bundle and generated chart and fails unless the
bytes match their pins, and checks each image list against its chart.
