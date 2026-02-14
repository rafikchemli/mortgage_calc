import useAffordStore from '../../store/useAffordStore'
import SelectInput from '../shared/SelectInput'
import CompactValueInput from '../shared/CompactValueInput'
import { formatCAD } from '../shared/CurrencyDisplay'
import { grossToNetAnnual, netToGrossAnnual } from '../../calc/incomeTax'

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
  let monthly
  switch (fromFreq) {
    case 'biweekly': monthly = value * 26 / 12; break
    case 'monthly': monthly = value; break
    case 'yearly': monthly = value / 12; break
    default: monthly = value
  }
  switch (toFreq) {
    case 'biweekly': return Math.round(monthly * 12 / 26)
    case 'monthly': return Math.round(monthly)
    case 'yearly': return Math.round(monthly * 12)
    default: return Math.round(monthly)
  }
}

export default function AffordInputs() {
  const {
    income1, setIncome1,
    income2, setIncome2,
    payFrequency, setPayFrequency,
    incomeType, setIncomeType,
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

  const toAnnual = (v) => {
    switch (payFrequency) {
      case 'biweekly': return v * 26
      case 'monthly': return v * 12
      case 'yearly': return v
      default: return v * 26
    }
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
    // Convert displayed values: gross→net or net→gross
    const convert = newType === 'net'
      ? (v) => fromAnnual(grossToNetAnnual(toAnnual(v)))
      : (v) => fromAnnual(netToGrossAnnual(toAnnual(v)))
    setIncome1(convert(income1))
    if (income2 > 0) setIncome2(convert(income2))
    setIncomeType(newType)
  }

  return (
    <div className="enchanted-card p-5 h-full">
      <div className="flex items-center justify-between mb-2">
        <span className="section-label !mb-0">Income</span>
        <div className="flex rounded-lg border border-ink-ghost overflow-hidden">
          {['net', 'gross'].map((type) => (
            <button
              key={type}
              onClick={() => handleIncomeTypeChange(type)}
              className={`px-2.5 py-1 text-[11px] font-medium transition-colors ${
                incomeType === type
                  ? 'bg-gold/15 text-gold'
                  : 'bg-surface text-ink-faint hover:text-ink-muted'
              }`}
            >
              {type === 'net' ? 'Net' : 'Gross'}
            </button>
          ))}
        </div>
      </div>

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
