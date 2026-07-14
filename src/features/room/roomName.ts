export const maxRoomNameLength = 75

export const roomNameInputPattern = '[A-Za-z0-9_-]*'

const roomNamePattern = /^[A-Za-z0-9_-]+$/

export function normalizeRoomName(roomName: string) {
  return roomName.trim()
}

export function getRoomNameError(roomName: string) {
  const normalizedRoomName = normalizeRoomName(roomName)

  if (!normalizedRoomName) {
    return 'Room name is required.'
  }

  if (normalizedRoomName.length > maxRoomNameLength) {
    return `Room names can be up to ${maxRoomNameLength} characters.`
  }

  if (/\s/.test(normalizedRoomName)) {
    return 'Room names cannot include spaces. Use hyphens or underscores instead.'
  }

  if (!roomNamePattern.test(normalizedRoomName)) {
    return 'Use letters, numbers, hyphen, or underscore only.'
  }

  return null
}
