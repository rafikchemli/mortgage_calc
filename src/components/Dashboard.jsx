import { useComputedAfford } from '../hooks/useComputedAfford'
import useAffordStore from '../store/useAffordStore'
import AffordInputs from './tab2/AffordInputs'
import AffordGauge from './tab2/AffordGauge'
import AnimatedNumber from './shared/AnimatedNumber'
import { formatCAD } from './shared/CurrencyDisplay'
import { CLOSING_COSTS } from '../data/constants'

const COST_COLORS = ['var(--s-violet)', 'var(--s-teal)', 'var(--s-gold)', 'var(--s-copper)', 'var(--s-rose)']


function InteractiveContributionCard({ label, amount, percent, onPercentChange }) {
  const color = percent <= 35 ? 'var(--s-teal)' : percent <= 40 ? 'var(--s-gold)' : '#F87171'
  const r = 26
  const circumference = 2 * Math.PI * r
  const progress = Math.min(percent, 60) / 60
  const offset = circumference * (1 - progress)

  return (
    <div className="bg-ink-ghost rounded-lg px-4 py-3 border border-ink-ghost overflow-hidden flex items-center gap-4">
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onPercentChange(Math.max(25, percent - 1))}
          disabled={percent <= 25}
          className="w-7 h-7 rounded-md bg-surface text-ink-muted hover:text-ink text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`Decrease ${label} housing %`}
        >
          -
        </button>
        <svg width="64" height="64" viewBox="0 0 64 64" className="shrink-0">
          <circle cx="32" cy="32" r={r} fill="none" stroke="var(--s-border)" strokeWidth="4" />
          <circle
            cx="32" cy="32" r={r} fill="none"
            stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            transform="rotate(-90 32 32)"
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
          <text x="32" y="34" textAnchor="middle" fill={color} fontSize="13" fontWeight="700" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {percent}%
          </text>
        </svg>
        <button
          onClick={() => onPercentChange(Math.min(60, percent + 1))}
          disabled={percent >= 60}
          className="w-7 h-7 rounded-md bg-surface text-ink-muted hover:text-ink text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={`Increase ${label} housing %`}
        >
          +
        </button>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-ink-faint uppercase tracking-wider">{label}</p>
        <p className="display-number text-2xl mt-0.5 whitespace-nowrap"><AnimatedNumber value={amount} /><span className="text-[10px] text-ink-faint font-normal">/mo</span></p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const {
    maxPrice, monthlyBudget, downPaymentAmount,
    contribution1, contribution2,
    monthlyIncome1, monthlyIncome2,
    housingPercent1, housingPercent2,
    effectiveHousingPercent,
    costBreakdown,
    stressedMaxPrice, stressTest,
    cmhc, welcomeTax,
    downPaymentPercent, interestRate,
  } = useComputedAfford()

  const {
    setHousingPercent1, setHousingPercent2,
  } = useAffordStore()

  const hasPartner = monthlyIncome2 > 0
  const closingTotal = CLOSING_COSTS.notary + CLOSING_COSTS.homeInspection
  const cashNeeded = downPaymentAmount + welcomeTax.total + closingTotal + (cmhc.isRequired && !cmhc.exceedsMax ? cmhc.qst : 0)
  const stressedRate = interestRate + 2
  const housingPercent = Math.round(effectiveHousingPercent)

  return (
    <div className="dashboard-grid">
      {/* Settings */}
      <div style={{ gridArea: 'settings' }}>
        <AffordInputs />
      </div>

      {/* Gauge */}
      <div className="enchanted-card p-4 sm:p-5 flex items-center justify-center" style={{ gridArea: 'gauge' }}>
        <AffordGauge housingPercent={housingPercent} />
      </div>

      {/* Hero */}
      <div className="enchanted-card enchanted-card-accent p-4 sm:p-6" style={{ gridArea: 'hero' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.1em] text-ink-faint font-medium">You can afford</p>
            <p className="display-number-glow text-3xl sm:text-5xl mt-1"><AnimatedNumber value={maxPrice} /></p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-ink-faint uppercase tracking-wider">Down Payment</p>
            <p className="display-number text-xl sm:text-2xl mt-0.5"><AnimatedNumber value={downPaymentAmount} /></p>
            <p className="text-[10px] text-ink-faint">{downPaymentPercent}%</p>
          </div>
        </div>

        <div className={`grid ${hasPartner ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'} gap-3 mt-5`}>
          <InteractiveContributionCard
            label="You"
            amount={contribution1}
            percent={housingPercent1}
            onPercentChange={setHousingPercent1}
          />
          {hasPartner && (
            <InteractiveContributionCard
              label="Partner"
              amount={contribution2}
              percent={housingPercent2}
              onPercentChange={setHousingPercent2}
            />
          )}
        </div>
      </div>

      {/* Monthly costs */}
      <div className="enchanted-card p-4 sm:p-5" style={{ gridArea: 'monthly' }}>
        <span className="section-label">Monthly Breakdown</span>
        <div className="mt-3 space-y-2">
          {costBreakdown.items.map((item, i) => {
            const pct = costBreakdown.total > 0 ? (item.value / costBreakdown.total) * 100 : 0
            return (
              <div key={item.name}>
                <div className="flex items-center justify-between text-[12px] mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COST_COLORS[i] }} />
                    <span className="text-ink-muted">{item.name}</span>
                  </div>
                  <AnimatedNumber value={item.value} className="money text-[12px]" />
                </div>
                <div className="h-1 bg-ink-ghost rounded-full overflow-hidden">
                  <div className="h-full rounded-full bar-animate" style={{ width: `${pct}%`, backgroundColor: COST_COLORS[i] }} />
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between items-baseline mt-3 pt-2.5 border-t border-ink-ghost">
          <span className="text-[12px] font-semibold text-ink-muted">Total</span>
          <div className="text-right">
            <span className="display-number text-xl"><AnimatedNumber value={costBreakdown.total} /><span className="text-[10px] text-ink-faint font-normal">/mo</span></span>
            <p className="text-[10px] text-ink-faint"><AnimatedNumber value={costBreakdown.total * 12} />/yr</p>
          </div>
        </div>
      </div>

      {/* Upfront costs */}
      <div className="enchanted-card p-4 sm:p-5" style={{ gridArea: 'upfront' }}>
        <span className="section-label">Upfront Cash</span>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-baseline justify-between py-1">
            <span className="text-[12px] text-ink-muted">Down Payment</span>
            <AnimatedNumber value={downPaymentAmount} className="money text-[12px]" />
          </div>
          <div className="flex items-baseline justify-between py-1">
            <span className="text-[12px] text-ink-muted">Welcome Tax</span>
            <AnimatedNumber value={welcomeTax.total} className="money text-[12px]" />
          </div>
          {cmhc.isRequired && !cmhc.exceedsMax && (
            <div className="flex items-baseline justify-between py-1">
              <span className="text-[12px] text-ink-muted">QST on CMHC</span>
              <AnimatedNumber value={cmhc.qst} className="money text-[12px]" />
            </div>
          )}
          <div className="flex items-baseline justify-between py-1">
            <span className="text-[12px] text-ink-muted">Notary</span>
            <span className="money text-[12px]">{formatCAD(CLOSING_COSTS.notary)}</span>
          </div>
          <div className="flex items-baseline justify-between py-1">
            <span className="text-[12px] text-ink-muted">Home Inspection</span>
            <span className="money text-[12px]">{formatCAD(CLOSING_COSTS.homeInspection)}</span>
          </div>
          {cmhc.exceedsMax && (
            <div className="mt-2 p-2 bg-danger/10 border border-danger/20 rounded-lg text-[11px] text-danger">
              CMHC not available over $1.5M. 20% down required.
            </div>
          )}
        </div>
        <div className="flex justify-between items-baseline mt-3 pt-2.5 border-t border-ink-ghost">
          <span className="text-[12px] font-semibold text-ink-muted">Cash Needed</span>
          <AnimatedNumber value={cashNeeded} className="display-number text-xl" />
        </div>
      </div>

      {/* Stress test */}
      <div className="enchanted-card p-4 sm:p-5" style={{ gridArea: 'stress' }}>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="section-label">Stress Test (+2%)</span>
          <span className="text-[11px] text-ink-faint">What if rates rise?</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-teal/8 border border-teal/15 rounded-lg p-3">
            <p className="text-[11px] text-ink-faint mb-1">Current ({interestRate.toFixed(1)}%)</p>
            <p className="display-number text-lg"><AnimatedNumber value={maxPrice} /></p>
            <p className="text-[11px] text-ink-faint mt-0.5"><AnimatedNumber value={stressTest.currentMonthly} />/mo</p>
          </div>
          <div className="bg-danger/8 border border-danger/15 rounded-lg p-3">
            <p className="text-[11px] text-ink-faint mb-1">Stressed ({stressedRate.toFixed(1)}%)</p>
            <p className="display-number text-lg"><AnimatedNumber value={stressedMaxPrice} /></p>
            <p className="text-[11px] text-ink-faint mt-0.5"><AnimatedNumber value={stressTest.stressedMonthly} />/mo</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-2.5 pt-2.5 border-t border-ink-ghost text-[12px]">
          <div className="flex gap-2">
            <span className="text-ink-faint">Power change</span>
            <AnimatedNumber value={stressedMaxPrice - maxPrice} className="money text-[12px] text-copper" />
          </div>
          <div className="flex gap-2">
            <span className="text-ink-faint">Monthly +</span>
            <AnimatedNumber value={stressTest.increase} className="money text-[12px] text-copper" format={(v) => `+${formatCAD(Math.round(v))}`} />
          </div>
        </div>
      </div>
    </div>
  )
}
