import { ref, type Ref } from 'vue'
import { applyObject, type Conflict, type Target } from '@/api/actions'
import { ApiError } from '@/api/client'
import type { ResourceType } from '@/api/k8s'
import { parseObject, toEditableYaml } from '@/components/resource/yaml'

export type ApplyPhase = 'editing' | 'reviewing' | 'conflict' | 'stale' | 'done'

export interface ApplyFlow {
  phase: Ref<ApplyPhase>
  busy: Ref<boolean>
  error: Ref<string | null>
  conflicts: Ref<Conflict[]>
  /** The dry-run result, as editable YAML, for the review diff. */
  preview: Ref<string | null>
  review: (text: string) => Promise<void>
  apply: (text: string, opts?: { force?: boolean }) => Promise<void>
  /** Back to editing (e.g. after looking at the diff). */
  edit: () => void
}

/**
 * The YAML edit flow: review (server dry run, shown as a diff), apply,
 * and conflicts. Field-manager conflicts can be force-applied; a stale
 * object (changed in the cluster meanwhile) must be reloaded.
 */
export function useApplyFlow(cluster: () => string, target: () => Target, type: () => ResourceType): ApplyFlow {
  const phase = ref<ApplyPhase>('editing')
  const busy = ref(false)
  const error = ref<string | null>(null)
  const conflicts = ref<Conflict[]>([])
  const preview = ref<string | null>(null)

  async function run(text: string, dryRun: boolean, force: boolean) {
    error.value = null
    let object: Record<string, unknown>
    try {
      object = parseObject(text)
    } catch (e) {
      error.value = (e as Error).message
      return
    }
    busy.value = true
    try {
      const res = await applyObject(cluster(), target(), object, { dryRun, force })
      if (dryRun) {
        preview.value = toEditableYaml(type(), res.object)
        phase.value = 'reviewing'
      } else {
        phase.value = 'done'
      }
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        if (e.body.stale) {
          phase.value = 'stale'
        } else {
          conflicts.value = (e.body.conflicts as Conflict[] | undefined) ?? []
          phase.value = 'conflict'
        }
      } else {
        error.value = e instanceof Error ? e.message : String(e)
      }
    } finally {
      busy.value = false
    }
  }

  return {
    phase,
    busy,
    error,
    conflicts,
    preview,
    review: (text) => run(text, true, false),
    apply: (text, opts = {}) => run(text, false, opts.force ?? false),
    edit: () => {
      phase.value = 'editing'
      preview.value = null
      conflicts.value = []
      error.value = null
    },
  }
}
