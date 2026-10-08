// Image pull problems of a TaskRun, from its status: a step or sidecar
// waiting with ErrImagePull, ImagePullBackOff, ErrImageNeverPull or
// InvalidImageName. Without this a run that cannot start looks Running
// until it times out. Pure, tested with node --test.

export interface ImagePullProblem {
  container: string
  image: string
  reason: string
  message: string
}

const pullReasons = new Set(['ErrImagePull', 'ImagePullBackOff', 'ErrImageNeverPull', 'InvalidImageName'])

interface StepState {
  name?: string
  container?: string
  waiting?: { reason?: string; message?: string }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function imagePullProblems(taskRun: { status?: any }): ImagePullProblem[] {
  const st = taskRun.status ?? {}
  const specSteps: { name?: string; image?: string }[] = st.taskSpec?.steps ?? []
  const specSidecars: { name?: string; image?: string }[] = st.taskSpec?.sidecars ?? []
  const out: ImagePullProblem[] = []
  const check = (states: StepState[] | undefined, spec: { name?: string; image?: string }[]) => {
    for (const s of states ?? []) {
      const reason = s.waiting?.reason ?? ''
      if (!pullReasons.has(reason)) continue
      const image = spec.find((x) => x.name === s.name)?.image ?? imageIn(s.waiting?.message) ?? '(unknown image)'
      out.push({ container: s.container ?? s.name ?? '', image, reason, message: s.waiting?.message ?? '' })
    }
  }
  check(st.steps, specSteps)
  check(st.sidecars, specSidecars)
  return out
}

// Kubelet messages name the image in quotes: Back-off pulling image "x".
function imageIn(message?: string): string | undefined {
  return message ? /image "([^"]+)"/.exec(message)?.[1] : undefined
}

/** A short, actionable explanation for a pull problem. */
export function explain(p: ImagePullProblem, cluster: string): string {
  if (p.reason === 'InvalidImageName') return `"${p.image}" is not a valid image name.`
  return `Image ${p.image} is not on ${cluster}, and the cluster could not pull it.`
}
