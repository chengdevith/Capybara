<script setup lang="ts">
import { useCluster } from '@capybara/sdk'
import { NButton, NCard, NH2 } from 'naive-ui'
import { grafanaURL } from './api'

const cluster = useCluster()
</script>

<template>
  <div>
    <NH2>Grafana</NH2>
    <NCard>
      <p>Grafana's dashboards for this cluster, read-only (anonymous Viewer) through Capybara.</p>
      <NButton
        v-if="cluster"
        type="primary"
        tag="a"
        :href="grafanaURL(cluster)"
        target="_blank"
        rel="noopener"
        data-test="open-grafana"
      >
        Open Grafana
      </NButton>
    </NCard>
  </div>
</template>
