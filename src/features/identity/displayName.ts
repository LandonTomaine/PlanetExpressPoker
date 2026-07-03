export const maxDisplayNameLength = 30

export function normalizeDisplayName(displayName: string) {
  return displayName.trim().slice(0, maxDisplayNameLength)
}
