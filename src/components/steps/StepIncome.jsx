import { useState } from 'react'
import useAffordStore from '../../store/useAffordStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCAD } from '../shared/CurrencyDisplay'
import PrivacyNotice from '../layout/PrivacyNotice'

const FREQ_CONFIG = {
  biweekly: { min: 500, max: 500000, step: 100, label: 'Bi-weekly' },
  monthly:  { min: 1000, max: 1000000, step: 100, label: 'Monthly' },
  yearly:   { min: 15000, max: 10000000, step: 1000, label: 'Yearly' },
}

function CurrencyInput({ value, onChange, autoFocus }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')

  const handleFocus = () => {
    setEditing(true)
    setText(String(value))
  }

  const handleBlur = () => {
    setEditing(false)
    const v = Number(text.replace(/[^0-9.]/g, ''))
    if (!isNaN(v) && v >= 0) onChange(v)
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={editing ? text : formatCAD(value)}
      onFocus={handleFocus}
      onChange={(e) => setText(e.target.value.replace(/[^0-9.]/g, ''))}
      onBlur={handleBlur}
      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
      autoFocus={autoFocus}
      className="w-full text-center text-2xl sm:text-3xl font-display tracking-tight py-3 bg-transparent border-b-2 focus:outline-none transition-colors tabular-nums"
      style={{
        color: 'var(--s-text-primary)',
        borderColor: editing ? 'var(--s-gold)' : 'var(--s-border)',
        fontFamily: 'var(--font-display)',
      }}
    />
  )
}

function FreqPicker({ value, onChange }) {
  return (
    <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--s-border)' }}>
      {Object.entries(FREQ_CONFIG).map(([key, { label }]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-3 py-2 text-[10px] font-medium transition-all ${
            value === key ? 'bg-[var(--s-text-primary)] text-[var(--s-surface-1)]' : 'text-ink-faint hover:text-ink-muted'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}


export default function StepIncome({ onNext, onBack }) {
  const {
    income1, setIncome1, income2, setIncome2,
    payFrequency1, setPayFrequency1,
    payFrequency2, setPayFrequency2,
    incomeType, setIncomeType,
  } = useAffordStore(useShallow((s) => ({
    income1: s.income1, setIncome1: s.setIncome1,
    income2: s.income2, setIncome2: s.setIncome2,
    payFrequency1: s.payFrequency1, setPayFrequency1: s.setPayFrequency1,
    payFrequency2: s.payFrequency2, setPayFrequency2: s.setPayFrequency2,
    incomeType: s.incomeType, setIncomeType: s.setIncomeType,
  })))

  const [showPartner, setShowPartner] = useState(income2 > 0)

  const handleFreq1Change = (newFreq) => setPayFrequency1(newFreq)
  const handleFreq2Change = (newFreq) => setPayFrequency2(newFreq)
  const handleIncomeTypeChange = (newType) => setIncomeType(newType)

  return (
    <div className="stagger-fade-up">
      <p className="text-[10px] uppercase tracking-[0.12em] text-ink-faint mb-4 font-medium">Step 2 of 4</p>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-1.5">
        What do you bring home?
      </h2>
      <p className="text-[13px] text-ink-faint mb-10 leading-relaxed">
        Your take-home pay — what hits your account.
      </p>

      <div className="space-y-5">
        {/* Person 1 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] text-ink-faint uppercase tracking-[0.1em] font-medium">Your pay</label>
            <FreqPicker value={payFrequency1} onChange={handleFreq1Change} />
          </div>
          <CurrencyInput value={income1} onChange={setIncome1} />
        </div>

        {/* Person 2 */}
        {!showPartner ? (
          <button
            onClick={() => setShowPartner(true)}
            className="text-[13px] font-medium transition-colors"
            style={{ color: 'var(--s-teal)' }}
          >
            + Buying with someone?
          </button>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] text-ink-faint uppercase tracking-[0.1em] font-medium">Their pay</label>
              <div className="flex items-center gap-2">
                <FreqPicker value={payFrequency2} onChange={handleFreq2Change} />
                <button
                  onClick={() => { setIncome2(0); setShowPartner(false) }}
                  className="w-7 h-7 flex items-center justify-center text-[12px] text-ink-faint hover:text-danger transition-colors rounded-lg"
                >
                  ×
                </button>
              </div>
            </div>
            <CurrencyInput value={income2} onChange={setIncome2} />
          </div>
        )}
      </div>

      {/* Net/Gross toggle */}
      <div className="flex items-center gap-3 mt-6">
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--s-border)' }}>
          {[{ key: 'net', label: 'After tax' }, { key: 'gross', label: 'Before tax' }].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleIncomeTypeChange(key)}
              className={`px-3 py-2 text-[11px] font-medium transition-all ${
                incomeType === key ? 'bg-[var(--s-text-primary)] text-[var(--s-surface-1)]' : 'text-ink-faint hover:text-ink-muted'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-ink-faint">
          {incomeType === 'net' ? 'what lands in your account' : "we'll estimate taxes for you"}
        </span>
      </div>

      <div className="mt-6">
        <PrivacyNotice prominent />
      </div>

      <div className="flex items-center gap-3 mt-6">
        <button onClick={onBack} className="px-3 py-2 text-[12px] font-medium text-ink-faint hover:text-ink-muted transition-colors active:scale-[0.97]">
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3.5 rounded-xl text-[14px] font-semibold tracking-wide transition-all active:scale-[0.98]"
          style={{ background: 'var(--s-text-primary)', color: 'var(--s-surface-1)' }}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
