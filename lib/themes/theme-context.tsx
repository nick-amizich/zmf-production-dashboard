'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Theme, ThemeName, themes, applyTheme } from './themes'

interface ThemeContextType {
  theme: Theme
  themeName: ThemeName
  setTheme: (name: ThemeName) => void
  availableThemes: typeof themes
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: ThemeName
  storageKey?: string
}

export function ZMFThemeProvider({ 
  children, 
  defaultTheme = 'zmf',
  storageKey = 'zmf-theme'
}: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    // Check localStorage for saved theme
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey) as ThemeName
      if (saved && themes[saved]) {
        return saved
      }
    }
    return defaultTheme
  })

  const theme = themes[themeName]

  useEffect(() => {
    // Apply theme on mount and changes
    applyTheme(theme)
    // Save to localStorage
    localStorage.setItem(storageKey, themeName)
  }, [theme, themeName, storageKey])

  const setTheme = (name: ThemeName) => {
    if (themes[name]) {
      setThemeName(name)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, availableThemes: themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}