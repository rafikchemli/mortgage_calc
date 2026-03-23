import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAffordStore from '../../store/useAffordStore'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

/* ── Filled-track range slider ────────────── */
function FilledSlider({ min, max, step, value, onChange, color = 'var(--s-gold)' }) {
  const trackRef = useRef(null)
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="relative w-full" ref={trackRef}>
      {/* Filled track overlay */}
      <div
        className="absolute top-1/2 left-0 h-[6px] rounded-full -translate-y-1/2 pointer-events-none transition-all duration-150"
        style={{ width: `${pct}%`, background: color, opacity: 0.7 }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="relative z-10 w-full"
      />
    </div>
  )
}

/* ── Pill selector with optional sub-label ── */
function PillSelector({ options, value, onChange, gridClass = 'grid-cols-5' }) {
  return (
    <div className={`grid gap-2 ${gridClass}`}>
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <motion.button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            whileTap={{ scale: 0.96 }}
            className="relative rounded-xl text-center transition-all border overflow-hidden"
            style={{
              background: isActive ? 'var(--s-text-primary)' : 'transparent',
              color: isActive ? 'var(--s-surface-1)' : 'var(--s-text-secondary)',
              borderColor: isActive ? 'transparent' : 'var(--s-border)',
              padding: opt.sub ? '12px 4px 10px' : '16px 4px',
            }}
          >
            <span className="text-lg font-semibold block" style={{ fontFamily: 'var(--font-display)' }}>
              {opt.label}
            </span>
            {opt.sub && (
              <span
                className="text-[9px] block mt-0.5 leading-tight"
                style={{ opacity: isActive ? 0.7 : 0.45 }}
              >
                {opt.sub}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

/* ── Editable rate display ─────────────────── */
function EditableRate({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')

  return (
    <button
      onClick={() => { setEditing(true); setText(value.toFixed(1)) }}
      className="text-3xl font-bold tabular-nums min-w-[5rem] text-right"
      style={{ color: 'var(--s-text-primary)', fontFamily: 'var(--font-display)' }}
    >
      {editing ? (
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={(e) => setText(e.target.value.replace(/[^0-9.]/g, ''))}
          onBlur={() => {
            setEditing(false)
            const v = parseFloat(text)
            if (!isNaN(v) && v >= 1 && v <= 10) onChange(Math.round(v * 10) / 10)
          }}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          autoFocus
          className="w-full text-right bg-transparent focus:outline-none text-3xl font-bold"
          style={{ fontFamily: 'var(--font-display)' }}
        />
      ) : (
        <>{value.toFixed(1)}%</>
      )}
    </button>
  )
}

/* ── Main step component ───────────────────── */
export default function StepMortgage({ onNext, onBack }) {
  const {
    housingBudgetPercent, setHousingBudgetPercent,
    downPaymentPercent, setDownPaymentPercent,
    amortizationYears, setAmortizationYears,
    interestRate, setInterestRate,
  } = useAffordStore()

  const budgetColor = housingBudgetPercent <= 30 ? 'var(--s-teal)'
    : housingBudgetPercent <= 35 ? 'var(--s-gold)'
    : housingBudgetPercent <= 40 ? 'var(--s-copper)'
    : 'var(--s-danger)'

  const budgetLabel = housingBudgetPercent <= 30 ? 'Conservative — plenty of room for other expenses'
    : housingBudgetPercent <= 35 ? 'Balanced — a common target for take-home pay'
    : housingBudgetPercent <= 40 ? 'Stretched — less room for savings and surprises'
    : 'Aggressive — consider whether this is sustainable'

  const cmhcRates = { 5: '4.0%', 10: '3.1%', 15: '2.8%' }

  const downPaymentOptions = [5, 10, 15, 20, 25].map((v) => ({
    value: v,
    label: `${v}%`,
    sub: v < 20 ? `+${cmhcRates[v]} ins.` : v === 20 ? 'no ins.' : 'no ins.',
  }))

  const amortOptions = [20, 25, 30].map((v) => ({
    value: v,
    label: `${v}`,
    sub: v === 20 ? 'less interest' : v === 25 ? 'balanced' : 'lower payment',
  }))

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.p variants={fadeUp} className="text-sm text-ink-faint mb-2">Step 3</motion.p>
      <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-6">
        Your mortgage
      </motion.h2>

      {/* Housing budget % */}
      <motion.div variants={fadeUp} className="mb-8">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-[13px] text-ink-muted">
            How much of your pay goes to housing?
          </p>
          <motion.span
            key={housingBudgetPercent}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-2xl font-bold tabular-nums"
            style={{ color: budgetColor, fontFamily: 'var(--font-display)' }}
          >
            {housingBudgetPercent}%
          </motion.span>
        </div>
        <FilledSlider
          min={25} max={50} step={1}
          value={housingBudgetPercent}
          onChange={setHousingBudgetPercent}
          color={budgetColor}
        />
        <AnimatePresence mode="wait">
          <motion.p
            key={budgetLabel}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="text-[11px] mt-2 ml-0.5"
            style={{ color: budgetColor }}
          >
            {budgetLabel}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Down payment */}
      <motion.div variants={fadeUp} className="mb-8">
        <p className="text-[13px] text-ink-muted mb-3">Down payment</p>
        <PillSelector
          options={downPaymentOptions}
          value={downPaymentPercent}
          onChange={setDownPaymentPercent}
          gridClass="grid-cols-3 sm:grid-cols-5"
        />
        <AnimatePresence mode="wait">
          <motion.p
            key={downPaymentPercent < 20 ? 'insured' : 'conventional'}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[11px] text-ink-faint mt-2.5 ml-0.5 leading-relaxed overflow-hidden"
          >
            {downPaymentPercent < 20 ? (
              <>
                <span className="font-medium text-ink-muted">CMHC insurance required</span> — adds {cmhcRates[downPaymentPercent]} to your mortgage, but insured rates are typically 0.1–0.2% lower.
              </>
            ) : (
              <>
                <span className="font-medium text-ink-muted">No insurance needed</span> — conventional rates are typically 0.1–0.2% higher than insured.
              </>
            )}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Amortization */}
      <motion.div variants={fadeUp} className="mb-8">
        <p className="text-[13px] text-ink-muted mb-3">Amortization</p>
        <PillSelector
          options={amortOptions}
          value={amortizationYears}
          onChange={setAmortizationYears}
          gridClass="grid-cols-3"
        />
      </motion.div>

      {/* Interest rate */}
      <motion.div variants={fadeUp} className="mb-2">
        <p className="text-[13px] text-ink-muted mb-3">Interest rate</p>
        <div className="flex items-center gap-4">
          <FilledSlider
            min={1} max={10} step={0.1}
            value={interestRate}
            onChange={setInterestRate}
            color="var(--s-gold)"
          />
          <EditableRate value={interestRate} onChange={setInterestRate} />
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div variants={fadeUp} className="flex gap-3 mt-10">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl text-[14px] font-medium text-ink-faint transition-all active:scale-[0.98]"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl text-[14px] font-semibold tracking-wide transition-all active:scale-[0.98]"
          style={{ background: 'var(--s-text-primary)', color: 'var(--s-surface-1)' }}
        >
          See what I can afford
        </button>
      </motion.div>
    </motion.div>
  )
}
