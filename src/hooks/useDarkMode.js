import { useState, useEffect, useCallback, useRef } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Sync on mount only (not on toggle — toggle handles DOM directly)
  const didMount = useRef(false)
  useEffect(() => {
    if (!didMount.current) {
      document.documentElement.classList.toggle('dark', isDark)
      didMount.current = true
    }
  }, [isDark])

  const toggle = useCallback(() => {
    const goingDark = !isDark

    // 1. Enable transitions BEFORE the class change
    document.documentElement.classList.add('theme-transition')

    // 2. Toggle .dark synchronously in the same frame
    document.documentElement.classList.toggle('dark', goingDark)
    localStorage.setItem('darkMode', String(goingDark))

    // 3. Sync React state (silent — DOM already updated)
    setIsDark(goingDark)

    // 4. Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition')
    }, 650)
  }, [isDark])

  return { isDark, toggle }
}
