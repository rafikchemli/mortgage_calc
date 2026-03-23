import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useComputedAfford } from '../hooks/useComputedAfford'
import useAffordStore from '../store/useAffordStore'
import { buildShareUrl } from '../utils/shareUrl'
import AnimatedNumber from './shared/AnimatedNumber'
import InfoTip from './shared/InfoTip'
import { formatCAD } from './shared/CurrencyDisplay'
import EditSheet from './sections/EditSheet'
import { CLOSING_COSTS } from '../data/constants'

const COST_TIPS = {
  'Mortgage (P+I)': 'Principal and interest. Canadian semi-annual compounding.',
  'Property Tax': 'Municipal + school tax. Varies by borough.',
  'Maintenance': '1% of home value per year.',
  'Home Insurance': 'Estimated $1,200/year.',
  'Utilities': 'Electricity, heating, water, internet.',
  'Condo Fees': 'Monthly condominium fees.',
}

const COST_BAR_COLORS = [
  'var(--s-gold)',
  'var(--s-teal)',
  'var(--s-copper)',
  'var(--s-slate)',
  'var(--s-text-tertiary)',
  'var(--s-gold-muted)',
]

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

const spring = { type: 'spring', stiffness: 300, damping: 24 }

export default function Results({ onBack, onRestart, isDark, toggleDark }) {
  const computed = useComputedAfford()
  const store = useAffordStore()
  const [copied, setCopied] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [splitMode, setSplitMode] = useState('proportional')
  const [customSplit1, setCustomSplit1] = useState(50)

  const {
    maxPrice,
    costBreakdown, housingPercent,
    hasPartner, share1, share2,
    monthlyIncome1, monthlyIncome2, totalMonthlyIncome,
    downPaymentAmount, downPaymentPercent,
    cmhc, welcomeTax, cashNeeded, savings, savingsGap, savingsCovered,
    interestRate, amortizationYears, locationId,
  } = computed

  const housingColor = housingPercent < 30 ? 'var(--s-teal)' : housingPercent < 40 ? 'var(--s-gold)' : housingPercent < 50 ? 'var(--s-copper)' : 'var(--s-danger)'
  const colorFor = (pct) => pct < 30 ? 'var(--s-teal)' : pct < 40 ? 'var(--s-gold)' : pct < 50 ? 'var(--s-copper)' : 'var(--s-danger)'

  const handleShare = useCallback(() => {
    const url = buildShareUrl(useAffordStore.getState())
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  // Split calculations
  const total = costBreakdown.total
  let displayShare1, displayShare2
  if (splitMode === '50/50') {
    displayShare1 = Math.round(total / 2); displayShare2 = Math.round(total / 2)
  } else if (splitMode === 'custom') {
    displayShare1 = Math.round(total * customSplit1 / 100); displayShare2 = total - displayShare1
  } else {
    displayShare1 = share1; displayShare2 = share2
  }
  const pctOfIncome1 = monthlyIncome1 > 0 ? Math.round((displayShare1 / monthlyIncome1) * 100) : 0
  const pctOfIncome2 = monthlyIncome2 > 0 ? Math.round((displayShare2 / monthlyIncome2) * 100) : 0

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="min-h-dvh">
      {/* ── Header ── */}
      <div className="px-5 sm:px-8 py-4 sticky top-0 z-10 flex items-center justify-between" style={{ background: 'var(--s-base)' }}>
        <button onClick={onRestart} className="text-[13px] font-medium text-ink-faint hover:text-ink transition-colors">
          ← Start over
        </button>
        <div className="flex items-center gap-1">
          <button onClick={handleShare} className="p-2 rounded-lg text-ink-faint hover:text-ink hover:bg-[var(--s-surface-2)] transition-all active:scale-95" aria-label="Share results">
            {copied ? (
              <svg className="w-4 h-4" style={{ color: 'var(--s-teal)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            )}
          </button>
          <button onClick={(e) => toggleDark(e)} className="p-2 rounded-lg text-ink-faint hover:text-ink hover:bg-[var(--s-surface-2)] transition-all active:scale-95" aria-label="Toggle dark mode">
          {isDark ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 sm:px-8 pb-12">
        <motion.div initial="hidden" animate="visible" variants={stagger}>

          {/* ═══════════ HERO ═══════════ */}
          <motion.div variants={fadeUp} transition={spring} className="pb-6">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-ink-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              <p className="text-[12px] uppercase tracking-[0.16em] text-ink-faint font-medium">
                You can afford up to
              </p>
            </div>
            <div className="flex items-end justify-between">
              <p className="display-number-hero text-5xl sm:text-7xl leading-none">
                <AnimatedNumber value={maxPrice} />
              </p>
              <button
                onClick={() => setShowEdit(true)}
                className="shrink-0 mb-1 sm:mb-2 p-2 rounded-lg text-ink-faint hover:text-ink hover:bg-[var(--s-surface-2)] transition-all active:scale-90"
                aria-label="Adjust your numbers"
                title="Adjust your numbers"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
              </button>
            </div>
            <p className="text-[12px] text-ink-faint mt-2">
              At {computed.housingBudgetPercent}% of take-home pay · <a href="https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance/calculating-gds-tds" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink-muted transition-colors">CMHC uses 39% gross</a>
            </p>

            {/* Savings verdict */}
            <div
              className="mt-4 py-2.5 px-4 rounded-xl text-[12px] font-medium flex items-center gap-2"
              style={{
                background: savingsCovered ? 'color-mix(in srgb, var(--s-teal) 8%, transparent)' : 'color-mix(in srgb, var(--s-danger) 8%, transparent)',
                color: savingsCovered ? 'var(--s-teal)' : 'var(--s-danger)',
              }}
            >
              {savingsCovered ? (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
              )}
              {savingsCovered
                ? `Savings cover closing costs — ${formatCAD(savings - cashNeeded)} to spare`
                : `You need ${formatCAD(savingsGap)} more in savings to close`
              }
            </div>
          </motion.div>

          {/* ═══════════ MONTHLY COST ═══════════ */}
          <motion.div variants={fadeUp} transition={spring} className="py-6 border-t" style={{ borderColor: 'var(--s-border)' }}>
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-ink-faint mb-1">Monthly cost</p>
                <p className="display-number text-4xl sm:text-5xl leading-none">
                  <AnimatedNumber value={total} />
                </p>
              </div>
              <div className="text-right mb-1">
                <p className="text-[14px] font-semibold tabular-nums" style={{ color: housingColor }}>{housingPercent}%</p>
                <p className="text-[10px] text-ink-faint">of take-home</p>
              </div>
            </div>

            {/* FIX #6: Stacked bar visualization */}
            <div className="flex h-3 rounded-full overflow-hidden" style={{ background: 'var(--s-surface-3)' }}>
              {costBreakdown.items.map((item, i) => {
                const pct = total > 0 ? (item.value / total) * 100 : 0
                return (
                  <motion.div
                    key={item.name}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.3 + i * 0.06, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                    style={{ background: COST_BAR_COLORS[i % COST_BAR_COLORS.length] }}
                  />
                )
              })}
            </div>

            {/* Legend — always visible, compact */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
              {costBreakdown.items.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COST_BAR_COLORS[i % COST_BAR_COLORS.length] }} />
                  <span className="text-[10px] text-ink-faint">{item.name}</span>
                </div>
              ))}
            </div>

            {/* Detailed breakdown — collapsible */}
            <button onClick={() => setShowBreakdown((v) => !v)} className="flex items-center gap-1.5 mt-4 text-[12px] text-ink-faint hover:text-ink-muted transition-colors">
              <span>{showBreakdown ? 'Hide' : 'Show'} details</span>
              <motion.svg animate={{ rotate: showBreakdown ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </motion.svg>
            </button>
            <AnimatePresence>
              {showBreakdown && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="overflow-hidden">
                  <div className="space-y-2 pt-3">
                    {costBreakdown.items.map((item, i) => (
                      <div key={item.name} className="flex items-baseline justify-between">
                        <span className="text-[13px] text-ink-muted flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COST_BAR_COLORS[i % COST_BAR_COLORS.length] }} />
                          {item.name}
                          {COST_TIPS[item.name] && <InfoTip text={COST_TIPS[item.name]} />}
                        </span>
                        <span className="text-[13px] tabular-nums text-ink" style={{ fontFamily: 'var(--font-mono)' }}><AnimatedNumber value={item.value} /></span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* ═══════════ PARTNER SPLIT ═══════════ */}
          {hasPartner && (
            <motion.div variants={fadeUp} transition={spring} className="py-6 border-t" style={{ borderColor: 'var(--s-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] uppercase tracking-wider text-ink-faint">How do you split?</p>
                <div className="flex gap-1">
                  {[
                    { value: 'proportional', label: 'By income' },
                    { value: '50/50', label: '50/50' },
                    { value: 'custom', label: 'Custom' },
                  ].map((opt) => (
                    <button key={opt.value} onClick={() => setSplitMode(opt.value)}
                      className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                        splitMode === opt.value ? 'bg-[var(--s-text-primary)] text-[var(--s-surface-1)]' : 'text-ink-faint hover:text-ink-muted'
                      }`}
                    >{opt.label}</button>
                  ))}
                </div>
              </div>

              {splitMode === 'custom' && (
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[11px] text-ink-faint w-8 shrink-0">{customSplit1}%</span>
                  <input type="range" min={10} max={90} step={5} value={customSplit1} onChange={(e) => setCustomSplit1(Number(e.target.value))} className="flex-1" />
                  <span className="text-[11px] text-ink-faint w-8 text-right shrink-0">{100 - customSplit1}%</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'You', amount: displayShare1, pct: pctOfIncome1 },
                  { label: 'Partner', amount: displayShare2, pct: pctOfIncome2 },
                ].map((p) => (
                  <div key={p.label} className="rounded-xl p-4" style={{ background: 'var(--s-surface-2)' }}>
                    <p className="text-[10px] text-ink-faint uppercase tracking-wider">{p.label}</p>
                    <p className="display-number text-xl mt-1"><AnimatedNumber value={p.amount} /><span className="text-[10px] text-ink-faint font-normal">/mo</span></p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <div className="h-1 flex-1 rounded-full overflow-hidden" style={{ background: 'var(--s-surface-3)' }}>
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((p.pct - 10) / 50) * 100)}%`, background: colorFor(p.pct) }} />
                      </div>
                      <span className="text-[11px] font-medium shrink-0" style={{ color: colorFor(p.pct) }}>{p.pct}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contextual share — the emotional moment */}
              <motion.button
                onClick={handleShare}
                initial={{ opacity: 0, y: 8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  boxShadow: copied
                    ? '0 0 0 rgba(0,0,0,0)'
                    : [
                        '0 0 12px color-mix(in srgb, var(--s-gold) 15%, transparent)',
                        '0 0 24px color-mix(in srgb, var(--s-gold) 25%, transparent)',
                        '0 0 12px color-mix(in srgb, var(--s-gold) 15%, transparent)',
                      ],
                }}
                transition={{
                  delay: 0.4,
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1.5 },
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="mt-4 w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-[13px] font-semibold"
                style={{
                  background: copied ? 'var(--s-teal)' : 'var(--s-text-primary)',
                  color: 'var(--s-surface-1)',
                }}
              >
                {copied ? (
                  <>
                    <motion.svg
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                    Link copied — send it over!
                  </>
                ) : (
                  <>
                    <motion.svg
                      animate={{ x: [0, 2, 0], y: [0, -2, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: 'easeInOut' }}
                      className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </motion.svg>
                    Send this to your partner
                  </>
                )}
              </motion.button>
            </motion.div>
          )}

          {/* ═══════════ CASH TO CLOSE ═══════════ */}
          <motion.div variants={fadeUp} transition={spring} className="py-6 border-t" style={{ borderColor: 'var(--s-border)' }}>
            <div className="flex items-end justify-between mb-4">
              <p className="text-[10px] uppercase tracking-wider text-ink-faint">Cash to close</p>
              <p className="display-number text-2xl"><AnimatedNumber value={cashNeeded} /></p>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Down Payment', value: downPaymentAmount, tip: `${Math.round(downPaymentPercent)}% of purchase price.` },
                { label: 'Welcome Tax', value: welcomeTax.total, tip: 'Quebec transfer tax (droits de mutation).' },
                ...(cmhc.isRequired && !cmhc.exceedsMax ? [{ label: 'CMHC QST', value: cmhc.qst, tip: 'QST on CMHC premium.' }] : []),
                { label: 'Notary', value: CLOSING_COSTS.notary, static: true, tip: 'Estimated legal fees.' },
                { label: 'Inspection', value: CLOSING_COSTS.homeInspection, static: true, tip: 'Pre-purchase inspection.' },
              ].map((item) => (
                <div key={item.label} className="flex items-baseline justify-between py-0.5">
                  <span className="text-[13px] text-ink-faint flex items-center gap-1.5">
                    {item.label}
                    <InfoTip text={item.tip} />
                  </span>
                  {item.static
                    ? <span className="text-[13px] tabular-nums text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{formatCAD(item.value)}</span>
                    : <span className="text-[13px] tabular-nums text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}><AnimatedNumber value={item.value} /></span>
                  }
                </div>
              ))}
            </div>
          </motion.div>

          {/* ═══════════ FOOTER ═══════════ */}
          <motion.div variants={fadeUp} transition={spring} className="pt-4 pb-6 border-t" style={{ borderColor: 'var(--s-border)' }}>
            <p className="text-[11px] text-ink-faint leading-relaxed">
              Calculations use take-home pay (not gross income). Official <a href="https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance/calculating-gds-tds" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">CMHC GDS/TDS ratios</a> use gross income and may differ. Tax rates: Quebec 2025. For illustration only — not financial advice.
            </p>
          </motion.div>

        </motion.div>
      </div>

      {/* ═══════════ EDIT SHEET ═══════════ */}
      <EditSheet open={showEdit} onClose={() => setShowEdit(false)} />
    </motion.div>
  )
}
