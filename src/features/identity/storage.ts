import { defaultAvatar } from './avatars'

const identityStorageKey = 'pep.identity.v1'
const activeRoomStorageKey = 'pep.active-room.v1'
const roomNamePrefillStorageKey = 'pep.room-name-prefill.v1'

export type StoredIdentity = {
  clientId: string
  displayName: string
  avatarKey: string
}

function isBrowser() {
  return typeof window !== 'undefined'
}

export function createClientId() {
  return crypto.randomUUID()
}

export function readStoredIdentity(): StoredIdentity {
  if (!isBrowser()) {
    return {
      clientId: createClientId(),
      displayName: '',
      avatarKey: defaultAvatar.key,
    }
  }

  try {
    const rawValue = window.localStorage.getItem(identityStorageKey)

    if (!rawValue) {
      return {
        clientId: createClientId(),
        displayName: '',
        avatarKey: defaultAvatar.key,
      }
    }

    const parsedValue = JSON.parse(rawValue) as Partial<StoredIdentity>

    return {
      clientId:
        typeof parsedValue.clientId === 'string' && parsedValue.clientId.trim()
          ? parsedValue.clientId
          : createClientId(),
      displayName:
        typeof parsedValue.displayName === 'string'
          ? parsedValue.displayName
          : '',
      avatarKey:
        typeof parsedValue.avatarKey === 'string' &&
        parsedValue.avatarKey.trim()
          ? parsedValue.avatarKey
          : defaultAvatar.key,
    }
  } catch {
    return {
      clientId: createClientId(),
      displayName: '',
      avatarKey: defaultAvatar.key,
    }
  }
}

export function saveStoredIdentity(identity: StoredIdentity) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(identityStorageKey, JSON.stringify(identity))
}

export function readActiveRoomName() {
  if (!isBrowser()) {
    return null
  }

  return window.sessionStorage.getItem(activeRoomStorageKey)
}

export function saveActiveRoomName(roomName: string) {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.setItem(activeRoomStorageKey, roomName)
}

export function clearActiveRoomName() {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.removeItem(activeRoomStorageKey)
}

export function readRoomNamePrefill() {
  if (!isBrowser()) {
    return null
  }

  return window.sessionStorage.getItem(roomNamePrefillStorageKey)
}

export function saveRoomNamePrefill(roomName: string) {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.setItem(roomNamePrefillStorageKey, roomName)
}

export function clearRoomNamePrefill() {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.removeItem(roomNamePrefillStorageKey)
}
