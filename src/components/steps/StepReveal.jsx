import { useRef, useEffect } from 'react'
import { useMotionValue, animate } from 'framer-motion'
import { useComputedAfford } from '../../hooks/useComputedAfford'
import { formatCAD } from '../shared/CurrencyDisplay'

/* ── Animated counter — MotionValue, zero re-renders ─── */
function AnimatedCounter({ target, duration = 1.5, delay = 0.6, prefix = '' }) {
  const ref = useRef(null)
  const mv = useMotionValue(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      const controls = animate(mv, target, {
        duration,
        ease: [0.16, 1, 0.3, 1],
      })
      return () => controls.stop()
    }, delay * 1000)
    return () => clearTimeout(timer)
  }, [target, duration, delay, mv])

  useEffect(() => {
    if (ref.current) ref.current.textContent = `${prefix}${formatCAD(0)}`
    const unsub = mv.on('change', (v) => {
      if (ref.current) ref.current.textContent = `${prefix}${formatCAD(Math.round(v))}`
    })
    return unsub
  }, [mv, prefix])

  return <span ref={ref} />
}

/* ── Cost breakdown mini-bar ────────────── */
function CostMiniBar({ items, total }) {
  const colors = [
    'var(--s-gold)',
    'var(--s-teal)',
    'var(--s-copper)',
    'var(--s-teal)',
    'var(--s-slate)',
  ]

  return (
    <div className="mt-6 space-y-2">
      {/* Stacked bar */}
      <div className="flex h-2 rounded-full overflow-hidden" style={{ background: 'var(--s-surface-3)' }}>
        {items.map((item, i) => (
          <div
            key={item.name}
            className="bar-animate"
            style={{
              width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
              background: colors[i % colors.length],
              animationDelay: `${1.6 + i * 0.08}s`,
            }}
          />
        ))}
      </div>
      {/* Top 3 legend */}
      <div className="flex justify-center gap-4">
        {items.slice(0, 3).map((item, i) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: colors[i] }} />
            <span className="text-[10px] text-ink-faint">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Main reveal ───────────────────────────── */
export default function StepReveal({ onNext, onBack }) {
  const {
    maxPrice, costBreakdown, housingPercent, housingBudgetPercent,
    savingsCovered, savings, cashNeeded, downPaymentAmount,
  } = useComputedAfford()

  const housingColor = housingPercent < 30 ? 'var(--s-teal)'
    : housingPercent < 40 ? 'var(--s-gold)'
    : housingPercent < 50 ? 'var(--s-copper)'
    : 'var(--s-danger)'

  return (
    <div className="text-center">
      {/* Label */}
      <p className="reveal-label text-[11px] uppercase text-ink-faint mb-5 tracking-[0.2em]">
        You can afford up to
      </p>

      {/* Hero price */}
      <div className="reveal-price">
        <p
          className="text-6xl sm:text-8xl font-bold tracking-tighter leading-none"
          style={{ color: 'var(--s-gold)', fontFamily: 'var(--font-display)', textShadow: 'var(--s-gold-shadow)' }}
        >
          <AnimatedCounter target={maxPrice} />
        </p>
      </div>

      {/* Monthly cost + bar */}
      <div className="reveal-detail mt-8">
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--s-text-secondary)' }} className="text-xl">
          <AnimatedCounter target={costBreakdown.total} duration={1} delay={1.4} />
          <span className="text-sm text-ink-faint ml-1">/mo</span>
        </p>
        <CostMiniBar items={costBreakdown.items} total={costBreakdown.total} />
      </div>

      {/* Stats row */}
      <div className="reveal-stats mt-6 grid grid-cols-2 gap-3">
        <div
          className="rounded-xl py-3 px-4 text-left"
          style={{ background: 'var(--s-surface-2)', border: '1px solid var(--s-border)' }}
        >
          <p className="text-[10px] uppercase tracking-widest text-ink-faint mb-0.5">Of take-home pay</p>
          <p className="text-lg font-bold tabular-nums" style={{ color: housingColor, fontFamily: 'var(--font-display)' }}>
            {housingBudgetPercent}%
          </p>
          <p className="text-[10px] text-ink-faint">
            <a
              href="https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance/calculating-gds-tds"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-ink-muted transition-colors"
            >
              CMHC uses 39% gross
            </a>
          </p>
        </div>
        <div
          className="rounded-xl py-3 px-4 text-left"
          style={{ background: 'var(--s-surface-2)', border: '1px solid var(--s-border)' }}
        >
          <p className="text-[10px] uppercase tracking-widest text-ink-faint mb-0.5">Down payment</p>
          <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--s-text-primary)', fontFamily: 'var(--font-display)' }}>
            {formatCAD(downPaymentAmount)}
          </p>
          <p className="text-[10px] text-ink-faint">
            Cash needed to close
          </p>
        </div>
      </div>

      {/* Savings badge */}
      <div className="reveal-badge mt-5">
        <span
          className="inline-flex items-center gap-1.5 py-2 px-4 rounded-full text-[12px] font-medium"
          style={{
            background: savingsCovered
              ? 'color-mix(in srgb, var(--s-teal) 10%, transparent)'
              : 'color-mix(in srgb, var(--s-danger) 10%, transparent)',
            color: savingsCovered ? 'var(--s-teal)' : 'var(--s-danger)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            {savingsCovered
              ? <path d="M20 6L9 17l-5-5" />
              : <><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></>
            }
          </svg>
          {savingsCovered
            ? 'Savings cover closing costs'
            : `Need ${formatCAD(cashNeeded - savings)} more to close`
          }
        </span>
      </div>

      {/* Navigation */}
      <div className="reveal-nav flex flex-col gap-3 mt-10">
        <button
          onClick={onNext}
          className="w-full py-3.5 rounded-xl text-[14px] font-semibold tracking-wide transition-all active:scale-[0.98]"
          style={{ background: 'var(--s-text-primary)', color: 'var(--s-surface-1)' }}
        >
          See full breakdown
        </button>
        <button
          onClick={onBack}
          className="text-[13px] font-medium text-ink-faint hover:text-ink-muted transition-colors"
        >
          ← Adjust inputs
        </button>
      </div>
    </div>
  )
}
