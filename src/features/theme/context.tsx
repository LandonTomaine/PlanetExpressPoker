import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import {
  readStoredAppearance,
  readStoredThemeId,
  saveStoredAppearance,
  saveStoredThemeId,
} from '../identity/storage'
import { defaultThemeId, getThemeConfig, getThemeCssVars } from './registry'
import { ThemeContext, type ThemeContextValue } from './themeContext'
import type { Appearance, ThemeId } from './types'

export function ThemeProvider({ children }: PropsWithChildren) {
  const [personalThemeId, setPersonalThemeIdState] = useState<ThemeId>(
    () => readStoredThemeId() ?? defaultThemeId
  )
  const [appearance, setAppearanceState] = useState<Appearance>(
    () => readStoredAppearance() ?? 'light'
  )
  const [roomThemeOverride, setRoomThemeOverride] = useState<ThemeId | null>(
    null
  )

  const activeThemeId = roomThemeOverride ?? personalThemeId
  const activeTheme = getThemeConfig(activeThemeId)
  const personalTheme = getThemeConfig(personalThemeId)
  const cssVars = getThemeCssVars(activeThemeId, appearance)

  useEffect(() => {
    saveStoredThemeId(personalThemeId)
  }, [personalThemeId])

  useEffect(() => {
    saveStoredAppearance(appearance)
    document.documentElement.dataset.pepAppearance = appearance
    document.documentElement.style.colorScheme = appearance
  }, [appearance])

  useEffect(() => {
    document.title = activeTheme.appTitle
    document
      .querySelector('link[rel="icon"]')
      ?.setAttribute('href', activeTheme.faviconPath)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        'content',
        appearance === 'dark'
          ? activeTheme.palette.dark.bg
          : activeTheme.palette.bg
      )
  }, [activeTheme, appearance])

  const value = useMemo<ThemeContextValue>(
    () => ({
      activeTheme,
      activeThemeId,
      appearance,
      cssVars,
      personalTheme,
      personalThemeId,
      setPersonalThemeId: setPersonalThemeIdState,
      setAppearance: setAppearanceState,
      setRoomThemeOverride,
    }),
    [
      activeTheme,
      activeThemeId,
      appearance,
      cssVars,
      personalTheme,
      personalThemeId,
    ]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
