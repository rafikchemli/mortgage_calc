import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAffordStore from '../../store/useAffordStore'
import SelectInput from '../shared/SelectInput'
import CompactValueInput from '../shared/CompactValueInput'
import AnimatedNumber from '../shared/AnimatedNumber'
import { formatCAD } from '../shared/CurrencyDisplay'
import { LOCATIONS } from '../../data/constants'

export default function TermsSection({ computed }) {
  const {
    interestRate, setInterestRate,
    amortizationYears, setAmortizationYears,
    downPaymentPercent, setDownPaymentPercent,
    locationId, setLocationId,
  } = useAffordStore()

  const [showLocation, setShowLocation] = useState(false)
  const [showStress, setShowStress] = useState(false)

  const { stressTest } = computed
  const stressedRate = interestRate + 2

  return (
    <>
      {/* Mortgage Terms */}
      <div className="card p-5 sm:p-6">
        <span className="section-label">Mortgage Terms</span>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
          <SelectInput
            label="Down Payment"
            options={[5, 10, 15, 20, 25].map((v) => ({ value: v, label: `${v}%` }))}
            value={downPaymentPercent}
            onChange={(v) => setDownPaymentPercent(Number(v))}
          />
          <SelectInput
            label="Amortization"
            options={[20, 25, 30].map((v) => ({ value: v, label: `${v} yr` }))}
            value={amortizationYears}
            onChange={(v) => setAmortizationYears(Number(v))}
          />
        </div>
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
            slider sliderMin={1} sliderMax={10} sliderStep={0.1}
          />
        </div>

        {/* Location */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--s-border)' }}>
          <button onClick={() => setShowLocation((v) => !v)} className="flex items-center w-full">
            <span className="section-label">Location</span>
            <span className="text-[11px] text-ink-faint ml-2">
              {LOCATIONS.find((l) => l.id === locationId)?.label || locationId}
            </span>
            <motion.svg
              animate={{ rotate: showLocation ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="w-3 h-3 ml-auto text-ink-faint"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
          <AnimatePresence>
            {showLocation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="overflow-hidden"
              >
                <select
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  className="w-full mt-3 px-3 py-2 rounded-lg text-[13px] font-medium border text-ink focus:outline-none focus:ring-2 focus:ring-violet/20 appearance-none cursor-pointer"
                  style={{
                    background: 'var(--s-surface-2)',
                    borderColor: 'var(--s-border)',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2378716C' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 10px center',
                  }}
                >
                  <optgroup label="Montreal">
                    {LOCATIONS.filter((l) => l.group === 'Montreal').map((l) => (
                      <option key={l.id} value={l.id}>{l.label}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Other">
                    {LOCATIONS.filter((l) => l.group === 'Other').map((l) => (
                      <option key={l.id} value={l.id}>{l.label}</option>
                    ))}
                  </optgroup>
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stress Test */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setShowStress((v) => !v)}
          className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-[var(--s-surface-2)] transition-colors"
        >
          <div className="flex items-baseline gap-3">
            <span className="section-label">Stress Test</span>
            <span className="text-[11px] text-ink-faint">What if rates rise +2%?</span>
          </div>
          <motion.svg
            animate={{ rotate: showStress ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-4 h-4 text-ink-faint shrink-0"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>
        <AnimatePresence>
          {showStress && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 sm:px-6 sm:pb-6">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl p-4" style={{ background: 'var(--s-surface-2)' }}>
                    <p className="text-[11px] text-ink-faint mb-1">Current ({interestRate.toFixed(1)}%)</p>
                    <p className="display-number text-lg"><AnimatedNumber value={stressTest.currentMonthly} /></p>
                    <p className="text-[10px] text-ink-faint mt-1">/mo</p>
                  </div>
                  <div className="rounded-xl p-4 border border-danger/15" style={{ background: 'var(--s-surface-2)' }}>
                    <p className="text-[11px] text-ink-faint mb-1">Stressed ({stressedRate.toFixed(1)}%)</p>
                    <p className="display-number text-lg"><AnimatedNumber value={stressTest.stressedMonthly} /></p>
                    <p className="text-[10px] text-ink-faint mt-1">/mo</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t text-[12px]" style={{ borderColor: 'var(--s-border)' }}>
                  <span className="text-ink-faint">Monthly increase </span>
                  <AnimatedNumber value={stressTest.increase} className="money text-[12px]" style={{ color: 'var(--s-copper)' }} format={(v) => `+${formatCAD(Math.round(v))}`} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
