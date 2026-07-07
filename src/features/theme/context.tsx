import { useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { readStoredThemeId, saveStoredThemeId } from '../identity/storage'
import { defaultThemeId, getThemeConfig, getThemeCssVars } from './registry'
import { ThemeContext, type ThemeContextValue } from './themeContext'
import type { ThemeId } from './types'

export function ThemeProvider({ children }: PropsWithChildren) {
  const [personalThemeId, setPersonalThemeIdState] = useState<ThemeId>(
    () => readStoredThemeId() ?? defaultThemeId
  )
  const [roomThemeOverride, setRoomThemeOverride] = useState<ThemeId | null>(
    null
  )

  const activeThemeId = roomThemeOverride ?? personalThemeId
  const activeTheme = getThemeConfig(activeThemeId)
  const personalTheme = getThemeConfig(personalThemeId)
  const cssVars = getThemeCssVars(activeThemeId)

  useEffect(() => {
    saveStoredThemeId(personalThemeId)
  }, [personalThemeId])

  useEffect(() => {
    document.title = activeTheme.appTitle
    document
      .querySelector('link[rel="icon"]')
      ?.setAttribute('href', activeTheme.faviconPath)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', activeTheme.palette.bg)
  }, [activeTheme])

  const value = useMemo<ThemeContextValue>(
    () => ({
      activeTheme,
      activeThemeId,
      cssVars,
      personalTheme,
      personalThemeId,
      setPersonalThemeId: setPersonalThemeIdState,
      setRoomThemeOverride,
    }),
    [activeTheme, activeThemeId, cssVars, personalTheme, personalThemeId]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
