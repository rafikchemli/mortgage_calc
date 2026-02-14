const SEGMENTS = [
  { label: 'Conservative', maxAngle: 72, color: 'var(--s-teal)' },
  { label: 'Moderate', maxAngle: 48, color: 'var(--s-gold)' },
  { label: 'Stretched', maxAngle: 48, color: 'var(--s-copper)' },
  { label: 'Risky', maxAngle: 12, color: '#F87171' },
]

export default function AffordGauge({ housingPercent }) {
  const clamped = Math.min(60, Math.max(25, housingPercent))
  const needleAngle = ((clamped - 25) / 35) * 180

  const cx = 120
  const cy = 110
  const r = 90

  let startAngle = 180
  const arcs = SEGMENTS.map((seg) => {
    const start = startAngle
    const end = startAngle - seg.maxAngle
    startAngle = end
    return { ...seg, start, end }
  })

  function polarToCart(angleDeg, radius) {
    const rad = (angleDeg * Math.PI) / 180
    return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) }
  }

  function describeArc(startDeg, endDeg, radius) {
    const s = polarToCart(startDeg, radius)
    const e = polarToCart(endDeg, radius)
    const largeArc = Math.abs(startDeg - endDeg) > 180 ? 1 : 0
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 0 ${e.x} ${e.y}`
  }

  const needleDeg = 180 - needleAngle
  const needleTip = polarToCart(needleDeg, r - 10)

  const label = housingPercent < 30 ? 'Conservative'
    : housingPercent < 40 ? 'Moderate'
    : housingPercent < 50 ? 'Stretched' : 'Risky'

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 240 152" className="w-full" role="img" aria-label={`Affordability gauge: ${housingPercent}% — ${label}`}>
        <defs>
          <filter id="needle-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {arcs.map((arc, i) => (
          <path
            key={i}
            d={describeArc(arc.start, arc.end, r)}
            fill="none"
            stroke={arc.color}
            strokeWidth={10}
            strokeLinecap="round"
            opacity={0.8}
          />
        ))}

        <line
          x1={cx}
          y1={cy}
          x2={needleTip.x}
          y2={needleTip.y}
          stroke="var(--s-gold)"
          strokeWidth={2}
          strokeLinecap="round"
          filter="url(#needle-glow)"
        />
        <circle cx={cx} cy={cy} r={4} fill="var(--s-gold)" />

        <text x={15} y={122} fill="var(--s-text-tertiary)" fontSize="8" textAnchor="start">25%</text>
        <text x={225} y={122} fill="var(--s-text-tertiary)" fontSize="8" textAnchor="end">60%</text>

        <text
          x={cx}
          y={cy + 26}
          textAnchor="middle"
          fill="var(--s-gold)"
          fontSize="15"
          fontWeight="700"
          style={{ fontFamily: "'Outfit', system-ui, sans-serif" }}
        >
          {housingPercent}%
        </text>

        <text
          x={cx}
          y={cy + 40}
          textAnchor="middle"
          fill="var(--s-text-tertiary)"
          fontSize="9"
        >
          {label}
        </text>
      </svg>
    </div>
  )
}
