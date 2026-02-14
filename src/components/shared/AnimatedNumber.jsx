import useAnimatedNumber from '../../hooks/useAnimatedNumber'
import { formatCAD } from './CurrencyDisplay'

export default function AnimatedNumber({ value, format, className }) {
  const animated = useAnimatedNumber(value)
  const formatted = format ? format(animated) : formatCAD(Math.round(animated))
  return <span className={className}>{formatted}</span>
}
