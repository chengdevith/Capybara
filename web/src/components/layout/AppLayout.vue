<script setup lang="ts">
import { NLayout, NLayoutContent, NLayoutHeader, NLayoutSider } from 'naive-ui'
import { onMounted } from 'vue'
import { useClustersStore } from '@/stores/clusters'
import AppSidebar from './AppSidebar.vue'
import TopBar from './TopBar.vue'

const clusters = useClustersStore()
onMounted(() => clusters.ensureLoaded())
</script>

<template>
  <NLayout class="app">
    <NLayoutHeader class="masthead">
      <TopBar />
    </NLayoutHeader>
    <NLayout
      has-sider
      class="body"
    >
      <NLayoutSider
        :width="220"
        :native-scrollbar="false"
        inverted
        class="sider"
      >
        <AppSidebar />
      </NLayoutSider>
      <NLayoutContent
        class="content"
        content-style="padding: 24px;"
      >
        <RouterView />
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<style scoped>
.app {
  height: 100vh;
}
.masthead {
  height: 56px;
  background: var(--capy-masthead-bg);
  color: #fff;
}
.body {
  height: calc(100vh - 56px);
}
.sider {
  background: var(--capy-sider-bg);
}
.content {
  background: var(--capy-content-bg);
}
</style>
