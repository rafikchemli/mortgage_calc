import { useEffect, useRef, useState } from 'react'

// ── Shared RAF scheduler ─────────────────
// All animated numbers share a single requestAnimationFrame loop
// instead of each running their own. On the Results page with 10+
// numbers, this reduces RAF callbacks from 10+ to 1 per frame.
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
  const startTimeRef = useRef(null)
  const targetRef = useRef(target)

  useEffect(() => {
    if (targetRef.current === target) return

    fromRef.current = display
    targetRef.current = target
    startTimeRef.current = performance.now()

    const tick = (now) => {
      const start = startTimeRef.current
      if (start === null) return

      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(fromRef.current + (targetRef.current - fromRef.current) * eased)

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
