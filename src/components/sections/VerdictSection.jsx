import { useState } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import useAffordStore from '../../store/useAffordStore'
import AnimatedNumber from '../shared/AnimatedNumber'
import CompactValueInput from '../shared/CompactValueInput'
import InfoTip from '../shared/InfoTip'
import { formatCAD } from '../shared/CurrencyDisplay'

const COST_COLORS = ['var(--s-text-primary)', 'var(--s-teal)', 'var(--s-gold)', 'var(--s-copper)', 'var(--s-slate)', 'var(--s-teal)']

const COST_TIPS = {
  'Mortgage (P+I)': 'Principal and interest. Canadian semi-annual compounding.',
  'Property Tax': 'Municipal + school tax. Varies by borough.',
  'Maintenance': '1% of home value per year.',
  'Home Insurance': 'Estimated $1,200/year.',
  'Utilities': 'Electricity, heating, water, internet.',
  'Condo Fees': 'Monthly condominium fees.',
}

export default function VerdictSection({ computed }) {
  const { priceOverride, setPriceOverride, condoFeesMonthly, setCondoFeesMonthly } = useAffordStore()
  const [showOverride, setShowOverride] = useState(priceOverride > 0)

  const {
    maxPrice, activePrice, isOverride,
    costBreakdown, housingPercent,
    hasPartner, share1, share2,
    downPaymentAmount, downPaymentPercent,
  } = computed

  const housingLabel = housingPercent < 30 ? 'Conservative' : housingPercent < 40 ? 'Moderate' : housingPercent < 50 ? 'Stretched' : 'Risky'
  const housingColor = housingPercent < 30 ? 'var(--s-teal)' : housingPercent < 40 ? 'var(--s-gold)' : housingPercent < 50 ? 'var(--s-copper)' : 'var(--s-danger)'

  const handleToggleOverride = () => {
    if (showOverride) {
      setPriceOverride(0)
      setCondoFeesMonthly(0)
      setShowOverride(false)
    } else {
      setPriceOverride(maxPrice)
      setShowOverride(true)
    }
  }

  return (
    <div className="card p-5 sm:p-6">
      {/* Max affordable */}
      <div className="mb-1">
        <p className="text-[11px] uppercase tracking-[0.14em] text-ink-faint font-medium">
          {isOverride ? 'Checking' : 'You can afford up to'}
        </p>
        <p className="display-number-hero text-4xl sm:text-5xl mt-1 leading-none">
          <AnimatedNumber value={activePrice} />
        </p>
        {!isOverride && (
          <p className="text-[11px] text-ink-faint mt-1.5">
            Based on your chosen housing ratio
            <InfoTip text="This is the maximum price where your monthly housing costs (mortgage, taxes, insurance, maintenance, utilities) stay within your chosen percentage of take-home pay. CMHC's official GDS guideline is 39% of gross income." />
          </p>
        )}
      </div>

      {/* Toggle: check a specific property */}
      <button
        onClick={handleToggleOverride}
        className="text-[12px] font-medium mt-3 mb-4 transition-colors"
        style={{ color: isOverride ? 'var(--s-danger)' : 'var(--s-teal)' }}
      >
        {isOverride ? '× Clear — use calculated max' : 'Check a specific property →'}
      </button>

      {/* Override inputs */}
      <AnimatePresence>
        {showOverride && (
          <m.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="origin-top"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 pb-4 border-b" style={{ borderColor: 'var(--s-border)' }}>
              <CompactValueInput
                label="Property Price"
                min={50000}
                max={5000000}
                step={5000}
                value={priceOverride}
                onChange={setPriceOverride}
                formatFn={formatCAD}
                showSteppers
              />
              <CompactValueInput
                label="Condo Fees"
                min={0}
                max={2000}
                step={10}
                value={condoFeesMonthly}
                onChange={setCondoFeesMonthly}
                formatFn={(v) => v === 0 ? 'None' : `${formatCAD(v)}/mo`}
                tooltip="Monthly condo fees. $0 if not a condo."
                showSteppers
              />
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Monthly cost — the real answer */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-ink-faint">Monthly Cost</p>
          <p className="display-number text-3xl sm:text-4xl mt-0.5 leading-none">
            <AnimatedNumber value={costBreakdown.total} />
            <span className="text-sm text-ink-faint font-normal ml-1">/mo</span>
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1 w-14 rounded-full overflow-hidden" style={{ background: 'var(--s-surface-3)' }}>
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${Math.min(100, ((housingPercent - 15) / 45) * 100)}%`,
                  background: housingColor,
                }}
              />
            </div>
            <span className="text-[11px] font-medium" style={{ color: housingColor }}>
              {housingPercent}% of income — {housingLabel}
            </span>
          </div>
        </div>
        <div className="flex gap-5">
          <div>
            <p className="text-[10px] text-ink-faint uppercase tracking-wider">Down</p>
            <p className="display-number text-lg mt-0.5"><AnimatedNumber value={downPaymentAmount} /></p>
            <p className="text-[10px] text-ink-faint">{Math.round(downPaymentPercent)}%</p>
          </div>
          <div>
            <p className="text-[10px] text-ink-faint uppercase tracking-wider">Yearly</p>
            <p className="display-number text-lg mt-0.5"><AnimatedNumber value={costBreakdown.total * 12} /></p>
          </div>
        </div>
      </div>

      {/* Partner split */}
      {hasPartner && (
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl p-3" style={{ background: 'var(--s-surface-2)' }}>
            <p className="text-[10px] text-ink-faint uppercase tracking-wider">You pay</p>
            <p className="display-number text-base mt-0.5"><AnimatedNumber value={share1} /><span className="text-[10px] text-ink-faint font-normal ml-0.5">/mo</span></p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'var(--s-surface-2)' }}>
            <p className="text-[10px] text-ink-faint uppercase tracking-wider">Partner pays</p>
            <p className="display-number text-base mt-0.5"><AnimatedNumber value={share2} /><span className="text-[10px] text-ink-faint font-normal ml-0.5">/mo</span></p>
          </div>
        </div>
      )}

      {/* Cost breakdown */}
      <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: 'var(--s-border)' }}>
        {costBreakdown.items.map((item, i) => {
          const pct = costBreakdown.total > 0 ? (item.value / costBreakdown.total) * 100 : 0
          return (
            <div key={item.name}>
              <div className="flex items-center justify-between text-[12px] mb-1 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COST_COLORS[i] }} />
                  <span className="text-ink-muted truncate">{item.name}</span>
                  {COST_TIPS[item.name] && <InfoTip text={COST_TIPS[item.name]} />}
                </div>
                <AnimatedNumber value={item.value} className="money text-[12px] shrink-0" />
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--s-surface-3)' }}>
                <div
                  className="h-full rounded-full bar-animate"
                  style={{ width: `${pct}%`, backgroundColor: COST_COLORS[i], opacity: 0.6 }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
