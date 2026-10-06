import { definePlugin, EXTENSION_API_VERSION } from '@capybara/sdk'

// Everything here shows only on clusters where Monitoring is installed and
// enabled; Capybara adds that condition to each extension.
export default definePlugin({
  name: 'monitoring',
  apiVersion: EXTENSION_API_VERSION,
  register(api) {
    api.register({ type: 'nav-section', id: 'monitoring.section', label: 'Monitoring', order: 50 })
    api.register({ type: 'route', id: 'monitoring.overview', path: 'monitoring', scope: 'cluster', title: 'Monitoring', component: () => import('./OverviewPage.vue') })
    api.register({ type: 'route', id: 'monitoring.alerts', path: 'monitoring/alerts', scope: 'cluster', title: 'Alerts', component: () => import('./AlertsPage.vue') })
    api.register({ type: 'route', id: 'monitoring.grafana', path: 'monitoring/grafana', scope: 'cluster', title: 'Grafana', component: () => import('./GrafanaPage.vue') })
    api.register({ type: 'nav-item', id: 'monitoring.nav.overview', label: 'Overview', order: 10, section: 'monitoring.section', route: 'monitoring.overview' })
    api.register({ type: 'nav-item', id: 'monitoring.nav.alerts', label: 'Alerts', order: 20, section: 'monitoring.section', route: 'monitoring.alerts' })
    api.register({ type: 'nav-item', id: 'monitoring.nav.grafana', label: 'Grafana', order: 30, section: 'monitoring.section', route: 'monitoring.grafana' })
    api.register({
      type: 'resource-detail-tab', id: 'monitoring.tab.metrics', label: 'Metrics', order: 60,
      kinds: ['Pod', 'Deployment', 'Node'], component: () => import('./MetricsTab.vue'),
    })
    api.register({ type: 'cluster-overview-card', id: 'monitoring.card.cluster', title: 'Resource usage', order: 40, component: () => import('./ClusterCard.vue') })
    api.register({ type: 'project-overview-card', id: 'monitoring.card.project', title: 'Quota vs usage', order: 10, component: () => import('./ProjectCard.vue') })
    api.register({ type: 'settings-page', id: 'monitoring.settings', label: 'Monitoring', order: 10, component: () => import('./SettingsPage.vue') })
  },
})
