# @capybara/sdk

What Capybara provides to plugin UI bundles: the extension API types and
version (`EXTENSION_API_VERSION`), `definePlugin`, `useCluster`, and
`pluginFetch` for the plugin's own backend.

Plugins must not bundle `vue`, `pinia`, `naive-ui` or `@capybara/sdk`:
mark them external. Capybara serves one shared copy of each through an
import map (`/capybara-shared/*.js`), so plugins and the console use the
same Vue instance. See docs/plugins.md for building a plugin.
