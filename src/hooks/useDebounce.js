import { useState, useEffect, useRef, useCallback } from 'react'

export function useDebounce(value, delay = 150) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

/** Throttle a callback to fire at most once per animation frame.
 *  Always dispatches the most recent args — never drops the final value. */
export function useRafCallback(fn) {
  const rafRef = useRef(null)
  const fnRef = useRef(fn)
  const latestArgsRef = useRef(null)
  fnRef.current = fn

  const throttled = useCallback((...args) => {
    latestArgsRef.current = args
    if (rafRef.current !== null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      fnRef.current(...latestArgsRef.current)
    })
  }, [])

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return throttled
}
