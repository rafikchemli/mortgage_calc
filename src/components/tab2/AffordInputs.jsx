import useAffordStore from '../../store/useAffordStore'
import SelectInput from '../shared/SelectInput'
import CompactValueInput from '../shared/CompactValueInput'
import { formatCAD } from '../shared/CurrencyDisplay'

const FREQ_CONFIG = {
  biweekly: { min: 500, max: 500000, step: 50 },
  monthly:  { min: 1000, max: 1000000, step: 100 },
  yearly:   { min: 15000, max: 10000000, step: 1000 },
}

const PAY_FREQUENCIES = [
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

function convertIncome(value, fromFreq, toFreq) {
  let monthly
  switch (fromFreq) {
    case 'biweekly': monthly = value * 26 / 12; break
    case 'monthly': monthly = value; break
    case 'yearly': monthly = value / 12; break
    default: monthly = value
  }
  switch (toFreq) {
    case 'biweekly': return Math.round(monthly * 12 / 26 / 50) * 50
    case 'monthly': return Math.round(monthly / 100) * 100
    case 'yearly': return Math.round(monthly * 12 / 1000) * 1000
    default: return Math.round(monthly)
  }
}

export default function AffordInputs() {
  const {
    income1, setIncome1,
    income2, setIncome2,
    payFrequency, setPayFrequency,
    downPaymentPercent, setDownPaymentPercent,
    interestRate, setInterestRate,
    amortizationYears, setAmortizationYears,
  } = useAffordStore()

  const config = FREQ_CONFIG[payFrequency]

  const frequencyLabel = payFrequency === 'biweekly' ? 'Bi-weekly'
    : payFrequency === 'monthly' ? 'Monthly' : 'Yearly'

  const handleFrequencyChange = (newFreq) => {
    setIncome1(convertIncome(income1, payFrequency, newFreq))
    setIncome2(convertIncome(income2, payFrequency, newFreq))
    setPayFrequency(newFreq)
  }

  return (
    <div className="enchanted-card p-5 h-full">
      <span className="section-label">Income</span>

      <SelectInput
        label="Pay Frequency"
        options={PAY_FREQUENCIES}
        value={payFrequency}
        onChange={handleFrequencyChange}
        compact
      />

      <div className="space-y-2 mt-2">
        <CompactValueInput
          label="Your Pay"
          min={config.min}
          max={config.max}
          step={config.step}
          value={income1}
          onChange={setIncome1}
          formatFn={formatCAD}
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
        />
      </div>

      <div className="mt-6 mb-3 pt-4 border-t border-ink-ghost">
        <span className="section-label">Mortgage Terms</span>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <label className="text-[11px] font-medium text-ink-muted">Down Payment</label>
          <span className="money text-[13px]">{downPaymentPercent}%</span>
        </div>
        <input
          type="range"
          min={5}
          max={25}
          step={5}
          value={downPaymentPercent}
          onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mt-3" />

      <SelectInput
        label="Amortization"
        options={[20,25,30].map((v) => ({ value: v, label: `${v} yr` }))}
        value={amortizationYears}
        onChange={(v) => setAmortizationYears(Number(v))}
      />

      <div className="mt-1">
        <CompactValueInput
          label="Interest Rate"
          min={1}
          max={10}
          step={0.1}
          value={interestRate}
          onChange={setInterestRate}
          formatFn={(v) => `${v.toFixed(1)}%`}
          showSteppers
        />
      </div>
    </div>
  )
}
