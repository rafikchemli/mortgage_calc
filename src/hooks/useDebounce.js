import { useState, useEffect, useRef, useCallback } from 'react'

export function useDebounce(value, delay = 150) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

/** Throttle a callback to fire at most once per animation frame. */
export function useRafCallback(fn) {
  const rafRef = useRef(null)
  const fnRef = useRef(fn)
  fnRef.current = fn

  const throttled = useCallback((...args) => {
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      fnRef.current(...args)
    })
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return throttled
}
