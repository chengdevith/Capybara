import { expect, test } from '@playwright/test'
import { kubectl } from './kube'

const exists = (cluster: 'dev-1' | 'mgmt', ...args: string[]) => {
  try {
    kubectl(cluster, 'get', ...args, '-o', 'name')
    return true
  } catch {
    return false
  }
}

test('creating a Project in the UI produces its resources in dev-1, deleting it removes them', async ({ page }) => {
  const name = `e2e-${Date.now().toString(36)}`

  await page.goto('/c/dev-1/projects')
  await page.getByTestId('create-project').click()
  await page.getByTestId('project-name').locator('input').fill(name)
  await page.getByTestId('project-owner').locator('input').fill('team-e2e')
  await page.getByTestId('create-submit').click()

  await expect(page).toHaveURL(new RegExp(`/c/dev-1/projects/${name}$`))
  await expect(page.getByTestId('project-phase')).toHaveText('Ready', { timeout: 30_000 })

  // Everything a Project consists of, in the managed cluster.
  const ns = JSON.parse(kubectl('dev-1', 'get', 'namespace', name, '-o', 'json'))
  expect(ns.metadata.labels['platform.capybara.io/project']).toBe(name)
  const quota = JSON.parse(kubectl('dev-1', '-n', name, 'get', 'resourcequota', 'capybara-project-quota', '-o', 'json'))
  expect(quota.spec.hard.pods).toBe('10') // size S
  expect(exists('dev-1', '-n', name, 'limitrange', 'capybara-project-limits')).toBe(true)
  const policies = kubectl('dev-1', '-n', name, 'get', 'networkpolicy', '-o', 'jsonpath={.items[*].metadata.name}').split(' ').sort()
  expect(policies).toEqual(['capybara-allow-from-ingress', 'capybara-allow-same-namespace', 'capybara-default-deny-ingress'])
  const rb = JSON.parse(kubectl('dev-1', '-n', name, 'get', 'rolebinding', 'capybara-project-owner', '-o', 'json'))
  expect(rb.roleRef.name).toBe('admin')
  expect(rb.subjects).toEqual([{ kind: 'Group', name: 'team-e2e', apiGroup: 'rbac.authorization.k8s.io' }])

  // Delete with type-the-name; the controller removes the namespace.
  await page.getByTestId('project-delete').click()
  await page.getByTestId('confirm-name').locator('input').fill(name)
  await page.getByTestId('confirm').click()
  await expect(page.getByText('This Project was deleted')).toBeVisible({ timeout: 90_000 })

  await expect.poll(() => exists('dev-1', 'namespace', name), { timeout: 30_000 }).toBe(false)
  expect(exists('mgmt', 'project', name)).toBe(false)

  // The audit log tells the whole story, linked together.
  await page.goto('/c/dev-1/audit')
  const table = page.getByTestId('audit-table')
  await expect(table.locator('tr', { hasText: `Project/${name}` }).first()).toBeVisible()
  await expect(table.locator('tr', { hasText: `Namespace/${name}` }).first()).toContainText('success')
})
