import AnimatedNumber from '../shared/AnimatedNumber'
import InfoTip from '../shared/InfoTip'
import { formatCAD } from '../shared/CurrencyDisplay'
import { CLOSING_COSTS } from '../../data/constants'

export default function CashSection({ computed }) {
  const {
    downPaymentAmount, welcomeTax, cmhc, cashNeeded,
    savings, savingsGap, savingsCovered, downPaymentPercent,
    activePrice,
  } = computed

  return (
    <div className="card p-4 sm:p-6">
      <span className="section-label">Cash to Close</span>
      <div className="mt-4 space-y-2">
        {[
          { label: 'Down Payment', value: downPaymentAmount, tip: `${Math.round(downPaymentPercent)}% of purchase price. Below 20% requires CMHC insurance.` },
          { label: 'Welcome Tax', value: welcomeTax.total, tip: 'Quebec transfer tax. Progressive brackets 0.5%–4%.' },
          ...(cmhc.isRequired && !cmhc.exceedsMax ? [{ label: 'CMHC QST', value: cmhc.qst, tip: 'QST (9.975%) on CMHC premium. Paid in cash.' }] : []),
          { label: 'Notary', value: CLOSING_COSTS.notary, tip: 'Legal fees. Estimated.', static: true },
          { label: 'Inspection', value: CLOSING_COSTS.homeInspection, tip: 'Pre-purchase inspection.', static: true },
        ].map((item) => (
          <div key={item.label} className="flex items-baseline justify-between py-1 gap-2">
            <span className="text-[12px] text-ink-muted flex items-center gap-1.5 min-w-0">
              <span className="truncate">{item.label}</span>
              <InfoTip text={item.tip} />
            </span>
            {item.static
              ? <span className="money text-[12px] shrink-0">{formatCAD(item.value)}</span>
              : <AnimatedNumber value={item.value} className="money text-[12px] shrink-0" />
            }
          </div>
        ))}

        {cmhc.exceedsMax && (
          <div className="p-2.5 bg-danger/8 border border-danger/15 rounded-lg text-[11px] text-danger leading-relaxed">
            CMHC unavailable over $1.5M — 20% down required.
          </div>
        )}
        {downPaymentPercent < 5 && (
          <div className="p-2.5 bg-danger/8 border border-danger/15 rounded-lg text-[11px] text-danger leading-relaxed">
            Minimum 5% down required ({formatCAD(Math.ceil(activePrice * 0.05))}).
          </div>
        )}
      </div>

      <div className="flex justify-between items-baseline mt-4 pt-3 border-t" style={{ borderColor: 'var(--s-border)' }}>
        <span className="text-[12px] font-semibold text-ink-muted">Total Cash</span>
        <AnimatedNumber value={cashNeeded} className="display-number text-xl" />
      </div>

      {/* Savings check */}
      <div
        className="mt-3 p-3 rounded-xl text-[12px] font-medium"
        style={{
          background: savingsCovered ? 'color-mix(in srgb, var(--s-teal) 8%, transparent)' : 'color-mix(in srgb, var(--s-danger) 8%, transparent)',
          color: savingsCovered ? 'var(--s-teal)' : 'var(--s-danger)',
        }}
      >
        {savingsCovered
          ? `Your savings (${formatCAD(savings)}) cover this with ${formatCAD(savings - cashNeeded)} to spare.`
          : `You need ${formatCAD(savingsGap)} more in savings.`
        }
      </div>
    </div>
  )
}
