# Capybara developer entry points. Run `make help` for the list.

# Explicit package trees: `./...` would also pick up Go files that npm
# packages ship inside web/node_modules.
GO_PKGS      := ./cmd/... ./pkg/...
GOLANGCI     := go tool -modfile=tools/go.mod golangci-lint
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

.PHONY: kubectl
kubectl: ## kubectl against one local cluster: make kubectl CLUSTER=dev-1 ARGS="get pods -A"
	@test -f $(KUBECONFIGS)/capybara-$(CLUSTER).yaml || { echo "no kubeconfig for $(CLUSTER); run make cluster-up" >&2; exit 1; }
	kubectl --kubeconfig $(KUBECONFIGS)/capybara-$(CLUSTER).yaml $(ARGS)

## --- development ------------------------------------------------------------

.PHONY: dev
dev: web/node_modules ## Run the API server and the Vite dev server (UI on http://127.0.0.1:5173)
	./hack/dev.sh

.PHONY: build
build: web/node_modules ## Build the server binary and the web bundle
	go build -o .local/bin/capybara-server ./cmd/server
	npm --prefix web run build

web/node_modules: web/package.json web/package-lock.json
	npm --prefix web ci
	@touch $@

## --- quality ----------------------------------------------------------------

.PHONY: test
test: test-go test-web ## Run all tests

.PHONY: test-go
test-go:
	go test $(GO_PKGS)

.PHONY: test-web
test-web: web/node_modules
	npm --prefix web run test

.PHONY: lint
lint: lint-go lint-web ## Run all linters and type checks

.PHONY: lint-go
lint-go:
	$(GOLANGCI) run $(GO_PKGS)

.PHONY: lint-web
lint-web: web/node_modules
	npm --prefix web run lint
	npm --prefix web run typecheck
