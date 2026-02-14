import { useEffect, useRef, useState } from 'react'

export default function useAnimatedNumber(target, duration = 400) {
  const [display, setDisplay] = useState(target)
  const rafRef = useRef(null)
  const startRef = useRef(target)
  const startTimeRef = useRef(null)

  useEffect(() => {
    const from = display
    if (from === target) return

    startRef.current = from
    startTimeRef.current = performance.now()

    function tick(now) {
      const elapsed = now - startTimeRef.current
      const t = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3)
      const current = from + (target - from) * eased

      setDisplay(current)

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [target, duration])

  return display
}
