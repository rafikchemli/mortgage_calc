import useAffordStore from '../../store/useAffordStore'
import SelectInput from '../shared/SelectInput'
import CompactValueInput from '../shared/CompactValueInput'
import { formatCAD } from '../shared/CurrencyDisplay'
import { DOWN_PAYMENT_OPTIONS, AMORTIZATION_OPTIONS } from '../../data/constants'

const PAY_FREQUENCIES = [
  { value: 'biweekly', label: 'Bi-weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
]

const FREQ_CONFIG = {
  biweekly: { min: 500, max: 5000, step: 50 },
  monthly:  { min: 1000, max: 12000, step: 100 },
  yearly:   { min: 15000, max: 150000, step: 1000 },
}

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
    housingPercent1, setHousingPercent1,
    housingPercent2, setHousingPercent2,
    downPaymentPercent, setDownPaymentPercent,
    interestRate, setInterestRate,
    amortizationYears, setAmortizationYears,
  } = useAffordStore()

  const config = FREQ_CONFIG[payFrequency]

  const handleFrequencyChange = (newFreq) => {
    const converted1 = convertIncome(income1, payFrequency, newFreq)
    const converted2 = convertIncome(income2, payFrequency, newFreq)
    setIncome1(converted1)
    setIncome2(converted2)
    setPayFrequency(newFreq)
  }

  const frequencyLabel = payFrequency === 'biweekly' ? 'Bi-weekly'
    : payFrequency === 'monthly' ? 'Monthly' : 'Yearly'

  return (
    <div className="enchanted-card p-5">
      <span className="section-label">Income</span>
      <div className="mt-3" />

      <SelectInput
        label="Pay Frequency"
        options={PAY_FREQUENCIES}
        value={payFrequency}
        onChange={handleFrequencyChange}
        compact
      />

      <div className="grid grid-cols-2 gap-3 mt-3">
        <CompactValueInput
          label={`Your ${frequencyLabel} Pay`}
          min={config.min}
          max={config.max}
          step={config.step}
          value={income1}
          onChange={setIncome1}
          formatFn={formatCAD}
        />
        <CompactValueInput
          label={`Partner's ${frequencyLabel} Pay`}
          min={0}
          max={config.max}
          step={config.step}
          value={income2}
          onChange={setIncome2}
          formatFn={(v) => v === 0 ? 'None' : formatCAD(v)}
          tooltip="Set to $0 for solo buyer"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <CompactValueInput
          label="Your Housing %"
          min={25}
          max={60}
          step={1}
          value={housingPercent1}
          onChange={setHousingPercent1}
          formatFn={(v) => `${v}%`}
          showSteppers
          tooltip="25-35% recommended"
        />
        {income2 > 0 ? (
          <CompactValueInput
            label="Partner's Housing %"
            min={25}
            max={60}
            step={1}
            value={housingPercent2}
            onChange={setHousingPercent2}
            formatFn={(v) => `${v}%`}
            showSteppers
            tooltip="25-35% recommended"
          />
        ) : (
          <div />
        )}
      </div>

      <div className="mt-4 mb-3 pt-3 border-t border-ink-ghost">
        <span className="section-label">Mortgage Terms</span>
      </div>

      <SelectInput
        label="Down Payment"
        options={DOWN_PAYMENT_OPTIONS.map((v) => ({ value: v, label: `${v}%` }))}
        value={downPaymentPercent}
        onChange={(v) => setDownPaymentPercent(Number(v))}
      />

      <SelectInput
        label="Amortization"
        options={AMORTIZATION_OPTIONS.map((v) => ({ value: v, label: `${v} yr` }))}
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
