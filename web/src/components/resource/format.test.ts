import { describe, expect, it } from 'vitest'
import { age, formatLabels } from './format'

describe('age', () => {
  const now = Date.parse('2026-01-10T00:00:00Z')
  it.each([
    ['2026-01-09T23:59:15Z', '45s'],
    ['2026-01-09T23:48:00Z', '12m'],
    ['2026-01-09T21:00:00Z', '3h'],
    ['2026-01-05T00:00:00Z', '5d'],
    ['2024-01-01T00:00:00Z', '2y'],
    ['2026-01-10T00:00:05Z', '0s'],
  ])('%s -> %s', (ts, want) => expect(age(ts, now)).toBe(want))

  it('handles missing timestamps', () => expect(age(undefined, now)).toBe('—'))
})

describe('formatLabels', () => {
  it('joins key=value pairs', () => expect(formatLabels({ app: 'web', tier: 'fe' })).toBe('app=web, tier=fe'))
  it('handles none', () => expect(formatLabels(undefined)).toBe(''))
})
