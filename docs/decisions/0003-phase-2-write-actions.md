# 0003: Phase 2 write actions, terminal and audit

Date: 2026-10-06. Status: accepted.

## Decisions

1. **Writes never go through the passthrough.** It stays GET-only; a small
   set of audited endpoints (pkg/action) does every change, so each one is
   validated and recorded with meaning (kind, name, action, result).
2. **Audit is fail-closed with write-ahead attempts.** An "attempted"
   entry is written before the action; if that fails, the action is
   refused. The outcome is written after. Every action starts with a write,
   so writes stay refused until the log works again; the server also
   refuses to start without a writable log. Refused edits and denials are
   recorded too; dry runs are not.
3. **Audit storage is a JSON Lines file behind Recorder/Reader**, one fsync
   per entry, read by scanning (fine for local, human-rate use). Swapping in
   ELK or a database only replaces the store.
4. **YAML edits use server-side apply as `capybara`**, with a server dry run
   shown as a diff before applying. `resourceVersion` stays in the edit so
   outdated copies fail as stale rather than overwrite. Force apply is a
   separate audited action behind a confirmation that names the managers
   losing ownership. Removing a line only removes a field Capybara owns;
   the review diff shows what will really happen.
5. **Scale uses the scale subresource; restart sets the restartedAt pod
   template annotation**, exactly like kubectl. Deletes carry a uid
   precondition.
6. **Protected namespaces are configurable globs** (default kube-system,
   kube-public, kube-node-lease, default, openshift-*), plus Capybara's own
   namespace (`--capybara-namespace`, default capybara-system).
7. **Secrets are metadata-only everywhere except an audited reveal.** Lists
   and gets through the passthrough are forced to PartialObjectMetadata,
   watches use the metadata client, and both scrub
   `kubectl.kubernetes.io/last-applied-configuration`: `kubectl apply`
   stores the whole Secret, values included, in that annotation, which a
   plain metadata-only design would have leaked. Found while testing
   against the real cluster; covered by unit, integration and e2e tests.
8. **Delete confirmation is per kind** (`deleteConfirm` on the
   ResourceDef): type-the-name for Deployments, Namespaces, Services and
   Secrets; a simple confirmation for Pods and ConfigMaps.
9. **Terminal**: one `sh -c` that execs bash when present, else sh (no
   second round trip); websocket executor with SPDY fallback; binary frames
   for output so split UTF-8 survives; idle (15m) and max (8h) limits by
   flag; open/close audited, never content. The record is written before
   the browser is told, so it never waits on the browser. Closing the
   shell's input on disconnect did not make TTY shells exit, and sending a
   synthetic Ctrl-D would type into the user's session, so a disconnect
   cuts the stream (client-go logs a harmless error line).
10. **End-to-end tests run in Playwright/Chromium** (`make e2e`), outside
    `make test` because they need the clusters. They use `data-test`
    attributes, like the Vitest suites.
11. **Vite pre-bundles Monaco and xterm** (`optimizeDeps.include`); found
    by the first e2e run, where on-demand bundling reloaded the page.
12. **k8s.io/streaming is a direct import** (non-deprecated httpstream);
    it and gorilla/websocket, moby/spdystream come in through client-go's
    exec support. No other new Go dependencies.
