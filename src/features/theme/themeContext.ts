import { createContext } from 'react'
import { getThemeCssVars } from './registry'
import type { Appearance, ThemeConfig, ThemeId } from './types'

export type ThemeContextValue = {
  activeTheme: ThemeConfig
  activeThemeId: ThemeId
  appearance: Appearance
  cssVars: ReturnType<typeof getThemeCssVars>
  personalTheme: ThemeConfig
  personalThemeId: ThemeId
  setPersonalThemeId: (themeId: ThemeId) => void
  setAppearance: (appearance: Appearance) => void
  setRoomThemeOverride: (themeId: ThemeId | null) => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
