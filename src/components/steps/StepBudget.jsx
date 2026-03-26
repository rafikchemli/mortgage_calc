import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import useAffordStore from '../../store/useAffordStore'
import { useShallow } from 'zustand/react/shallow'

/* ── Presets with "other" custom input ── */
function PresetOrCustom({ presets, value, onChange, suffix = '%', min = 0, max = 100 }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')
  const isCustom = !presets.includes(value)

  return (
    <div className="flex flex-wrap gap-2">
      {presets.map((v) => {
        const active = value === v && !editing
        return (
          <button
            key={v}
            onClick={() => { setEditing(false); onChange(v) }}
            className="px-4 py-3 rounded-xl text-center transition-all border min-w-[3.5rem] active:scale-95"
            style={{
              background: active ? 'var(--s-text-primary)' : 'transparent',
              color: active ? 'var(--s-surface-1)' : 'var(--s-text-secondary)',
              borderColor: active ? 'transparent' : 'var(--s-border)',
            }}
          >
            <span className="text-[15px] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              {v}{suffix}
            </span>
          </button>
        )
      })}

      {/* Custom / Other */}
      {editing ? (
        <div className="px-3 py-2 rounded-xl border flex items-center gap-1" style={{ borderColor: 'var(--s-gold)' }}>
          <input
            type="text" inputMode="decimal" value={text}
            onChange={(e) => setText(e.target.value.replace(/[^0-9.]/g, ''))}
            onBlur={() => {
              const v = parseFloat(text)
              if (!isNaN(v) && v >= min && v <= max) {
                onChange(Math.round(v * 10) / 10)
              }
              setEditing(false)
            }}
            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
            autoFocus
            placeholder="..."
            className="w-12 text-[15px] font-semibold bg-transparent focus:outline-none text-center tabular-nums"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--s-text-primary)' }}
          />
          <span className="text-[13px] text-ink-faint">{suffix}</span>
        </div>
      ) : (
        <button
          onClick={() => { setEditing(true); setText(isCustom ? String(value) : '') }}
          className="px-4 py-3 rounded-xl text-center transition-all border min-w-[3.5rem] active:scale-95"
          style={{
            background: isCustom ? 'var(--s-text-primary)' : 'transparent',
            color: isCustom ? 'var(--s-surface-1)' : 'var(--s-text-tertiary)',
            borderColor: isCustom ? 'transparent' : 'var(--s-border)',
            borderStyle: isCustom ? 'solid' : 'dashed',
          }}
        >
          <span className="text-[15px] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
            {isCustom ? `${value}${suffix}` : 'Other'}
          </span>
        </button>
      )}
    </div>
  )
}

export default function StepBudget({ onNext, onBack }) {
  const {
    housingBudgetPercent, setHousingBudgetPercent,
    downPaymentPercent, setDownPaymentPercent,
  } = useAffordStore(useShallow((s) => ({
    housingBudgetPercent: s.housingBudgetPercent, setHousingBudgetPercent: s.setHousingBudgetPercent,
    downPaymentPercent: s.downPaymentPercent, setDownPaymentPercent: s.setDownPaymentPercent,
  })))

  const budgetColor = housingBudgetPercent <= 30 ? 'var(--s-teal)'
    : housingBudgetPercent <= 35 ? 'var(--s-gold)'
    : housingBudgetPercent <= 40 ? 'var(--s-copper)'
    : 'var(--s-danger)'

  const budgetHint = housingBudgetPercent <= 30 ? 'Conservative'
    : housingBudgetPercent <= 35 ? 'Balanced'
    : housingBudgetPercent <= 40 ? 'Stretched'
    : 'Aggressive'

  return (
    <div className="stagger-fade-up">
      <p className="text-sm text-ink-faint mb-2">Step 3 of 4</p>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-8">
        Your budget
      </h2>

      {/* ── Housing budget — slider ── */}
      <div className="mb-7">
        <div className="flex items-baseline justify-between mb-2.5">
          <p className="text-[13px] text-ink-muted">% of take-home pay for housing</p>
          <div className="flex items-baseline gap-1.5">
            <m.span
              key={housingBudgetPercent}
              initial={{ scale: 1.15, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-lg font-bold tabular-nums"
              style={{ color: budgetColor, fontFamily: 'var(--font-display)' }}
            >
              {housingBudgetPercent}%
            </m.span>
            <AnimatePresence mode="wait">
              <m.span
                key={budgetHint}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 4 }}
                transition={{ duration: 0.12 }}
                className="text-[10px] font-medium"
                style={{ color: budgetColor }}
              >
                {budgetHint}
              </m.span>
            </AnimatePresence>
          </div>
        </div>
        <div className="relative w-full">
          <div
            className="absolute top-1/2 left-0 h-[6px] rounded-full -translate-y-1/2 pointer-events-none transition-all duration-150"
            style={{ width: `${((housingBudgetPercent - 15) / 45) * 100}%`, background: budgetColor, opacity: 0.7 }}
          />
          <input type="range" min={15} max={60} step={1} value={housingBudgetPercent}
            onChange={(e) => setHousingBudgetPercent(Number(e.target.value))} className="relative z-10 w-full" />
        </div>
      </div>

      {/* ── Down payment ── */}
      <div className="mb-2">
        <p className="text-[13px] text-ink-muted mb-3">Down payment</p>
        <PresetOrCustom
          presets={[5, 10, 15, 20, 25]}
          value={downPaymentPercent}
          onChange={(v) => setDownPaymentPercent(Math.round(v))}
          min={5} max={95}
        />
        <p className="text-[11px] text-ink-faint mt-2 leading-relaxed">
          {downPaymentPercent < 20
            ? <>CMHC insurance applies — adds to mortgage but typically lowers your rate.</>
            : <>No insurance needed — conventional rates may be slightly higher.</>
          }
        </p>
      </div>

      {/* ── Navigation ── */}
      <div className="flex gap-3 mt-8">
        <button onClick={onBack} className="px-5 py-3 rounded-xl text-[14px] font-medium text-ink-faint transition-all active:scale-[0.98]">
          Back
        </button>
        <button onClick={onNext} className="flex-1 py-3 rounded-xl text-[14px] font-semibold tracking-wide transition-all active:scale-[0.98]"
          style={{ background: 'var(--s-text-primary)', color: 'var(--s-surface-1)' }}>
          Continue
        </button>
      </div>
    </div>
  )
}
