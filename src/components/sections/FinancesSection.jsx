import useAffordStore from '../../store/useAffordStore'
import { useShallow } from 'zustand/react/shallow'
import CompactValueInput from '../shared/CompactValueInput'
import SelectInput from '../shared/SelectInput'
import { formatCAD } from '../shared/CurrencyDisplay'
import { grossToNetAnnual, netToGrossAnnual } from '../../calc/incomeTax'
import { toAnnual } from '../../hooks/useComputedAfford'

const FREQ_CONFIG = {
  biweekly: { min: 500, max: 500000, step: 100 },
  monthly:  { min: 1000, max: 1000000, step: 100 },
  yearly:   { min: 15000, max: 10000000, step: 1000 },
}

const PAY_FREQUENCIES = [
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

function convertIncome(value, fromFreq, toFreq) {
  const config = FREQ_CONFIG[toFreq]
  let monthly
  switch (fromFreq) {
    case 'biweekly': monthly = value * 26 / 12; break
    case 'monthly': monthly = value; break
    case 'yearly': monthly = value / 12; break
    default: monthly = value
  }
  switch (toFreq) {
    case 'biweekly': return Math.round(monthly * 12 / 26 / config.step) * config.step
    case 'monthly': return Math.round(monthly / config.step) * config.step
    case 'yearly': return Math.round(monthly * 12 / config.step) * config.step
    default: return Math.round(monthly)
  }
}

export default function FinancesSection() {
  const {
    income1, setIncome1, income2, setIncome2,
    payFrequency, setPayFrequency,
    incomeType, setIncomeType,
    savings, setSavings,
  } = useAffordStore(useShallow((s) => ({
    income1: s.income1, setIncome1: s.setIncome1,
    income2: s.income2, setIncome2: s.setIncome2,
    payFrequency: s.payFrequency, setPayFrequency: s.setPayFrequency,
    incomeType: s.incomeType, setIncomeType: s.setIncomeType,
    savings: s.savings, setSavings: s.setSavings,
  })))

  const config = FREQ_CONFIG[payFrequency]

  const handleFrequencyChange = (newFreq) => {
    setIncome1(convertIncome(income1, payFrequency, newFreq))
    setIncome2(convertIncome(income2, payFrequency, newFreq))
    setPayFrequency(newFreq)
  }

  const fromAnnual = (v) => {
    switch (payFrequency) {
      case 'biweekly': return Math.round(v / 26 / config.step) * config.step
      case 'monthly': return Math.round(v / 12 / config.step) * config.step
      case 'yearly': return Math.round(v / config.step) * config.step
      default: return Math.round(v / 26 / config.step) * config.step
    }
  }

  const handleIncomeTypeChange = (newType) => {
    if (newType === incomeType) return
    const convert = newType === 'net'
      ? (v) => fromAnnual(grossToNetAnnual(toAnnual(v, payFrequency)))
      : (v) => fromAnnual(netToGrossAnnual(toAnnual(v, payFrequency)))
    setIncome1(convert(income1))
    if (income2 > 0) setIncome2(convert(income2))
    setIncomeType(newType)
  }

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="section-label">Your Finances</span>
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: 'var(--s-border)' }} role="radiogroup" aria-label="Income type">
          {['net', 'gross'].map((type) => (
            <button
              key={type}
              onClick={() => handleIncomeTypeChange(type)}
              role="radio"
              aria-checked={incomeType === type}
              className={`px-3 py-1.5 text-[11px] font-medium transition-all ${
                incomeType === type
                  ? 'bg-[var(--s-text-primary)] text-[var(--s-surface-1)]'
                  : 'text-ink-faint hover:text-ink-muted'
              }`}
            >
              {type === 'net' ? 'Net' : 'Gross'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <CompactValueInput
          label="Your Pay"
          min={config.min}
          max={config.max}
          step={config.step}
          value={income1}
          onChange={setIncome1}
          formatFn={formatCAD}
          showSteppers
        />
        <CompactValueInput
          label="Partner's Pay"
          min={0}
          max={config.max}
          step={config.step}
          value={income2}
          onChange={setIncome2}
          formatFn={(v) => v === 0 ? 'None' : formatCAD(v)}
          tooltip="Set to $0 for solo buyer"
          showSteppers
        />
        <CompactValueInput
          label="Savings"
          min={0}
          max={5000000}
          step={5000}
          value={savings}
          onChange={setSavings}
          formatFn={formatCAD}
          tooltip="Total cash available for down payment and closing"
          showSteppers
        />
      </div>

      <div className="mt-2">
        <SelectInput
          label="Pay Frequency"
          options={PAY_FREQUENCIES}
          value={payFrequency}
          onChange={handleFrequencyChange}
          compact
        />
      </div>
    </div>
  )
}
