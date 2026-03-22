import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useComputedAfford } from '../../hooks/useComputedAfford'
import { formatCAD } from '../shared/CurrencyDisplay'

// Slow stagger — each element waits for the previous to land
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.4 } },
}

// Label floats in gently
const labelIn = {
  hidden: { opacity: 0, y: -8 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
}

// Price scales in with a bounce
const priceIn = {
  hidden: { opacity: 0, scale: 0.7, filter: 'blur(12px)' },
  visible: {
    opacity: 1, scale: 1, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 120, damping: 12, mass: 1.2 },
  },
}

// Details fade up after the price lands
const detailIn = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 200, damping: 20 },
  },
}

function AnimatedCounter({ target, duration = 1500, delay = 600 }) {
  const [display, setDisplay] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  useEffect(() => {
    if (!started) return
    const start = performance.now()
    let raf
    function tick(now) {
      const t = Math.min((now - start) / duration, 1)
      // Ease-out expo — fast start, graceful landing
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setDisplay(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, duration, started])

  return <span>{formatCAD(display)}</span>
}

export default function StepReveal({ onNext, onBack }) {
  const { maxPrice, costBreakdown, housingPercent, savingsCovered, savings, cashNeeded } = useComputedAfford()

  const housingLabel = housingPercent < 30 ? 'Conservative' : housingPercent < 40 ? 'Moderate' : housingPercent < 50 ? 'Stretched' : 'Risky'
  const housingColor = housingPercent < 30 ? 'var(--s-teal)' : housingPercent < 40 ? 'var(--s-gold)' : housingPercent < 50 ? 'var(--s-copper)' : 'var(--s-danger)'

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="text-center"
    >
      <motion.p variants={labelIn} className="text-xs tracking-[0.2em] uppercase text-ink-faint mb-5">
        You can afford up to
      </motion.p>

      <motion.div variants={priceIn}>
        <p
          className="text-6xl sm:text-8xl font-bold tracking-tighter leading-none"
          style={{ color: 'var(--s-gold)', fontFamily: 'var(--font-display)' }}
        >
          <AnimatedCounter target={maxPrice} />
        </p>
      </motion.div>

      <motion.div variants={detailIn} className="mt-8 space-y-2">
        <p style={{ fontFamily: 'var(--font-display)', color: 'var(--s-text-secondary)' }} className="text-xl">
          <AnimatedCounter target={costBreakdown.total} duration={1000} delay={1400} />
          <span className="text-sm text-ink-faint ml-1">/mo</span>
        </p>
        <p className="text-[12px] text-ink-faint">
          Keeping housing costs at <span className="font-medium" style={{ color: housingColor }}>35% of your net income</span>
        </p>
        <p className="text-[11px] text-ink-faint">
          Per <a href="https://www.cmhc-schl.gc.ca/consumers/home-buying/calculators/affordability-calculator" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink-muted transition-colors">CMHC guidelines</a>
        </p>
      </motion.div>

      <motion.div
        variants={detailIn}
        className="mt-5 py-2.5 px-5 rounded-full text-[12px] font-medium inline-block"
        style={{
          background: savingsCovered ? 'color-mix(in srgb, var(--s-teal) 10%, transparent)' : 'color-mix(in srgb, var(--s-danger) 10%, transparent)',
          color: savingsCovered ? 'var(--s-teal)' : 'var(--s-danger)',
        }}
      >
        {savingsCovered
          ? `Savings cover closing costs`
          : `Need ${formatCAD(cashNeeded - savings)} more to close`
        }
      </motion.div>

      <motion.div variants={detailIn} className="flex flex-col gap-3 mt-10">
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
      </motion.div>
    </motion.div>
  )
}
