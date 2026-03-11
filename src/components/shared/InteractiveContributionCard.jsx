import AnimatedNumber from './AnimatedNumber'

export default function InteractiveContributionCard({ label, amount, percent, onPercentChange }) {
  const color = percent <= 35 ? 'var(--s-teal)' : percent <= 40 ? 'var(--s-gold)' : '#F87171'
  const r = 26
  const circumference = 2 * Math.PI * r
  const progress = Math.min(percent, 60) / 60
  const offset = circumference * (1 - progress)

  return (
    <div className="bg-ink-ghost rounded-lg px-4 py-3 border border-ink-ghost overflow-hidden flex items-center gap-4">
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onPercentChange(Math.max(25, percent - 1))}
          disabled={percent <= 25}
          className="size-10 rounded-lg bg-surface text-ink-muted hover:text-ink active:scale-95 active:bg-surface-3 text-base font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`Decrease ${label} housing %`}
        >
          -
        </button>
        <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
          <circle cx="32" cy="32" r={r} fill="none" stroke="var(--s-border)" strokeWidth="4" />
          <circle
            cx="32" cy="32" r={r} fill="none"
            stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 32 32)"
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
          <text x="32" y="34" textAnchor="middle" fill={color} fontSize="13" fontWeight="700" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {percent}%
          </text>
        </svg>
        <button
          onClick={() => onPercentChange(Math.min(60, percent + 1))}
          disabled={percent >= 60}
          className="size-10 rounded-lg bg-surface text-ink-muted hover:text-ink active:scale-95 active:bg-surface-3 text-base font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`Increase ${label} housing %`}
        >
          +
        </button>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-ink-faint uppercase tracking-wider">{label}</p>
        <p className="display-number text-2xl mt-0.5 whitespace-nowrap"><AnimatedNumber value={amount} /><span className="text-[10px] text-ink-faint font-normal">/mo</span></p>
      </div>
    </div>
  )
}
