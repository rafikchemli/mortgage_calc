import { useState } from 'react'
import useAffordStore from '../../store/useAffordStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCAD, formatCADShort } from '../shared/CurrencyDisplay'

export default function StepSavings({ onNext, onBack }) {
  const { savings, setSavings, downPaymentPercent, setDownPaymentPercent } = useAffordStore(useShallow((s) => ({
    savings: s.savings, setSavings: s.setSavings,
    downPaymentPercent: s.downPaymentPercent, setDownPaymentPercent: s.setDownPaymentPercent,
  })))
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
    <div className="stagger-fade-up">
      <p className="text-[10px] uppercase tracking-[0.12em] text-ink-faint mb-4 font-medium">Step 1 of 4</p>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-1.5">
        What have you saved?
      </h2>
      <p className="text-[13px] text-ink-faint mb-10 leading-relaxed">
        This covers your down payment and closing costs.
      </p>

      <div>
        <input
          type="text"
          inputMode="numeric"
          value={editing ? text : formatCAD(savings)}
          onFocus={handleFocus}
          onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ''))}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          className="w-full text-center text-4xl sm:text-5xl font-display tracking-tight py-3 bg-transparent border-b-2 focus:outline-none transition-colors tabular-nums"
          style={{
            color: 'var(--s-gold)',
            borderColor: editing ? 'var(--s-gold)' : 'var(--s-border)',
            fontFamily: 'var(--font-display)',
          }}
        />
      </div>

      {/* Quick presets — tight to input, they're one unit */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {[25000, 50000, 75000, 100000, 150000].map((v) => {
          const isActive = savings === v
          return (
            <button
              key={v}
              onClick={() => setSavings(v)}
              className={`px-3.5 py-2.5 rounded-lg text-[12px] font-medium border transition-all active:scale-95 ${
                isActive
                  ? 'bg-[var(--s-text-primary)] text-[var(--s-surface-1)] border-transparent'
                  : 'text-ink-faint border-[var(--s-border)] hover:text-ink-muted hover:border-[var(--s-surface-3)]'
              }`}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {formatCADShort(v)}
            </button>
          )
        })}
      </div>

      {/* Down payment percentage */}
      <div className="mt-10">
        <p className="text-[11px] uppercase tracking-[0.08em] text-ink-faint mb-3 font-medium">Down payment</p>
        <div className="flex flex-wrap gap-2">
          {[5, 10, 15, 20].map((v) => {
            const active = downPaymentPercent === v
            return (
              <button
                key={v}
                onClick={() => setDownPaymentPercent(v)}
                className="relative px-4 py-3 rounded-xl text-center transition-all border min-w-[3.5rem] active:scale-95"
                style={{
                  background: active ? 'var(--s-text-primary)' : 'transparent',
                  color: active ? 'var(--s-surface-1)' : 'var(--s-text-secondary)',
                  borderColor: active ? 'transparent' : 'var(--s-border)',
                }}
              >
                <span className="text-[15px] font-semibold tabular-nums" style={{ fontFamily: 'var(--font-display)' }}>
                  {v}%
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-[11px] text-ink-faint mt-2.5 leading-relaxed">
          {downPaymentPercent < 20
            ? 'CMHC insurance will be added to your mortgage.'
            : 'No mortgage insurance needed.'}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-10">
        <button
          onClick={onBack}
          className="px-3 py-2 text-[12px] font-medium text-ink-faint hover:text-ink-muted transition-colors active:scale-[0.97]"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3.5 rounded-xl text-[14px] font-semibold tracking-wide transition-all active:scale-[0.98]"
          style={{
            background: 'var(--s-text-primary)',
            color: 'var(--s-surface-1)',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
