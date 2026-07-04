import { describe, expect, it } from 'vitest'
import { maxDisplayNameLength, normalizeDisplayName } from './displayName'

describe('normalizeDisplayName', () => {
  it('trims whitespace', () => {
    expect(normalizeDisplayName('  Leela  ')).toBe('Leela')
  })

  it('limits names to the documented maximum length', () => {
    expect(
      normalizeDisplayName('a'.repeat(maxDisplayNameLength + 10))
    ).toHaveLength(maxDisplayNameLength)
  })
})
