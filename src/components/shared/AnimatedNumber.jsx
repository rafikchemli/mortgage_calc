import { memo, useRef, useEffect } from 'react'
import useAnimatedNumber from '../../hooks/useAnimatedNumber'
import { formatCAD } from './CurrencyDisplay'

export default memo(function AnimatedNumber({ value, format, className }) {
  const ref = useRef(null)
  const mv = useAnimatedNumber(value)
  const fmt = format || ((v) => formatCAD(Math.round(v)))

  useEffect(() => {
    if (ref.current) ref.current.textContent = fmt(mv.get())
    const unsub = mv.on('change', (v) => {
      if (ref.current) ref.current.textContent = fmt(v)
    })
    return unsub
  }, [mv, fmt])

  return <span ref={ref} className={className} />
})
