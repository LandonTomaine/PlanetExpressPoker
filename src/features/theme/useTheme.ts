import { useContext } from 'react'
import { ThemeContext } from './themeContext'

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('Theme context is unavailable.')
  }

  return context
}
