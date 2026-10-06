import type { Project } from '@/api/projects'
import type { Tone } from '@/components/resource/types'

export function phaseTone(p: Project): Tone {
  switch (p.status?.phase) {
    case 'Ready':
      return 'success'
    case 'Error':
      return 'error'
    case 'Terminating':
      return 'warning'
    default:
      return 'default'
  }
}

/** Projects are protected-namespace aware in the form, mirroring the server's globs. */
export function matchesGlob(pattern: string, name: string): boolean {
  const re = new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.')}$`)
  return re.test(name)
}
