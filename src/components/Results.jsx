import { useState, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
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

const COST_BAR_COLORS = ['var(--s-gold)', 'var(--s-teal)', 'var(--s-copper)', 'var(--s-slate)', 'var(--s-text-tertiary)', 'var(--s-gold-muted)']

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } } }
const spring = { type: 'spring', stiffness: 300, damping: 24 }

/* ── SVG donut chart for desktop ── */
function CostDonut({ items, total, size = 140 }) {
  const r = 54
  const circumference = 2 * Math.PI * r
  let offset = 0

  return (
    <svg width={size} height={size} viewBox="0 0 140 140" className="shrink-0">
      <circle cx="70" cy="70" r={r} fill="none" stroke="var(--s-surface-3)" strokeWidth="12" />
      {items.map((item, i) => {
        const pct = total > 0 ? item.value / total : 0
        const dash = circumference * pct
        const gap = circumference - dash
        const currentOffset = offset
        offset += pct * circumference
        return (
          <m.circle
            key={item.name}
            cx="70" cy="70" r={r}
            fill="none"
            stroke={COST_BAR_COLORS[i % COST_BAR_COLORS.length]}
            strokeWidth="12"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-currentOffset}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            initial={{ strokeDasharray: `0 ${circumference}` }}
            animate={{ strokeDasharray: `${dash} ${gap}` }}
            transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
          />
        )
      })}
      <text x="70" y="65" textAnchor="middle" fill="var(--s-text-primary)" fontSize="18" fontWeight="700" style={{ fontFamily: 'var(--font-display)' }}>
        {formatCAD(total)}
      </text>
      <text x="70" y="82" textAnchor="middle" fill="var(--s-text-tertiary)" fontSize="10">
        /month
      </text>
    </svg>
  )
}

export default function Results({ onBack, onRestart, isDark, toggleDark }) {
  const computed = useComputedAfford()
  const [copied, setCopied] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const {
    splitMode, customSplit: customSplit1, setSplitMode, setCustomSplit: setCustomSplit1,
    budgetPercent1, budgetPercent2, setBudgetPercent1, setBudgetPercent2,
  } = useAffordStore()

  const {
    maxPrice, costBreakdown, housingPercent,
    hasPartner, share1, share2,
    monthlyIncome1, monthlyIncome2,
    downPaymentAmount, downPaymentPercent,
    cmhc, welcomeTax, cashNeeded, savings, savingsGap, savingsCovered,
  } = computed

  const housingColor = housingPercent < 30 ? 'var(--s-teal)' : housingPercent < 40 ? 'var(--s-gold)' : housingPercent < 50 ? 'var(--s-copper)' : 'var(--s-danger)'
  const colorFor = (pct) => pct < 30 ? 'var(--s-teal)' : pct < 40 ? 'var(--s-gold)' : pct < 50 ? 'var(--s-copper)' : 'var(--s-danger)'

  const handleShare = useCallback(() => {
    const url = buildShareUrl(useAffordStore.getState())
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }, [])

  const total = costBreakdown.total
  let displayShare1, displayShare2
  if (splitMode === 'per-person') {
    displayShare1 = Math.round(monthlyIncome1 * (budgetPercent1 / 100))
    displayShare2 = Math.round(monthlyIncome2 * (budgetPercent2 / 100))
  } else if (splitMode === '50/50') {
    displayShare1 = Math.round(total / 2); displayShare2 = Math.round(total / 2)
  } else if (splitMode === 'custom') {
    displayShare1 = Math.round(total * customSplit1 / 100); displayShare2 = total - displayShare1
  } else {
    displayShare1 = share1; displayShare2 = share2
  }
  const pctOfIncome1 = splitMode === 'per-person' ? budgetPercent1 : monthlyIncome1 > 0 ? Math.round((displayShare1 / monthlyIncome1) * 100) : 0
  const pctOfIncome2 = splitMode === 'per-person' ? budgetPercent2 : monthlyIncome2 > 0 ? Math.round((displayShare2 / monthlyIncome2) * 100) : 0

  return (
    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="min-h-dvh">
      {/* ── Header ── */}
      <div className="px-5 sm:px-8 py-4 sticky top-0 z-10 flex items-center justify-between" style={{ background: 'var(--s-base)' }}>
        <button onClick={onRestart} className="text-[13px] font-medium text-ink-faint hover:text-ink transition-colors">← Start over</button>
        <div className="flex items-center gap-1">
          <button onClick={handleShare} className="p-2 rounded-lg text-ink-faint hover:text-ink hover:bg-[var(--s-surface-2)] transition-all active:scale-95" aria-label="Share">
            {copied
              ? <svg className="w-4 h-4" style={{ color: 'var(--s-teal)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            }
          </button>
          <button onClick={(e) => toggleDark(e)} className="p-2 rounded-lg text-ink-faint hover:text-ink hover:bg-[var(--s-surface-2)] transition-all active:scale-95" aria-label="Toggle dark mode">
            {isDark
              ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            }
          </button>
        </div>
      </div>

      <div className="max-w-xl md:max-w-4xl mx-auto px-5 sm:px-8 pb-12">
        <m.div initial="hidden" animate="visible" variants={stagger}>

          {/* ═══════════ HERO ═══════════ */}
          <m.div variants={fadeUp} transition={spring} className="pb-8 md:pb-12">
            <p className="text-[14px] md:text-[16px] text-ink-faint mb-3">You can afford up to</p>
            <div className="flex items-end justify-between">
              <p className="display-number-hero text-5xl sm:text-7xl md:text-8xl leading-none">
                <AnimatedNumber value={maxPrice} />
              </p>
              <button onClick={() => setShowEdit(true)} className="shrink-0 mb-1 sm:mb-3 p-2.5 rounded-xl text-ink-faint hover:text-ink hover:bg-[var(--s-surface-2)] transition-all active:scale-90" aria-label="Adjust" title="Adjust your numbers">
                <svg className="w-6 h-6 md:w-7 md:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
              </button>
            </div>
            <p className="text-[12px] text-ink-faint mt-2">
              At {computed.housingBudgetPercent}% of take-home pay · <a href="https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance/calculating-gds-tds" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink-muted transition-colors">CMHC uses 39% gross</a>
            </p>
            <div className="mt-4 py-2.5 px-4 rounded-xl text-[12px] font-medium flex items-center gap-2 md:max-w-md"
              style={{ background: savingsCovered ? 'color-mix(in srgb, var(--s-teal) 8%, transparent)' : 'color-mix(in srgb, var(--s-danger) 8%, transparent)', color: savingsCovered ? 'var(--s-teal)' : 'var(--s-danger)' }}>
              {savingsCovered
                ? <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                : <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
              }
              {savingsCovered ? `Savings cover closing costs — ${formatCAD(savings - cashNeeded)} to spare` : `You need ${formatCAD(savingsGap)} more in savings to close`}
            </div>
          </m.div>

          {/* ═══════════ TWO-COLUMN: Monthly + Cash ═══════════ */}
          <m.div variants={fadeUp} transition={spring}>
            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-12 border-t" style={{ borderColor: 'var(--s-border)' }}>

              {/* ── LEFT: Monthly cost ── */}
              <div className="py-6 md:py-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-ink-faint mb-1">Monthly cost</p>
                    <p className="display-number text-4xl sm:text-5xl leading-none"><AnimatedNumber value={total} /></p>
                  </div>
                  <div className="text-right mt-1">
                    <p className="text-[14px] font-semibold tabular-nums" style={{ color: housingColor }}>{housingPercent}%</p>
                    <p className="text-[10px] text-ink-faint">of take-home</p>
                  </div>
                </div>

                {/* Donut on desktop, stacked bar on mobile */}
                <div className="hidden md:flex items-center gap-6 mt-4">
                  <CostDonut items={costBreakdown.items} total={total} />
                  <div className="space-y-2 flex-1">
                    {costBreakdown.items.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between text-[13px]">
                        <span className="flex items-center gap-2 text-ink-muted">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COST_BAR_COLORS[i % COST_BAR_COLORS.length] }} />
                          {item.name}
                          {COST_TIPS[item.name] && <InfoTip text={COST_TIPS[item.name]} />}
                        </span>
                        <span className="tabular-nums text-ink" style={{ fontFamily: 'var(--font-mono)' }}><AnimatedNumber value={item.value} /></span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mobile: stacked bar + collapsible details */}
                <div className="md:hidden">
                  <div className="flex h-3 rounded-full overflow-hidden mt-2" style={{ background: 'var(--s-surface-3)' }}>
                    {costBreakdown.items.map((item, i) => {
                      const pct = total > 0 ? (item.value / total) * 100 : 0
                      return <div key={item.name} className="bar-animate" style={{ width: `${pct}%`, background: COST_BAR_COLORS[i % COST_BAR_COLORS.length], animationDelay: `${0.3 + i * 0.06}s` }} />
                    })}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2.5">
                    {costBreakdown.items.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: COST_BAR_COLORS[i % COST_BAR_COLORS.length] }} />
                        <span className="text-[10px] text-ink-faint">{item.name}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setShowBreakdown((v) => !v)} className="flex items-center gap-1.5 mt-3 text-[12px] text-ink-faint hover:text-ink-muted transition-colors">
                    <span>{showBreakdown ? 'Hide' : 'Show'} details</span>
                    <m.svg animate={{ rotate: showBreakdown ? 180 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></m.svg>
                  </button>
                  <AnimatePresence>
                    {showBreakdown && (
                      <m.div initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }} exit={{ opacity: 0, scaleY: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="origin-top">
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
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── RIGHT: Cash to close ── */}
              <div className="py-6 md:py-8 border-t md:border-t-0 md:border-l md:pl-12" style={{ borderColor: 'var(--s-border)' }}>
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
                      <span className="text-[13px] text-ink-faint flex items-center gap-1.5">{item.label} <InfoTip text={item.tip} /></span>
                      {item.static
                        ? <span className="text-[13px] tabular-nums text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}>{formatCAD(item.value)}</span>
                        : <span className="text-[13px] tabular-nums text-ink-muted" style={{ fontFamily: 'var(--font-mono)' }}><AnimatedNumber value={item.value} /></span>
                      }
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </m.div>

          {/* ═══════════ PARTNER SPLIT ═══════════ */}
          {hasPartner && (
            <m.div variants={fadeUp} transition={spring} className="py-6 md:py-8 border-t" style={{ borderColor: 'var(--s-border)' }}>
              {/* Split mode tabs + custom slider (inline on desktop) + share */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <p className="text-[14px] text-ink-muted">Split</p>
                <div className="flex rounded-lg overflow-hidden border p-0.5" style={{ borderColor: 'var(--s-border)', background: 'var(--s-surface-2)' }}>
                  {[{ value: 'proportional', label: 'By income' }, { value: '50/50', label: '50/50' }, { value: 'custom', label: 'Custom' }, { value: 'per-person', label: 'Each picks' }].map((opt) => (
                    <button key={opt.value} onClick={() => setSplitMode(opt.value)}
                      className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-all ${
                        splitMode === opt.value ? 'bg-[var(--s-surface-1)] text-ink shadow-sm' : 'text-ink-faint'
                      }`}
                    >{opt.label}</button>
                  ))}
                </div>

                {/* Custom slider — inline on desktop, own row on mobile */}
                {splitMode === 'custom' && (
                  <div className="flex items-center gap-2 w-full md:w-auto md:flex-1 md:max-w-[200px] order-last md:order-none">
                    <span className="text-[11px] text-ink-faint tabular-nums shrink-0">{customSplit1}%</span>
                    <input type="range" min={10} max={90} step={1} value={customSplit1} onChange={(e) => setCustomSplit1(Number(e.target.value))} className="flex-1" />
                    <span className="text-[11px] text-ink-faint tabular-nums shrink-0">{100 - customSplit1}%</span>
                  </div>
                )}

                <button
                  onClick={handleShare}
                  className="ml-auto flex items-center gap-1.5 text-[12px] font-medium transition-colors"
                  style={{ color: copied ? 'var(--s-teal)' : 'var(--s-text-tertiary)' }}
                >
                  {copied ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  )}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Share with partner'}</span>
                </button>
              </div>

              {/* Two-column cards on desktop, stacked on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 md:max-w-2xl md:mx-auto">
                {[
                  { label: 'You', amount: displayShare1, pct: pctOfIncome1, income: monthlyIncome1, budgetPct: budgetPercent1, setBudgetPct: setBudgetPercent1 },
                  { label: 'Partner', amount: displayShare2, pct: pctOfIncome2, income: monthlyIncome2, budgetPct: budgetPercent2, setBudgetPct: setBudgetPercent2 },
                ].map((p) => {
                  const leftover = Math.round(p.income - p.amount)
                  const color = colorFor(p.pct)
                  const isPerPerson = splitMode === 'per-person'
                  const r = 32
                  const circumference = 2 * Math.PI * r
                  const filled = circumference * Math.min(p.pct, 100) / 100
                  return (
                  <div key={p.label} className="rounded-2xl p-5 md:p-6 flex gap-4 md:gap-5 items-center" style={{ background: 'var(--s-surface-2)' }}>
                    {/* Progress ring */}
                    <div className="shrink-0">
                      <svg width="76" height="76" viewBox="0 0 76 76">
                        <circle cx="38" cy="38" r={r} fill="none" stroke="var(--s-surface-3)" strokeWidth="5" />
                        <circle
                          cx="38" cy="38" r={r} fill="none"
                          stroke={color} strokeWidth="5" strokeLinecap="round"
                          strokeDasharray={`${filled} ${circumference - filled}`}
                          transform="rotate(-90 38 38)"
                          style={{ transition: 'stroke-dasharray 0.3s ease, stroke 0.3s ease' }}
                        />
                        <text x="38" y="36" textAnchor="middle" fill={color} fontSize="14" fontWeight="700" style={{ fontFamily: 'var(--font-display)' }}>
                          {p.pct}%
                        </text>
                        <text x="38" y="48" textAnchor="middle" fill="var(--s-text-tertiary)" fontSize="8">
                          income
                        </text>
                      </svg>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-medium text-ink-muted mb-1">{p.label}</p>
                      <p className="display-number text-2xl md:text-3xl leading-none">
                        <AnimatedNumber value={p.amount} />
                        <span className="text-[11px] text-ink-faint font-normal ml-1">/mo</span>
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <svg className="w-3.5 h-3.5 shrink-0 text-ink-faint" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                        </svg>
                        <span className="text-[12px] text-ink-faint tabular-nums">{formatCAD(leftover)} left</span>
                      </div>
                    </div>

                    {/* +/- buttons on the right */}
                    {isPerPerson && (
                      <div className="shrink-0 flex flex-col gap-1">
                        <button
                          onClick={() => p.setBudgetPct(Math.min(80, p.budgetPct + 1))}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:bg-[var(--s-surface-3)] active:scale-90"
                          style={{ borderColor: 'var(--s-border)' }}
                        >
                          <svg className="w-3.5 h-3.5 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
                        </button>
                        <button
                          onClick={() => p.setBudgetPct(Math.max(10, p.budgetPct - 1))}
                          className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all hover:bg-[var(--s-surface-3)] active:scale-90"
                          style={{ borderColor: 'var(--s-border)' }}
                        >
                          <svg className="w-3.5 h-3.5 text-ink-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M5 12h14" /></svg>
                        </button>
                      </div>
                    )}
                  </div>
                  )
                })}
              </div>

            </m.div>
          )}

          {/* ═══════════ FOOTER ═══════════ */}
          <m.div variants={fadeUp} transition={spring} className="pt-4 pb-6 border-t" style={{ borderColor: 'var(--s-border)' }}>
            <p className="text-[11px] text-ink-faint leading-relaxed">
              Calculations use take-home pay (not gross income). Official <a href="https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance/calculating-gds-tds" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">CMHC GDS/TDS ratios</a> use gross income and may differ. Tax rates: Quebec 2025. For illustration only — not financial advice.
            </p>
          </m.div>

        </m.div>
      </div>

      <EditSheet open={showEdit} onClose={() => setShowEdit(false)} />
    </m.div>
  )
}
