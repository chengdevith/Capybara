import { describe, expect, it } from 'vitest'
import { exceeds, parseQuantity } from './quantity'

describe('quantities', () => {
  it.each([
    ['500m', 0.5],
    ['2', 2],
    ['1.5', 1.5],
    ['128Mi', 128 * 2 ** 20],
    ['2Gi', 2 * 2 ** 30],
    ['1k', 1000],
    ['1e3', 1000],
  ])('%s', (q, n) => expect(parseQuantity(q)).toBeCloseTo(n))

  it('rejects junk', () => expect(parseQuantity('lots')).toBeNull())

  it('compares across units', () => {
    expect(exceeds('3Gi', '2Gi')).toBe(true)
    expect(exceeds('1500m', '2')).toBe(false)
    expect(exceeds('2049Mi', '2Gi')).toBe(true)
    expect(exceeds(undefined, '1')).toBe(false)
  })
})
