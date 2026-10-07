# @capybara/sdk

What Capybara provides to plugin UI bundles: the extension API types and
version (`EXTENSION_API_VERSION`, `EXTENSION_API_MINOR`), `definePlugin`,
`useCluster`, `pluginFetch` for the plugin's own backend, and
`pluginAction` for the actions a plugin declares in its manifest.

The `api` a plugin's `register` receives also offers (since 1.1)
`registerResource` (the console's generic list and detail pages for the
plugin's own kinds), `components.LogViewer`, `components.ResourceLink` and
`composables.useLiveList`. A bundle that uses them declares `minApi: '1.1'`
(matching `minExtensionApi` in plugin.yaml); an older console refuses it
with a clear message instead of failing later.

Plugins must not bundle `vue`, `pinia`, `naive-ui` or `@capybara/sdk`:
mark them external. Capybara serves one shared copy of each through an
import map (`/capybara-shared/*.js`), so plugins and the console use the
same Vue instance. See docs/architecture.md (Plugins) and ADRs 0006/0007.
