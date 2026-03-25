import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import useAffordStore from '../../store/useAffordStore'
import { useShallow } from 'zustand/react/shallow'
import { useRafCallback } from '../../hooks/useDebounce'
import { formatCAD } from '../shared/CurrencyDisplay'
import { LOCATIONS } from '../../data/constants'

const FREQ_OPTIONS = { biweekly: 'Bi-weekly', monthly: 'Monthly', yearly: 'Yearly' }

function Section({ title, children }) {
  return (
    <div className="py-4 border-b" style={{ borderColor: 'var(--s-border)' }}>
      <p className="text-[10px] uppercase tracking-wider text-ink-faint mb-3">{title}</p>
      {children}
    </div>
  )
}

function InlineInput({ label, value, onChange, formatFn, inputMode = 'decimal' }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')

  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13px] text-ink-muted">{label}</span>
      {editing ? (
        <input
          type="text"
          inputMode={inputMode}
          value={text}
          onChange={(e) => setText(e.target.value.replace(/[^0-9.]/g, ''))}
          onBlur={() => {
            setEditing(false)
            const v = Number(text)
            if (!isNaN(v) && v >= 0) onChange(v)
          }}
          onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
          autoFocus
          className="w-28 text-right text-[14px] font-medium bg-transparent border-b-2 focus:outline-none py-0.5"
          style={{ borderColor: 'var(--s-gold)', color: 'var(--s-text-primary)', fontFamily: 'var(--font-mono)' }}
        />
      ) : (
        <button
          onClick={() => { setEditing(true); setText(String(value)) }}
          className="text-[14px] font-medium text-right py-0.5 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--s-text-primary)', fontFamily: 'var(--font-mono)' }}
        >
          {formatFn ? formatFn(value) : value}
        </button>
      )}
    </div>
  )
}

function PillRow({ options, value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all border ${
            String(value) === String(opt.value)
              ? 'bg-[var(--s-text-primary)] text-[var(--s-surface-1)] border-transparent'
              : 'text-ink-faint border-[var(--s-border)]'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function EditSheet({ open, onClose, computed }) {
  const store = useAffordStore(useShallow((s) => ({
    income1: s.income1, income2: s.income2,
    payFrequency1: s.payFrequency1, payFrequency2: s.payFrequency2,
    incomeType: s.incomeType, savings: s.savings,
    housingBudgetPercent: s.housingBudgetPercent,
    downPaymentPercent: s.downPaymentPercent, amortizationYears: s.amortizationYears,
    interestRate: s.interestRate, locationId: s.locationId,
    setIncome1: s.setIncome1, setIncome2: s.setIncome2,
    setPayFrequency1: s.setPayFrequency1, setPayFrequency2: s.setPayFrequency2,
    setIncomeType: s.setIncomeType, setSavings: s.setSavings,
    setHousingBudgetPercent: s.setHousingBudgetPercent,
    setDownPaymentPercent: s.setDownPaymentPercent, setAmortizationYears: s.setAmortizationYears,
    setInterestRate: s.setInterestRate, setLocationId: s.setLocationId,
  })))
  const { maxPrice, costBreakdown, housingPercent } = computed
  const housingColor = housingPercent < 30 ? 'var(--s-teal)' : housingPercent < 40 ? 'var(--s-gold)' : housingPercent < 50 ? 'var(--s-copper)' : 'var(--s-danger)'
  const throttledSetBudget = useRafCallback((v) => store.setHousingBudgetPercent(v))
  const throttledSetRate = useRafCallback((v) => store.setInterestRate(v))

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.4)', willChange: 'opacity' }}
          />

          {/* Sheet */}
          <m.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-2xl"
            style={{ background: 'var(--s-surface-1)', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', willChange: 'transform' }}
          >
            {/* Top bar */}
            <div className="sticky top-0 z-10 pt-4 pb-2" style={{ background: 'var(--s-surface-1)' }} />

            <div className="px-5 pb-24 max-w-lg mx-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[15px] font-semibold text-ink">Adjust</h3>
              </div>

              {/* Income */}
              <Section title="Income">
                <InlineInput label="Your pay" value={store.income1} onChange={store.setIncome1} formatFn={formatCAD} />
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[13px] text-ink-muted">Frequency</span>
                  <PillRow
                    options={Object.entries(FREQ_OPTIONS).map(([value, label]) => ({ value, label }))}
                    value={store.payFrequency1}
                    onChange={store.setPayFrequency1}
                  />
                </div>
                {store.income2 > 0 && (
                  <>
                    <InlineInput label="Partner's pay" value={store.income2} onChange={store.setIncome2} formatFn={formatCAD} />
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-[13px] text-ink-muted">Frequency</span>
                      <PillRow
                        options={Object.entries(FREQ_OPTIONS).map(([value, label]) => ({ value, label }))}
                        value={store.payFrequency2}
                        onChange={store.setPayFrequency2}
                      />
                    </div>
                  </>
                )}
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[13px] text-ink-muted">Income type</span>
                  <PillRow
                    options={[{ value: 'net', label: 'Net' }, { value: 'gross', label: 'Gross' }]}
                    value={store.incomeType}
                    onChange={store.setIncomeType}
                  />
                </div>
              </Section>

              {/* Savings */}
              <Section title="Savings">
                <InlineInput label="Total savings" value={store.savings} onChange={store.setSavings} formatFn={formatCAD} />
              </Section>

              {/* Mortgage */}
              <Section title="Mortgage">
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[13px] text-ink-muted">Housing budget</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min={15} max={60} step={1}
                      value={store.housingBudgetPercent}
                      onChange={(e) => throttledSetBudget(Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-[14px] font-medium tabular-nums w-10 text-right" style={{ fontFamily: 'var(--font-display)' }}>
                      {store.housingBudgetPercent}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[13px] text-ink-muted">Down payment</span>
                  <PillRow
                    options={[5, 10, 15, 20, 25].map((v) => ({ value: v, label: `${v}%` }))}
                    value={store.downPaymentPercent}
                    onChange={(v) => store.setDownPaymentPercent(Number(v))}
                  />
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[13px] text-ink-muted">Amortization</span>
                  <PillRow
                    options={[20, 25, 30].map((v) => ({ value: v, label: `${v} yr` }))}
                    value={store.amortizationYears}
                    onChange={(v) => store.setAmortizationYears(Number(v))}
                  />
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[13px] text-ink-muted">Interest rate</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="range" min={1} max={10} step={0.1}
                      value={store.interestRate}
                      onChange={(e) => throttledSetRate(Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-[14px] font-medium tabular-nums w-12 text-right" style={{ fontFamily: 'var(--font-display)' }}>
                      {store.interestRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-[13px] text-ink-muted">Location</span>
                  <select
                    value={store.locationId}
                    onChange={(e) => store.setLocationId(e.target.value)}
                    className="text-[13px] font-medium text-ink bg-transparent border-0 focus:outline-none text-right appearance-none cursor-pointer pr-4"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%2378716C' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0 center',
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
                </div>
              </Section>
            </div>

            {/* Sticky live preview */}
            <div
              className="sticky bottom-0 left-0 right-0 border-t px-5 py-3"
              style={{ background: 'var(--s-surface-1)', borderColor: 'var(--s-border)' }}
            >
              <div className="max-w-lg mx-auto flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-ink-faint">Max price</p>
                    <m.p
                      key={maxPrice}
                      initial={{ opacity: 0.5, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[15px] font-bold tabular-nums leading-tight"
                      style={{ color: 'var(--s-gold)', fontFamily: 'var(--font-display)' }}
                    >
                      {formatCAD(maxPrice)}
                    </m.p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-ink-faint">Monthly</p>
                    <m.p
                      key={costBreakdown.total}
                      initial={{ opacity: 0.5, y: 2 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[15px] font-bold tabular-nums leading-tight"
                      style={{ color: housingColor, fontFamily: 'var(--font-display)' }}
                    >
                      {formatCAD(costBreakdown.total)}
                    </m.p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.97]"
                  style={{ background: 'var(--s-text-primary)', color: 'var(--s-surface-1)' }}
                >
                  Done
                </button>
              </div>
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  )
}
