import { NTag } from 'naive-ui'
import { h, type VNodeChild } from 'vue'
import type { Tone } from './types'

export function statusTag(text: string, tone: Tone): VNodeChild {
  return h(NTag, { type: tone, size: 'small', bordered: false }, () => text)
}

export function labelTags(labels: Record<string, string> | undefined): VNodeChild {
  const entries = Object.entries(labels ?? {})
  if (entries.length === 0) return '—'
  return h(
    'div',
    { class: 'capy-tags' },
    entries.map(([k, v]) => h(NTag, { size: 'small', key: k }, () => `${k}=${v}`)),
  )
}

export const dash = (v: unknown): string => (v === undefined || v === null || v === '' ? '—' : String(v))
