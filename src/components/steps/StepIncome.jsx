import { useState } from 'react'
import useAffordStore from '../../store/useAffordStore'
import { useShallow } from 'zustand/react/shallow'
import { formatCAD } from '../shared/CurrencyDisplay'

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
      className="w-full text-center text-2xl sm:text-3xl font-display tracking-tight py-3 bg-transparent border-b-2 focus:outline-none transition-colors"
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


export default function StepIncome({ onNext }) {
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
      <p className="text-sm text-ink-faint mb-2">Step 1</p>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-8">
        What do you earn?
      </h2>

      <div className="space-y-5">
        {/* Person 1 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[11px] text-ink-faint uppercase tracking-wider">Your pay</label>
            <FreqPicker value={payFrequency1} onChange={handleFreq1Change} />
          </div>
          <CurrencyInput value={income1} onChange={setIncome1} autoFocus />
        </div>

        {/* Person 2 */}
        {!showPartner ? (
          <button
            onClick={() => setShowPartner(true)}
            className="text-[13px] font-medium transition-colors"
            style={{ color: 'var(--s-teal)' }}
          >
            + Add a partner
          </button>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] text-ink-faint uppercase tracking-wider">Partner's pay</label>
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
          {['net', 'gross'].map((type) => (
            <button
              key={type}
              onClick={() => handleIncomeTypeChange(type)}
              className={`px-3 py-2 text-[11px] font-medium transition-all ${
                incomeType === type ? 'bg-[var(--s-text-primary)] text-[var(--s-surface-1)]' : 'text-ink-faint hover:text-ink-muted'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-ink-faint">
          {incomeType === 'net' ? 'what hits your account' : 'before taxes'}
        </span>
      </div>

      <button
        onClick={onNext}
        className="mt-4 w-full py-3 rounded-xl text-[14px] font-semibold tracking-wide transition-all active:scale-[0.98]"
        style={{
          background: 'var(--s-text-primary)',
          color: 'var(--s-surface-1)',
        }}
      >
        Continue
      </button>
    </div>
  )
}
