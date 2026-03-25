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
          <m.button
            key={v}
            onClick={() => { setEditing(false); onChange(v) }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-3 rounded-xl text-center transition-all border min-w-[3.5rem]"
            style={{
              background: active ? 'var(--s-text-primary)' : 'transparent',
              color: active ? 'var(--s-surface-1)' : 'var(--s-text-secondary)',
              borderColor: active ? 'transparent' : 'var(--s-border)',
            }}
          >
            <span className="text-[15px] font-semibold" style={{ fontFamily: 'var(--font-display)' }}>
              {v}{suffix}
            </span>
          </m.button>
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
        <m.button
          onClick={() => { setEditing(true); setText(isCustom ? String(value) : '') }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-3 rounded-xl text-center transition-all border min-w-[3.5rem]"
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
        </m.button>
      )}
    </div>
  )
}

export default function StepMortgage({ onNext, onBack }) {
  const {
    housingBudgetPercent, setHousingBudgetPercent,
    downPaymentPercent, setDownPaymentPercent,
    amortizationYears, setAmortizationYears,
    interestRate, setInterestRate,
  } = useAffordStore(useShallow((s) => ({
    housingBudgetPercent: s.housingBudgetPercent, setHousingBudgetPercent: s.setHousingBudgetPercent,
    downPaymentPercent: s.downPaymentPercent, setDownPaymentPercent: s.setDownPaymentPercent,
    amortizationYears: s.amortizationYears, setAmortizationYears: s.setAmortizationYears,
    interestRate: s.interestRate, setInterestRate: s.setInterestRate,
  })))

  const [editingRate, setEditingRate] = useState(false)
  const [rateText, setRateText] = useState('')

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
      <p className="text-sm text-ink-faint mb-2">Step 3 of 3</p>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-8">
        Set your terms
      </h2>

      {/* ── Housing budget — slider for this one, it's a feel-based choice ── */}
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
      <div className="mb-7">
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

      {/* ── Interest rate — thermostat style ── */}
      <div className="mb-7">
        <p className="text-[13px] text-ink-muted mb-4">Interest rate</p>
        <div className="flex items-center justify-center gap-4">
          <m.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setInterestRate(Math.max(0.5, Math.round((interestRate - 0.1) * 10) / 10))}
            className="w-11 h-11 rounded-full flex items-center justify-center border transition-colors hover:bg-[var(--s-surface-2)] active:bg-[var(--s-surface-3)]"
            style={{ borderColor: 'var(--s-border)' }}
          >
            <svg className="w-4 h-4 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M5 12h14" /></svg>
          </m.button>

          {editingRate ? (
            <input
              type="text" inputMode="decimal" value={rateText}
              onChange={(e) => setRateText(e.target.value.replace(/[^0-9.]/g, ''))}
              onBlur={() => {
                setEditingRate(false)
                const v = parseFloat(rateText)
                if (!isNaN(v) && v >= 0.5 && v <= 15) setInterestRate(Math.round(v * 10) / 10)
              }}
              onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
              autoFocus
              className="w-28 text-center text-4xl font-bold bg-transparent border-b-2 focus:outline-none py-1 tabular-nums"
              style={{ color: 'var(--s-text-primary)', borderColor: 'var(--s-gold)', fontFamily: 'var(--font-display)' }}
            />
          ) : (
            <button
              onClick={() => { setEditingRate(true); setRateText(interestRate.toFixed(1)) }}
              className="text-4xl font-bold tabular-nums py-1 tracking-tight"
              style={{ color: 'var(--s-text-primary)', fontFamily: 'var(--font-display)' }}
            >
              {interestRate.toFixed(1)}%
            </button>
          )}

          <m.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setInterestRate(Math.min(15, Math.round((interestRate + 0.1) * 10) / 10))}
            className="w-11 h-11 rounded-full flex items-center justify-center border transition-colors hover:bg-[var(--s-surface-2)] active:bg-[var(--s-surface-3)]"
            style={{ borderColor: 'var(--s-border)' }}
          >
            <svg className="w-4 h-4 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
          </m.button>
        </div>
      </div>

      {/* ── Amortization ── */}
      <div className="mb-2">
        <p className="text-[13px] text-ink-muted mb-3">Amortization</p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 20, hint: 'less interest' },
            { value: 25, hint: 'standard' },
            { value: 30, hint: 'lower payment' },
          ].map(({ value, hint }) => {
            const active = amortizationYears === value
            return (
              <m.button key={value} onClick={() => setAmortizationYears(value)} whileTap={{ scale: 0.95 }}
                className="py-4 rounded-xl text-center transition-all border"
                style={{
                  background: active ? 'var(--s-text-primary)' : 'transparent',
                  color: active ? 'var(--s-surface-1)' : 'var(--s-text-secondary)',
                  borderColor: active ? 'transparent' : 'var(--s-border)',
                }}>
                <span className="text-lg font-semibold block" style={{ fontFamily: 'var(--font-display)' }}>{value}</span>
                <span className="text-[9px] block mt-0.5" style={{ opacity: active ? 0.7 : 0.4 }}>{hint}</span>
              </m.button>
            )
          })}
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="flex gap-3 mt-6">
        <button onClick={onBack} className="px-5 py-3 rounded-xl text-[14px] font-medium text-ink-faint transition-all active:scale-[0.98]">
          Back
        </button>
        <button onClick={onNext} className="flex-1 py-3 rounded-xl text-[14px] font-semibold tracking-wide transition-all active:scale-[0.98]"
          style={{ background: 'var(--s-text-primary)', color: 'var(--s-surface-1)' }}>
          See what I can afford
        </button>
      </div>
    </div>
  )
}
