'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'amber' | 'pink'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'amber',
  toggle: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('amber')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved === 'pink' || saved === 'amber') {
      setTheme(saved)
      document.documentElement.dataset.theme = saved === 'pink' ? 'pink' : ''
    }
  }, [])

  function toggle() {
    const next: Theme = theme === 'amber' ? 'pink' : 'amber'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.dataset.theme = next === 'pink' ? 'pink' : ''
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
