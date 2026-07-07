import { defaultAvatar } from './avatars'
import { defaultThemeId, getThemeConfig } from '../theme/registry'
import type { ThemeId } from '../theme/types'

const identityStorageKey = 'pep.identity.v1'
const activeRoomStorageKey = 'pep.active-room.v1'
const roomNamePrefillStorageKey = 'pep.room-name-prefill.v1'
const themeStorageKey = 'pep.theme.v1'
const roomThemePrefillStorageKey = 'pep.room-theme-prefill.v1'

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

export function readStoredThemeId(): ThemeId | null {
  if (!isBrowser()) {
    return defaultThemeId
  }

  const rawValue = window.localStorage.getItem(themeStorageKey)

  if (!rawValue) {
    return null
  }

  return getThemeConfig(rawValue).id
}

export function saveStoredThemeId(themeId: ThemeId) {
  if (!isBrowser()) {
    return
  }

  window.localStorage.setItem(themeStorageKey, themeId)
}

export function readRoomThemePrefill(): ThemeId | null {
  if (!isBrowser()) {
    return null
  }

  const rawValue = window.sessionStorage.getItem(roomThemePrefillStorageKey)

  if (!rawValue) {
    return null
  }

  return getThemeConfig(rawValue).id
}

export function saveRoomThemePrefill(themeId: ThemeId) {
  if (!isBrowser()) {
    return
  }

  window.sessionStorage.setItem(roomThemePrefillStorageKey, themeId)
}
