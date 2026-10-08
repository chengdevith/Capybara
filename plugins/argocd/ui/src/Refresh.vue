<script setup lang="ts">
import { pluginAction, type KubeObject } from '@capybara/sdk'
import { useMessage } from 'naive-ui'
import { onMounted } from 'vue'
import { PLUGIN } from './argocd'

// Refresh (compare with Git again) or hard refresh (also regenerate the
// manifests): runs at once, no dialog.
const props = defineProps<{ cluster: string; object: KubeObject; hard?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const message = useMessage()

onMounted(async () => {
  const m = props.object.metadata
  try {
    await pluginAction(props.cluster, PLUGIN, props.hard ? 'hard-refresh' : 'refresh', { namespace: m.namespace, name: m.name, uid: m.uid })
    message.success(`${props.hard ? 'Hard refreshing' : 'Refreshing'} ${m.name}`)
  } catch (e) {
    message.error(e instanceof Error ? e.message : String(e))
  } finally {
    emit('close')
  }
})
</script>

<template>
  <span />
</template>
