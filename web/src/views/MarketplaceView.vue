<script setup lang="ts">
import { NAlert, NCard, NEmpty, NGrid, NGridItem, NH2, NTag } from 'naive-ui'
import { onMounted } from 'vue'
import { usePluginsStore } from '@/stores/plugins'

// Plugins from trusted repositories. Each is installed (or connected) per
// cluster; its UI shows only on clusters where it is enabled.
const plugins = usePluginsStore()
onMounted(() => void plugins.load())

const summary = (p: (typeof plugins.catalog)[number]) => {
  const ready = p.installations.filter((i) => i.status.phase === 'Ready').map((i) => i.spec.cluster)
  return ready.length ? `enabled on ${ready.join(', ')}` : p.installations.length ? `${p.installations.length} installation(s)` : 'not installed'
}
</script>

<template>
  <div>
    <NH2>Marketplace</NH2>
    <NAlert
      v-if="plugins.error"
      type="error"
      class="block"
    >
      {{ plugins.error }}
    </NAlert>
    <NEmpty
      v-if="plugins.loaded && plugins.catalog.length === 0"
      description="No plugins in the catalog."
    />
    <NGrid
      cols="1 m:2 l:3"
      responsive="screen"
      :x-gap="16"
      :y-gap="16"
    >
      <NGridItem
        v-for="p in plugins.catalog"
        :key="p.name"
      >
        <RouterLink
          :to="{ name: 'core.marketplace.plugin', params: { name: p.name } }"
          class="card-link"
          :data-test="`plugin-${p.name}`"
        >
          <NCard
            hoverable
            class="card"
          >
            <div class="head">
              <img
                v-if="p.spec.icon"
                :src="p.spec.icon"
                alt=""
                width="32"
                height="32"
              >
              <div>
                <div class="name">
                  {{ p.spec.displayName }}
                </div>
                <div class="muted">
                  v{{ p.spec.version }} · {{ p.spec.repository }}
                </div>
              </div>
            </div>
            <p class="desc">
              {{ p.spec.description }}
            </p>
            <NTag
              size="small"
              :bordered="false"
              :type="p.status.available ? 'success' : 'error'"
            >
              {{ p.status.available ? summary(p) : 'unavailable' }}
            </NTag>
            <NTag
              v-if="p.ui?.dev"
              size="small"
              type="warning"
              :bordered="false"
              class="dev"
              data-test="dev-bundle"
            >
              dev bundle
            </NTag>
          </NCard>
        </RouterLink>
      </NGridItem>
    </NGrid>
  </div>
</template>

<style scoped>
.card-link {
  text-decoration: none;
  color: inherit;
}
.card {
  height: 100%;
}
.head {
  display: flex;
  gap: 12px;
  align-items: center;
}
.name {
  font-weight: 600;
  font-size: 16px;
}
.muted {
  opacity: 0.7;
  font-size: 12px;
}
.desc {
  font-size: 13px;
}
.dev {
  margin-left: 6px;
}
.block {
  margin-bottom: 12px;
}
</style>
