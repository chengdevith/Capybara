import { describe, expect, it } from 'vitest'
import { expiresInDays, statusLabel, statusTone, type Cluster } from './clusters'

const c = (status: Cluster['status']): Cluster => ({ id: 'x', displayName: 'x', environment: 'dev', status })

describe('cluster status helpers', () => {
  it('labels and tones each phase', () => {
    expect([statusLabel(c({ phase: 'Connected', reason: 'Connected' })), statusTone(c({ phase: 'Connected', reason: 'Connected' }))]).toEqual(['Connected', 'success'])
    expect(statusTone(c({ phase: 'Connected', reason: 'PermissionsLimited' }))).toBe('warning')
    expect(statusLabel(c({ phase: 'Connected', reason: 'PermissionsLimited' }))).toBe('Connected (limited)')
    expect([statusLabel(c({ phase: 'Error', reason: 'Unreachable' })), statusTone(c({ phase: 'Error', reason: 'Unreachable' }))]).toEqual(['Unreachable', 'error'])
    expect([statusLabel(c({ phase: 'Pending' })), statusTone(c({ phase: 'Pending' }))]).toEqual(['Checking…', 'default'])
  })

  it('counts days until the credentials expire', () => {
    const now = Date.parse('2026-10-01T00:00:00Z')
    expect(expiresInDays(c({ phase: 'Connected', credentialsExpireAt: '2026-10-31T12:00:00Z' }), now)).toBe(30)
    expect(expiresInDays(c({ phase: 'Error', credentialsExpireAt: '2026-09-30T00:00:00Z' }), now)).toBe(-1)
    expect(expiresInDays(c({ phase: 'Connected' }), now)).toBeNull()
  })
})
