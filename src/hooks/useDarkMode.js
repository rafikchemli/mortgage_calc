import { useState, useEffect, useCallback, useRef } from 'react'
import { useAnimation } from 'framer-motion'

const nextFrame = () => new Promise((r) => requestAnimationFrame(r))

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    const stored = localStorage.getItem('darkMode')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [overlayColor, setOverlayColor] = useState('#0E0C15')
  const controls = useAnimation()
  const locked = useRef(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('darkMode', isDark)
  }, [isDark])

  const toggle = useCallback(async () => {
    if (locked.current) return
    locked.current = true

    const goingDark = !isDark
    setOverlayColor(goingDark ? '#0E0C15' : '#F5F2ED')

    // Wipe in
    await controls.set({ scaleX: 0, transformOrigin: '0% 50%' })
    await controls.start({
      scaleX: 1,
      transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
    })

    // Switch theme directly on DOM (avoids React re-render during animation)
    document.documentElement.classList.toggle('dark', goingDark)
    localStorage.setItem('darkMode', String(goingDark))

    // Let browser paint the new theme before revealing
    await nextFrame()

    // Wipe out
    await controls.set({ transformOrigin: '100% 50%' })
    await controls.start({
      scaleX: 0,
      transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] },
    })

    // Sync React state (DOM already updated, this is silent)
    setIsDark(goingDark)
    locked.current = false
  }, [isDark, controls])

  return { isDark, toggle, wipeControls: controls, overlayColor }
}
