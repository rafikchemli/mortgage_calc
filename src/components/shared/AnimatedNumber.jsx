import { useRef, useEffect } from 'react'
import useAnimatedNumber from '../../hooks/useAnimatedNumber'
import { formatCAD } from './CurrencyDisplay'

/**
 * Renders an animated number that updates the DOM directly via MotionValue
 * — zero React re-renders during animation.
 */
export default function AnimatedNumber({ value, format, className }) {
  const ref = useRef(null)
  const mv = useAnimatedNumber(value)

  // Write formatted text straight to the DOM on every motion frame
  useEffect(() => {
    const fmt = format || ((v) => formatCAD(Math.round(v)))

    // Set initial value
    if (ref.current) ref.current.textContent = fmt(mv.get())

    const unsub = mv.on('change', (latest) => {
      if (ref.current) ref.current.textContent = fmt(latest)
    })

    return unsub
  }, [mv, format])

  return <span ref={ref} className={className} />
}
