import { NTag, NTooltip } from 'naive-ui'
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

/**
 * Labels for a table cell: the first `max` as compact chips, the rest as a
 * "+N" chip whose tooltip lists them all. Keeps rows one or two lines high.
 */
export function labelChips(labels: Record<string, string> | undefined, max = 2): VNodeChild {
  const entries = Object.entries(labels ?? {})
  if (entries.length === 0) return '—'
  const chip = (k: string, v: string) =>
    h(NTag, { size: 'small', key: k, bordered: false, class: 'capy-chip', title: `${k}=${v}` }, () => `${k}=${v}`)
  const shown = entries.slice(0, max).map(([k, v]) => chip(k, v))
  const rest = entries.length - max
  if (rest > 0) {
    shown.push(
      h(NTooltip, { key: '+more' }, {
        trigger: () => h(NTag, { size: 'small', bordered: false, class: 'capy-chip-more' }, () => `+${rest}`),
        default: () => h('div', { class: 'capy-label-list' }, entries.map(([k, v]) => h('div', { key: k }, `${k}=${v}`))),
      }),
    )
  }
  return h('div', { class: 'capy-tags capy-tags-compact' }, shown)
}

export const dash = (v: unknown): string => (v === undefined || v === null || v === '' ? '—' : String(v))
