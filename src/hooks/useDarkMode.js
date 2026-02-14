import { useState, useEffect, useCallback } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('darkMode', isDark)
  }, [isDark])

  const toggle = useCallback(() => {
    const root = document.documentElement
    root.classList.add('theme-flipping')

    // Switch theme at midpoint (when rotated 90° = invisible)
    setTimeout(() => setIsDark((prev) => !prev), 225)

    // Remove animation class when done
    setTimeout(() => root.classList.remove('theme-flipping'), 500)
  }, [])

  return [isDark, toggle]
}
