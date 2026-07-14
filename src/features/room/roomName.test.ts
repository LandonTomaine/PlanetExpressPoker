import { describe, expect, it } from 'vitest'
import {
  getRoomNameError,
  maxRoomNameLength,
  normalizeRoomName,
} from './roomName'

describe('room names', () => {
  it('trims room names before use', () => {
    expect(normalizeRoomName('  planet_express-1  ')).toBe('planet_express-1')
  })

  it('requires a non-empty room name', () => {
    expect(getRoomNameError('   ')).toBe('Room name is required.')
  })

  it('explains that room names cannot include spaces', () => {
    expect(getRoomNameError('planet express')).toBe(
      'Room names cannot include spaces. Use hyphens or underscores instead.'
    )
  })

  it('allows only letters, numbers, hyphen, and underscore', () => {
    expect(getRoomNameError('planet+express')).toBe(
      'Use letters, numbers, hyphen, or underscore only.'
    )
    expect(getRoomNameError('planet_express-1')).toBeNull()
  })

  it('limits room names to the documented maximum length', () => {
    expect(getRoomNameError('a'.repeat(maxRoomNameLength + 1))).toBe(
      `Room names can be up to ${maxRoomNameLength} characters.`
    )
  })
})
