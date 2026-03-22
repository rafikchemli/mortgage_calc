import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useComputedAfford } from '../hooks/useComputedAfford'
import useAffordStore from '../store/useAffordStore'
import { buildShareUrl } from '../utils/shareUrl'
import AnimatedNumber from './shared/AnimatedNumber'
import CompactValueInput from './shared/CompactValueInput'
import InfoTip from './shared/InfoTip'
import { formatCAD } from './shared/CurrencyDisplay'
import TermsSection from './sections/TermsSection'
import { CLOSING_COSTS } from '../data/constants'

const COST_COLORS = ['var(--s-text-secondary)', 'var(--s-teal)', 'var(--s-gold)', 'var(--s-copper)', 'var(--s-slate)', 'var(--s-violet)']

const COST_TIPS = {
  'Mortgage (P+I)': 'Principal and interest. Canadian semi-annual compounding.',
  'Property Tax': 'Municipal + school tax. Varies by borough.',
  'Maintenance': '1% of home value per year.',
  'Home Insurance': 'Estimated $1,200/year.',
  'Utilities': 'Electricity, heating, water, internet.',
  'Condo Fees': 'Monthly condominium fees.',
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}

const spring = { type: 'spring', stiffness: 300, damping: 24 }

export default function Results({ onBack, onRestart }) {
  const computed = useComputedAfford()
  const { priceOverride, setPriceOverride, condoFeesMonthly, setCondoFeesMonthly } = useAffordStore()
  const [copied, setCopied] = useState(false)
  const [showOverride, setShowOverride] = useState(priceOverride > 0)
  const [splitMode, setSplitMode] = useState('proportional') // 'proportional' | '50/50' | 'custom'
  const [customSplit1, setCustomSplit1] = useState(50)

  const {
    maxPrice, activePrice, isOverride,
    costBreakdown, housingPercent,
    hasPartner, share1, share2,
    downPaymentAmount, downPaymentPercent,
    cmhc, welcomeTax, cashNeeded, savings, savingsGap, savingsCovered,
    stressTest, interestRate,
  } = computed

  const housingLabel = housingPercent < 30 ? 'Conservative' : housingPercent < 40 ? 'Moderate' : housingPercent < 50 ? 'Stretched' : 'Risky'
  const housingColor = housingPercent < 30 ? 'var(--s-teal)' : housingPercent < 40 ? 'var(--s-gold)' : housingPercent < 50 ? 'var(--s-copper)' : 'var(--s-danger)'

  const handleShare = useCallback(() => {
    const state = useAffordStore.getState()
    const url = buildShareUrl(state)
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-dvh"
    >
      {/* Header bar — left-aligned, no right content (dark mode toggle lives in App.jsx top-right) */}
      <div className="px-5 sm:px-8 py-4 sticky top-0 z-10" style={{ background: 'var(--s-base)' }}>
        <button onClick={onRestart} className="text-[13px] font-medium text-ink-faint hover:text-ink transition-colors">
          ← Start over
        </button>
      </div>

      <div className="px-4 sm:px-6 pb-24 max-w-2xl mx-auto">
        <motion.div initial="hidden" animate="visible" variants={stagger}>

          {/* ── Hero: The Number ── */}
          <motion.div variants={fadeUp} transition={spring} className="pt-4 pb-8 sm:pt-6 sm:pb-10">
            <p className="text-[11px] uppercase tracking-[0.14em] text-ink-faint font-medium mb-1">
              {isOverride ? 'Checking' : 'You can afford up to'}
            </p>
            <p className="display-number-hero text-5xl sm:text-6xl leading-none">
              <AnimatedNumber value={activePrice} />
            </p>
            {!isOverride && (
              <p className="text-[11px] text-ink-faint mt-1.5">
                At 35% of net income — per <a href="https://www.cmhc-schl.gc.ca/consumers/home-buying/calculators/affordability-calculator" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink-muted transition-colors">CMHC guidelines</a>
              </p>
            )}

            <button
              onClick={handleToggleOverride}
              className="text-[12px] font-medium mt-3 transition-colors"
              style={{ color: isOverride ? 'var(--s-danger)' : 'var(--s-violet)' }}
            >
              {isOverride ? '× Use calculated max' : 'Check a specific price →'}
            </button>

            {showOverride && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <CompactValueInput label="Price" min={50000} max={5000000} step={5000} value={priceOverride} onChange={setPriceOverride} formatFn={formatCAD} showSteppers />
                <CompactValueInput label="Condo Fees" min={0} max={2000} step={10} value={condoFeesMonthly} onChange={setCondoFeesMonthly} formatFn={(v) => v === 0 ? 'None' : `${formatCAD(v)}/mo`} showSteppers />
              </div>
            )}
          </motion.div>

          {/* ── Monthly Cost ── */}
          <motion.div variants={fadeUp} transition={spring} className="py-6 border-t" style={{ borderColor: 'var(--s-border)' }}>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-ink-faint mb-1">Monthly Cost</p>
                <p className="display-number text-3xl sm:text-4xl leading-none">
                  <AnimatedNumber value={costBreakdown.total} />
                  <span className="text-sm text-ink-faint font-normal ml-1">/mo</span>
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="text-[11px] font-medium" style={{ color: housingColor }}>
                    {housingPercent}% — {housingLabel}
                  </span>
                  <div className="h-1.5 w-12 rounded-full overflow-hidden" style={{ background: 'var(--s-surface-3)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((housingPercent - 15) / 45) * 100)}%`, background: housingColor }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Partner split */}
            {hasPartner && (() => {
              const total = costBreakdown.total
              let displayShare1, displayShare2
              if (splitMode === '50/50') {
                displayShare1 = Math.round(total / 2)
                displayShare2 = Math.round(total / 2)
              } else if (splitMode === 'custom') {
                displayShare1 = Math.round(total * customSplit1 / 100)
                displayShare2 = total - Math.round(total * customSplit1 / 100)
              } else {
                displayShare1 = share1
                displayShare2 = share2
              }
              return (
                <div className="mb-5">
                  {/* Split mode selector */}
                  <div className="flex gap-1.5 mb-3">
                    {[
                      { value: 'proportional', label: 'By income' },
                      { value: '50/50', label: '50/50' },
                      { value: 'custom', label: 'Custom' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setSplitMode(opt.value)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border ${
                          splitMode === opt.value
                            ? 'bg-[var(--s-text-primary)] text-[var(--s-surface-1)] border-transparent'
                            : 'text-ink-faint border-[var(--s-border)] hover:text-ink-muted'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom slider */}
                  {splitMode === 'custom' && (
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[11px] text-ink-faint w-8">{customSplit1}%</span>
                      <input
                        type="range"
                        min={10}
                        max={90}
                        step={5}
                        value={customSplit1}
                        onChange={(e) => setCustomSplit1(Number(e.target.value))}
                        className="flex-1"
                      />
                      <span className="text-[11px] text-ink-faint w-8 text-right">{100 - customSplit1}%</span>
                    </div>
                  )}

                  {/* Split amounts */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg p-3" style={{ background: 'var(--s-surface-2)' }}>
                      <p className="text-[10px] text-ink-faint uppercase tracking-wider">You</p>
                      <p className="display-number text-lg mt-0.5"><AnimatedNumber value={displayShare1} /><span className="text-[10px] text-ink-faint font-normal">/mo</span></p>
                    </div>
                    <div className="rounded-lg p-3" style={{ background: 'var(--s-surface-2)' }}>
                      <p className="text-[10px] text-ink-faint uppercase tracking-wider">Partner</p>
                      <p className="display-number text-lg mt-0.5"><AnimatedNumber value={displayShare2} /><span className="text-[10px] text-ink-faint font-normal">/mo</span></p>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Breakdown */}
            <div className="space-y-3">
              {costBreakdown.items.map((item, i) => {
                const pct = costBreakdown.total > 0 ? (item.value / costBreakdown.total) * 100 : 0
                return (
                  <div key={item.name} className="flex items-center justify-between text-[13px] gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COST_COLORS[i] }} />
                      <span className="text-ink-muted">{item.name}</span>
                      {COST_TIPS[item.name] && <InfoTip text={COST_TIPS[item.name]} />}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-20 h-1 rounded-full overflow-hidden hidden sm:block" style={{ background: 'var(--s-surface-3)' }}>
                        <div className="h-full rounded-full bar-animate" style={{ width: `${pct}%`, backgroundColor: COST_COLORS[i], opacity: 0.5 }} />
                      </div>
                      <span className="money text-[13px] w-16 text-right"><AnimatedNumber value={item.value} /></span>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* ── Cash to Close ── */}
          <motion.div variants={fadeUp} transition={spring} className="py-6 border-t" style={{ borderColor: 'var(--s-border)' }}>
            <p className="text-[10px] uppercase tracking-wider text-ink-faint mb-4">Cash to Close</p>

            <div className="space-y-2.5">
              {[
                { label: 'Down Payment', value: downPaymentAmount, tip: `${Math.round(downPaymentPercent)}% of purchase price.` },
                { label: 'Welcome Tax', value: welcomeTax.total, tip: 'Quebec transfer tax (droits de mutation).' },
                ...(cmhc.isRequired && !cmhc.exceedsMax ? [{ label: 'CMHC QST', value: cmhc.qst, tip: 'QST on CMHC premium. Paid in cash.' }] : []),
                { label: 'Notary', value: CLOSING_COSTS.notary, static: true, tip: 'Estimated legal fees.' },
                { label: 'Inspection', value: CLOSING_COSTS.homeInspection, static: true, tip: 'Pre-purchase inspection.' },
              ].map((item) => (
                <div key={item.label} className="flex items-baseline justify-between text-[13px] gap-2">
                  <span className="text-ink-muted flex items-center gap-1.5">
                    {item.label}
                    <InfoTip text={item.tip} />
                  </span>
                  {item.static
                    ? <span className="money text-[13px]">{formatCAD(item.value)}</span>
                    : <AnimatedNumber value={item.value} className="money text-[13px]" />
                  }
                </div>
              ))}
            </div>

            <div className="flex justify-between items-baseline mt-4 pt-3 border-t" style={{ borderColor: 'var(--s-border)' }}>
              <span className="text-[13px] font-semibold text-ink-muted">Total</span>
              <AnimatedNumber value={cashNeeded} className="display-number text-xl" />
            </div>

            <div
              className="mt-3 py-2.5 px-4 rounded-lg text-[12px] font-medium"
              style={{
                background: savingsCovered ? 'color-mix(in srgb, var(--s-teal) 8%, transparent)' : 'color-mix(in srgb, var(--s-danger) 8%, transparent)',
                color: savingsCovered ? 'var(--s-teal)' : 'var(--s-danger)',
              }}
            >
              {savingsCovered
                ? `Your savings cover this with ${formatCAD(savings - cashNeeded)} to spare`
                : `You need ${formatCAD(savingsGap)} more in savings`
              }
            </div>
          </motion.div>

          {/* ── Mortgage Terms + Stress Test ── */}
          <motion.div variants={fadeUp} transition={spring} className="pt-2">
            <TermsSection computed={computed} />
          </motion.div>

          {/* Footer */}
          <motion.div variants={fadeUp} transition={spring} className="pt-6 pb-4">
            <p className="text-[11px] text-ink-faint leading-relaxed">
              Based on Quebec tax rates (2025), CMHC rules, and standard welcome tax brackets. For illustration only — not financial advice.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Sticky share CTA — bottom bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t"
        style={{ background: 'var(--s-surface-1)', borderColor: 'var(--s-border)' }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between px-5 sm:px-8 py-3">
          <div className="min-w-0">
            <p className="text-[10px] text-ink-faint uppercase tracking-wider">You can afford</p>
            <p className="display-number text-lg leading-none mt-0.5"><AnimatedNumber value={activePrice} /></p>
          </div>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-[0.97] shrink-0"
            style={{
              background: copied ? 'var(--s-teal)' : 'var(--s-text-primary)',
              color: 'var(--s-surface-1)',
            }}
          >
            {copied ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Link copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                Share results
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
