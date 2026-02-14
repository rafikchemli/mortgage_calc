const formatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 0,
})

const formatterCents = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
  maximumFractionDigits: 2,
})

export function formatCAD(value, showCents = false) {
  return showCents ? formatterCents.format(value) : formatter.format(value)
}

export function formatPercent(value) {
  return `${value}%`
}

export function formatCADShort(value) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
  if (value >= 1000) return `$${Math.round(value / 1000)}K`
  return `$${value}`
}

export default function CurrencyDisplay({ value, className = '', size = 'md' }) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-lg font-semibold',
    lg: 'text-2xl font-bold',
    xl: 'text-3xl font-bold',
  }

  return (
    <span className={`${sizes[size]} text-gray-900 dark:text-white ${className}`}>
      {formatCAD(value)}
    </span>
  )
}
