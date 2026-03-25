import { useRef, useEffect } from 'react'
import { useMotionValue, animate } from 'framer-motion'

/**
 * Animates a number using framer-motion MotionValues.
 * Updates the DOM directly via a ref — no React re-renders per frame.
 *
 * Returns { motionValue, ref } — attach ref to the DOM element whose
 * textContent should update, or use motionValue directly.
 */
export default function useAnimatedNumber(target, duration = 0.4) {
  const mv = useMotionValue(target)
  const prevTarget = useRef(target)

  useEffect(() => {
    if (prevTarget.current === target) return
    prevTarget.current = target

    const controls = animate(mv, target, {
      duration,
      ease: [0.16, 1, 0.3, 1], // expo-out — compositor-friendly tween
    })

    return () => controls.stop()
  }, [target, duration, mv])

  return mv
}
