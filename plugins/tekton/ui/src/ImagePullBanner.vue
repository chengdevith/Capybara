<script setup lang="ts">
import { pluginAction, type KubeObject } from '@capybara/sdk'
import { NAlert, NButton, useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
import { explain, imagePullProblems } from './pulls'
import { isProjectNamespace, PLUGIN, runStatus } from './tekton'

// A TaskRun (or a PipelineRun's TaskRuns) stuck pulling an image: say which
// image and why, instead of an endless Running; offer to cancel the run.
const props = defineProps<{ cluster: string; taskRuns: KubeObject[]; pipelineRun?: KubeObject | null }>()
const message = useMessage()
const busy = ref(false)

const problems = computed(() =>
  props.taskRuns.flatMap((tr) => imagePullProblems(tr).map((p) => ({ ...p, task: tr.metadata.labels?.['tekton.dev/pipelineTask'] ?? tr.metadata.name }))),
)
const images = computed(() => [...new Set(problems.value.map((p) => p.image).filter((i) => !i.startsWith('(')))])
const cancellable = computed(() => {
  const run = props.pipelineRun
  return !!run && runStatus(run).running && isProjectNamespace(run.metadata.namespace, props.cluster)
})

async function cancel() {
  const run = props.pipelineRun!
  busy.value = true
  try {
    await pluginAction(props.cluster, PLUGIN, 'cancel', { namespace: run.metadata.namespace, name: run.metadata.name, uid: run.metadata.uid })
    message.success(`Cancelling ${run.metadata.name}`)
  } catch (e) {
    message.error(e instanceof Error ? e.message : String(e))
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <NAlert
    v-if="problems.length"
    type="error"
    title="Waiting for an image that cannot be pulled"
    class="pull"
    data-test="image-pull-problem"
  >
    <div
      v-for="p in problems"
      :key="p.task + p.container"
    >
      <strong>{{ p.task }}</strong> ({{ p.container }}): {{ explain(p, cluster) }}
      <span class="reason">{{ p.reason }}</span>
    </div>
    <div class="hint">
      The run stays waiting until the image is available or the run times out. On the local k3d clusters, import
      it on the host:
      <code
        v-for="img in images"
        :key="img"
        class="cmd"
      >docker pull {{ img }} && k3d image import {{ img }} -c capybara-{{ cluster }}</code>
    </div>
    <NButton
      v-if="cancellable"
      size="small"
      type="error"
      ghost
      :loading="busy"
      class="cancel"
      data-test="image-pull-cancel"
      @click="cancel"
    >
      Cancel run
    </NButton>
  </NAlert>
</template>

<style scoped>
.pull {
  margin-bottom: 12px;
}
.reason {
  font-size: 12px;
  opacity: 0.7;
  margin-left: 6px;
}
.hint {
  margin-top: 6px;
  font-size: 12px;
  opacity: 0.85;
}
.cancel {
  margin-top: 8px;
}
.cmd {
  display: block;
  margin-top: 4px;
}
</style>
