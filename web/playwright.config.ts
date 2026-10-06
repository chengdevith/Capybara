import { defineConfig } from '@playwright/test'

// End-to-end tests against the real stack: make dev + the local k3d
// clusters with the demo workload (`make e2e` sets that up). Tests change
// shared cluster state, so they run one at a time.
export default defineConfig({
  testDir: 'e2e',
  globalSetup: './e2e/global-setup.ts',
  timeout: 90_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:5173',
    // The app marks test hooks with data-test (also used by the Vitest suites).
    testIdAttribute: 'data-test',
    browserName: 'chromium',
    headless: true,
    viewport: { width: 1400, height: 900 },
    trace: 'retain-on-failure',
  },
  outputDir: '../.local/e2e-results',
  webServer: {
    command: '../hack/dev.sh',
    // /healthz through Vite answers only once both Vite and the API are up.
    url: 'http://127.0.0.1:5173/healthz',
    reuseExistingServer: true,
    timeout: 180_000,
    env: { CAPYBARA_AUDIT_FILE: '.local/audit/e2e.jsonl' },
  },
})
