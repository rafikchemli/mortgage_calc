import { useState, useEffect, useCallback, useRef } from 'react'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const didMount = useRef(false)
  useEffect(() => {
    if (!didMount.current) {
      document.documentElement.classList.toggle('dark', isDark)
      didMount.current = true
    }
  }, [isDark])

  const toggle = useCallback((e) => {
    const goingDark = !isDark

    // Get click origin for circular reveal
    let x, y
    if (e?.currentTarget) {
      const rect = e.currentTarget.getBoundingClientRect()
      x = rect.left + rect.width / 2
      y = rect.top + rect.height / 2
    } else {
      x = window.innerWidth - 30
      y = 30
    }

    // Try View Transitions API (Telegram-style circular reveal)
    if (document.startViewTransition) {
      document.documentElement.style.setProperty('--reveal-x', `${x}px`)
      document.documentElement.style.setProperty('--reveal-y', `${y}px`)

      const transition = document.startViewTransition(() => {
        document.documentElement.classList.toggle('dark', goingDark)
        localStorage.setItem('darkMode', String(goingDark))
        setIsDark(goingDark)
      })

      transition.ready.then(() => {
        const maxRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        )

        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${maxRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: 'ease-in-out',
            pseudoElement: '::view-transition-new(root)',
          }
        )
      })
    } else {
      // Fallback: simple transition
      document.documentElement.classList.add('theme-transition')
      document.documentElement.classList.toggle('dark', goingDark)
      localStorage.setItem('darkMode', String(goingDark))
      setIsDark(goingDark)
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition')
      }, 400)
    }
  }, [isDark])

  return { isDark, toggle }
}
