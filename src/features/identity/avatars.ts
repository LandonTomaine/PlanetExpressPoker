import { getThemeConfig } from '../theme/registry'
import type { ThemeAvatar, ThemeId } from '../theme/types'

export type AvatarOption = ThemeAvatar

export function getAvatarOptions(themeId: ThemeId) {
  return getThemeConfig(themeId).avatars
}

export const defaultAvatar = getAvatarOptions('futurama')[0]

export function getDefaultAvatar(themeId: ThemeId) {
  return getAvatarOptions(themeId)[0] ?? defaultAvatar
}

export function getAvatarOption(avatarKey: string, themeId: ThemeId) {
  return (
    getAvatarOptions(themeId).find(
      (avatarOption) => avatarOption.key === avatarKey
    ) ?? getDefaultAvatar(themeId)
  )
}

export function getAvatarPortraitClassName(
  avatarOption: AvatarOption,
  baseClassName = 'h-full w-full object-cover'
) {
  return [baseClassName, avatarOption.portraitClassName]
    .filter(Boolean)
    .join(' ')
}
