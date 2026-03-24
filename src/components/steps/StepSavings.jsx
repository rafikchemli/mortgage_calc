import { useState } from 'react'
import { m } from 'framer-motion'
import useAffordStore from '../../store/useAffordStore'
import { formatCAD } from '../shared/CurrencyDisplay'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

export default function StepSavings({ onNext, onBack }) {
  const savings = useAffordStore((s) => s.savings)
  const setSavings = useAffordStore((s) => s.setSavings)
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')

  const handleFocus = () => {
    setEditing(true)
    setText(String(savings))
  }

  const handleBlur = () => {
    setEditing(false)
    const v = Number(text.replace(/[^0-9]/g, ''))
    if (!isNaN(v) && v >= 0) setSavings(v)
  }

  return (
    <m.div variants={stagger} initial="hidden" animate="visible">
      <m.p variants={fadeUp} className="text-sm text-ink-faint mb-2">Step 2</m.p>
      <m.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-3">
        How much have you saved?
      </m.h2>
      <m.p variants={fadeUp} className="text-sm text-ink-faint mb-8">
        Total cash available for down payment and closing costs.
      </m.p>

      <m.div variants={fadeUp}>
        <input
          type="text"
          inputMode="decimal"
          value={editing ? text : formatCAD(savings)}
          onFocus={handleFocus}
          onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ''))}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          autoFocus
          className="w-full text-center text-4xl sm:text-5xl font-display tracking-tight py-4 bg-transparent border-b-2 focus:outline-none transition-colors"
          style={{
            color: 'var(--s-gold)',
            borderColor: editing ? 'var(--s-gold)' : 'var(--s-border)',
            fontFamily: 'var(--font-display)',
          }}
        />
      </m.div>

      {/* Quick presets */}
      <m.div variants={fadeUp} className="flex flex-wrap gap-2 mt-6 justify-center">
        {[50000, 75000, 100000, 150000, 200000].map((v) => (
          <button
            key={v}
            onClick={() => setSavings(v)}
            className={`px-3 py-2 rounded-lg text-[12px] font-medium border transition-all ${
              savings === v
                ? 'bg-[var(--s-text-primary)] text-[var(--s-surface-1)] border-transparent'
                : 'text-ink-faint border-[var(--s-border)] hover:text-ink-muted hover:border-[var(--s-surface-3)]'
            }`}
          >
            {formatCAD(v)}
          </button>
        ))}
      </m.div>

      {/* Navigation */}
      <m.div variants={fadeUp} className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl text-[14px] font-medium transition-all active:scale-[0.98]"
          style={{ color: 'var(--s-text-secondary)' }}
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl text-[14px] font-semibold tracking-wide transition-all active:scale-[0.98]"
          style={{
            background: 'var(--s-text-primary)',
            color: 'var(--s-surface-1)',
          }}
        >
          Continue
        </button>
      </m.div>
    </m.div>
  )
}
