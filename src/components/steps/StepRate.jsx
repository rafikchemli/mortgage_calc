import { useState } from 'react'
import { m } from 'framer-motion'
import useAffordStore from '../../store/useAffordStore'
import { useShallow } from 'zustand/react/shallow'

export default function StepRate({ onNext, onBack }) {
  const {
    interestRate, setInterestRate,
    amortizationYears, setAmortizationYears,
  } = useAffordStore(useShallow((s) => ({
    interestRate: s.interestRate, setInterestRate: s.setInterestRate,
    amortizationYears: s.amortizationYears, setAmortizationYears: s.setAmortizationYears,
  })))

  const [editingRate, setEditingRate] = useState(false)
  const [rateText, setRateText] = useState('')

  return (
    <div className="stagger-fade-up">
      <p className="text-sm text-ink-faint mb-2">Step 4 of 4</p>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-8">
        Mortgage terms
      </h2>

      {/* ── Interest rate — thermostat style ── */}
      <div className="mb-10">
        <p className="text-[13px] text-ink-muted mb-4">Interest rate</p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setInterestRate(Math.max(0.5, Math.round((interestRate - 0.1) * 10) / 10))}
            className="w-11 h-11 rounded-full flex items-center justify-center border transition-colors hover:bg-[var(--s-surface-2)] active:bg-[var(--s-surface-3)] active:scale-90"
            style={{ borderColor: 'var(--s-border)' }}
            aria-label="Decrease rate"
          >
            <svg className="w-4 h-4 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M5 12h14" /></svg>
          </button>

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

          <button
            onClick={() => setInterestRate(Math.min(15, Math.round((interestRate + 0.1) * 10) / 10))}
            className="w-11 h-11 rounded-full flex items-center justify-center border transition-colors hover:bg-[var(--s-surface-2)] active:bg-[var(--s-surface-3)] active:scale-90"
            style={{ borderColor: 'var(--s-border)' }}
            aria-label="Increase rate"
          >
            <svg className="w-4 h-4 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
          </button>
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
              <button key={value} onClick={() => setAmortizationYears(value)}
                className="py-4 rounded-xl text-center transition-all border active:scale-95"
                style={{
                  background: active ? 'var(--s-text-primary)' : 'transparent',
                  color: active ? 'var(--s-surface-1)' : 'var(--s-text-secondary)',
                  borderColor: active ? 'transparent' : 'var(--s-border)',
                }}>
                <span className="text-lg font-semibold block" style={{ fontFamily: 'var(--font-display)' }}>{value}</span>
                <span className="text-[9px] block mt-0.5" style={{ opacity: active ? 0.7 : 0.4 }}>{hint}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="flex gap-3 mt-8">
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
