import { useEffect, useRef, useState } from 'react'

// ── Shared RAF scheduler ─────────────────
const subscribers = new Set()
let rafId = null

function loop(now) {
  for (const fn of subscribers) fn(now)
  if (subscribers.size > 0) {
    rafId = requestAnimationFrame(loop)
  } else {
    rafId = null
  }
}

function subscribe(fn) {
  subscribers.add(fn)
  if (rafId === null) rafId = requestAnimationFrame(loop)
  return () => {
    subscribers.delete(fn)
    if (subscribers.size === 0 && rafId !== null) {
      cancelAnimationFrame(rafId)
      rafId = null
    }
  }
}

// ── Hook ─────────────────────────────────
export default function useAnimatedNumber(target, duration = 400) {
  const [display, setDisplay] = useState(target)
  const fromRef = useRef(target)
  const currentRef = useRef(target) // tracks the latest animated value (no stale closure)
  const startTimeRef = useRef(null)
  const targetRef = useRef(target)

  useEffect(() => {
    if (targetRef.current === target) return

    fromRef.current = currentRef.current // always use the latest animated position
    targetRef.current = target
    startTimeRef.current = performance.now()

    const tick = (now) => {
      const start = startTimeRef.current
      if (start === null) return

      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const value = fromRef.current + (targetRef.current - fromRef.current) * eased
      currentRef.current = value
      setDisplay(value)

      if (t >= 1) {
        startTimeRef.current = null
        unsubscribe()
      }
    }

    const unsubscribe = subscribe(tick)
    return unsubscribe
  }, [target, duration])

  return display
}
