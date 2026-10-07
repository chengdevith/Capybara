# Capybara developer entry points. Run `make help` for the list.

# Every recipe line runs with pipefail, so `cmd | tail` cannot hide a failing
# cmd. (Not .SHELLFLAGS: macOS ships GNU make 3.81, which ignores it.)
SHELL := /bin/bash -o pipefail

# Explicit package trees: `./...` would also pick up Go files that npm
# packages ship inside web/node_modules.
GO_PKGS      := ./api/... ./cmd/... ./deploy/... ./pkg/...
GOLANGCI     := go tool -modfile=tools/golangci-lint/go.mod golangci-lint
CONTROLLER_GEN := go tool -modfile=tools/controller-gen/go.mod controller-gen
SETUP_ENVTEST := go tool -modfile=tools/setup-envtest/go.mod setup-envtest
ENVTEST_K8S  := 1.37.x
KUBECONFIGS  := .local/kubeconfig
CLUSTER      ?= dev-1

.DEFAULT_GOAL := help

.PHONY: help
help: ## Show this help
	@grep -hE '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F ':.*## ' '{printf "  %-14s %s\n", $$1, $$2}'

## --- local clusters ---------------------------------------------------------

.PHONY: cluster-up
cluster-up: ## Create/start k3d clusters capybara-mgmt, -dev-1, -dev-2
	./deploy/k3d/cluster-up.sh

.PHONY: cluster-down
cluster-down: ## Delete the Capybara k3d clusters and their kubeconfigs
	./deploy/k3d/cluster-down.sh

.PHONY: sa-kubeconfig
sa-kubeconfig: ## Least-privilege ServiceAccount kubeconfig: make sa-kubeconfig CLUSTER=dev-2 [WITH_SECRETS=1] (more: hack/capybara-sa.sh)
	./hack/capybara-sa.sh $(CLUSTER) $(if $(WITH_SECRETS),--with-secrets,)

.PHONY: kubectl
kubectl: ## kubectl against one local cluster: make kubectl CLUSTER=dev-1 ARGS="get pods -A"
	@test -f $(KUBECONFIGS)/capybara-$(CLUSTER).yaml || { echo "no kubeconfig for $(CLUSTER); run make cluster-up" >&2; exit 1; }
	kubectl --kubeconfig $(KUBECONFIGS)/capybara-$(CLUSTER).yaml $(ARGS)

.PHONY: demo
demo: ## Deploy the demo workload (namespace capybara-demo) into dev-1 and dev-2
	./deploy/samples/demo.sh up

.PHONY: demo-clean
demo-clean: ## Remove the demo workload from dev-1 and dev-2
	./deploy/samples/demo.sh clean

## --- development ------------------------------------------------------------

.PHONY: dev
dev: web/node_modules ## Run the API server, controller, plugin backends and the console (UI on http://127.0.0.1:5173)
	./hack/dev.sh

.PHONY: build
build: web/node_modules ## Build the server binary and the web bundle
	go build -o .local/bin/capybara-server ./cmd/server
	npm --prefix web run build

web/node_modules: web/package.json web/package-lock.json
	npm --prefix web ci
	@touch $@

## --- code generation ------------------------------------------------------

.PHONY: generate
generate: ## Regenerate deepcopy code and CRD manifests from api/
	$(CONTROLLER_GEN) object paths=./api/...
	$(CONTROLLER_GEN) crd paths=./api/... output:crd:dir=deploy/crds

.PHONY: plugin-ui
plugin-ui: ## Build a plugin's UI bundle and pin its sha256: make plugin-ui [PLUGIN=monitoring] (needs the Node in plugins/<p>/ui/.nvmrc)
	./hack/plugin-ui.sh build $(or $(PLUGIN),monitoring)

.PHONY: plugin-images
plugin-images: ## Pull a plugin's pinned images and import them into k3d: make plugin-images [PLUGIN=monitoring] [CLUSTERS="dev-1 dev-2"]
	./hack/plugin-images.sh $(or $(PLUGIN),monitoring) $(CLUSTERS)

.PHONY: project-sizes
project-sizes: ## Push deploy/project-sizes.yaml to the capybara-project-sizes ConfigMap in mgmt
	kubectl --kubeconfig $(KUBECONFIGS)/capybara-mgmt.yaml -n capybara-system create configmap capybara-project-sizes \
	  --from-file=sizes.yaml=deploy/project-sizes.yaml --dry-run=client -o yaml | \
	  kubectl --kubeconfig $(KUBECONFIGS)/capybara-mgmt.yaml apply -f -

.PHONY: crds
crds: ## Install the CRDs into capybara-mgmt
	kubectl --kubeconfig $(KUBECONFIGS)/capybara-mgmt.yaml apply --server-side -f deploy/crds

## --- quality ----------------------------------------------------------------

.PHONY: test
test: test-go test-web ## Run all tests

.PHONY: test-go
test-go: envtest
	KUBEBUILDER_ASSETS="$$($(SETUP_ENVTEST) use $(ENVTEST_K8S) --bin-dir $(CURDIR)/.local/envtest -p path)" \
	  go test $(GO_PKGS)
	cd plugins/monitoring/backend && go test ./...

# Controller tests run real kube-apiservers (envtest); binaries go to .local.
.PHONY: envtest
envtest:
	@$(SETUP_ENVTEST) use $(ENVTEST_K8S) --bin-dir $(CURDIR)/.local/envtest >/dev/null

.PHONY: test-web
test-web: web/node_modules
	npm --prefix web run test

.PHONY: e2e
e2e: web/node_modules ## Browser end-to-end tests (needs make cluster-up; resets the demo)
	@test -f $(KUBECONFIGS)/capybara-dev-1.yaml || { echo "run make cluster-up first" >&2; exit 1; }
	./deploy/samples/demo.sh up
	./hack/plugin-images.sh monitoring dev-1 dev-2
	cd web && npx playwright install chromium-headless-shell
	cd web && npx playwright test

.PHONY: lint
lint: lint-make lint-go lint-web lint-plugin-ui ## Run all linters and type checks

.PHONY: lint-make
lint-make:
	@if (false | true); then echo "Makefile recipes are not running with pipefail" >&2; exit 1; fi

.PHONY: lint-go
lint-go: lint-generated lint-plugin-images
	$(GOLANGCI) run $(GO_PKGS)
	cd plugins/monitoring/backend && go tool -modfile=$(CURDIR)/tools/golangci-lint/go.mod golangci-lint run ./...

# Fails unless the committed plugin UI bundle rebuilds byte for byte to its pin.
.PHONY: lint-plugin-ui
lint-plugin-ui:
	./hack/plugin-ui.sh check monitoring
	cd plugins/monitoring/ui && node --test scripts/
	npm --prefix plugins/monitoring/ui run --silent typecheck

# Fails if a plugin's pinned image list no longer matches its chart and preset.
.PHONY: lint-plugin-images
lint-plugin-images:
	@want=$$(go run ./cmd/plugin-images -chart plugins/monitoring/chart/kube-prometheus-stack-91.9.0.tgz \
	  -values plugins/monitoring/chart/values-small.yaml) && \
	have=$$(grep -v '^#' plugins/monitoring/images.txt | awk '{print $$1}') && \
	if [ "$$want" != "$$have" ]; then echo "plugins/monitoring/images.txt does not match the chart's images:" >&2; \
	  diff <(echo "$$want") <(echo "$$have") >&2; exit 1; fi

# Fails if the committed generated files do not match api/ (and regenerates them).
.PHONY: lint-generated
lint-generated:
	@tmp=$$(mktemp -d) && cp -R api deploy/crds "$$tmp"/ && \
	$(MAKE) -s generate >/dev/null && \
	if ! diff -r "$$tmp/api" api >/dev/null || ! diff -r "$$tmp/crds" deploy/crds >/dev/null; then \
	  echo "generated files were out of date; they are regenerated now, commit them" >&2; rm -rf "$$tmp"; exit 1; \
	fi; rm -rf "$$tmp"

.PHONY: lint-web
lint-web: web/node_modules
	npm --prefix web run lint
	npm --prefix web run typecheck
