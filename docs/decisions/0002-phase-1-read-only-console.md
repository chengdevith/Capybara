# 0002: Phase 1 read-only console

Date: 2026-10-06. Status: accepted.

## Decisions

1. **The passthrough is read-only and narrow.** Only GET on `/api/...`,
   `/apis/...` and `/version`. Watches must use the websocket hub. `exec`,
   `attach`, `portforward` and `proxy` subresources are refused, because they
   open channels into containers and services. Phase 2 widens this for
   audited write actions; plugin backends get their own proxy in Phase 4.5.
2. **The temporary `/api/clusters/{id}/pods` endpoint is removed.**
3. **Watch protocol**: JSON messages, one websocket per watch, errors sent as
   an `ERROR` message with the Kubernetes `Status` before a normal close.
   Clients re-list on 410 and otherwise resume from their last
   resourceVersion. The server asks for bookmarks so that version stays fresh.
4. **Logs protocol**: JSON messages carrying raw chunks; the browser joins
   lines. `end` and `error` are explicit, so "container exited" and "network
   dropped" look different.
5. **Websockets are same-origin only** (the `coder/websocket` default). The
   Vite proxy keeps the browser's Host header (`changeOrigin: false`), so dev
   mode passes the check.
6. **Namespace selection is in the URL (`?ns=`)**, not in a store, so links
   are shareable and the path stays `/c/{cluster}/<section>/<kind>`.
7. **Detail tab components live in `src/views/resource-tabs/`**, so the
   existing ESLint rule makes the registry the only way to add a tab.
8. **Browser-side caps**: Events tab keeps the latest 100 events per object;
   Logs tab keeps the latest 5000 lines and says how many were dropped.
9. **Demo image is imported, never pulled by nodes.** `make demo` pulls
   `busybox:1.36` once on the host, saves it for the node's platform only,
   and runs `k3d image import`. A plain `docker save` was not enough: with
   Docker Desktop's containerd image store it writes a multi-platform index
   whose other platforms have no layers, containerd treats the image as
   incomplete, and kubelet pulled it anyway. Verified after the fix: events
   say "already present on machine".
10. **Monaco is used directly, without a wrapper**, loaded only when the YAML
    tab opens (its own ~700 kB gzip chunk), with only the YAML tokenizer.
11. **Unused-variable lint allows a `_` prefix** for intentionally unused
    parameters.
