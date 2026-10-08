import type { Installation, StepStatus } from '@/api/plugins'

export type Tone = 'success' | 'default' | 'error' | 'info' | 'warning'

/** How an installation card presents one installation. */
export interface InstallationView {
  /** Something was deployed (or connected) at least once. */
  deployed: boolean
  /** The pre-flight refused it before anything was changed. */
  refused: boolean
  label: string
  tone: Tone
  /** "installed · v0.1.0", or "install requested · v0.1.0" before anything was deployed. */
  subtitle: string
  steps: StepStatus[]
  /** For a refusal that names its fix: the command to run. */
  fixCommand?: string
}

const PREFLIGHT_STEP = 'preflight'

/**
 * The card's view of an installation. Before the controller has applied
 * anything (no installedVersion), the installation is only a request: it is
 * not "installed", has no UI to switch, and a pre-flight refusal is shown as
 * its own failed first step (the chart was never touched).
 */
export function installationView(i: Installation): InstallationView {
  const deployed = !!i.status.installedVersion
  const refused =
    !deployed && !i.deleting && (i.status.conditions ?? []).some((c) => c.type === 'PreflightPassed' && c.status === 'False')
  const phase = i.deleting ? 'Uninstalling' : (i.status.phase ?? 'Pending')
  const verb = i.spec.mode === 'install' ? 'install' : 'connect'
  const subtitle = `${deployed ? (verb === 'install' ? 'installed' : 'connected') : `${verb} requested`} · v${i.spec.version}`
  const steps = i.status.steps ?? []

  if (refused) {
    return {
      deployed,
      refused,
      label: 'Refused',
      tone: 'error',
      subtitle,
      steps: [
        { name: PREFLIGHT_STEP, title: 'Pre-flight check', state: 'Failed' },
        ...steps.map((s) => ({ ...s, state: 'Pending' as const, message: undefined })),
      ],
      fixCommand: /(hack\/capybara-sa\.sh [^;\n]+?)\s*$/.exec(i.status.message ?? '')?.[1],
    }
  }
  const tones: Record<string, Tone> = { Ready: 'success', Disabled: 'default', Error: 'error', Installing: 'info', Uninstalling: 'warning', Pending: 'default' }
  return { deployed, refused, label: phase, tone: tones[phase] ?? 'default', subtitle, steps }
}

/** The step index (1-based) NSteps should mark as current. */
export function currentStep(steps: StepStatus[]): number {
  const i = steps.findIndex((s) => s.state !== 'Done')
  return i === -1 ? steps.length + 1 : i + 1
}
