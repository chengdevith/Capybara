import { defineConfig } from '@playwright/test'
import base from './playwright.config'

// Plugin error states, with deliberately broken dev bundles. The server
// runs with --plugin-dev-dir (unpinned bundles from .local/e2e-plugin-dev),
// so it is a separate run from the main suite, which uses pinned bundles.
export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: 'plugin-errors.spec.ts',
  webServer: {
    ...(base.webServer as object),
    command: '../hack/dev.sh',
    reuseExistingServer: false,
    env: { CAPYBARA_AUDIT_FILE: '.local/audit/e2e.jsonl', CAPYBARA_CLUSTER_CHECK_INTERVAL: '5s', CAPYBARA_PLUGIN_DEV_DIR: '.local/e2e-plugin-dev' },
  },
})
