import { m, AnimatePresence } from 'framer-motion'
import useAffordStore from '../../store/useAffordStore'
import { useShallow } from 'zustand/react/shallow'
import { useComputedAfford } from '../../hooks/useComputedAfford'
import { formatCAD } from '../shared/CurrencyDisplay'

export default function StepBudget({ onNext, onBack }) {
  const { housingBudgetPercent, setHousingBudgetPercent } = useAffordStore(useShallow((s) => ({
    housingBudgetPercent: s.housingBudgetPercent, setHousingBudgetPercent: s.setHousingBudgetPercent,
  })))
  const { totalMonthlyIncome } = useComputedAfford()

  const budgetColor = housingBudgetPercent <= 28 ? 'var(--s-teal)'
    : housingBudgetPercent <= 33 ? 'var(--s-gold)'
    : housingBudgetPercent <= 40 ? 'var(--s-copper)'
    : 'var(--s-copper)'

  const budgetHint = housingBudgetPercent <= 28 ? 'Comfortable'
    : housingBudgetPercent <= 33 ? 'Balanced'
    : housingBudgetPercent <= 40 ? 'Stretching'
    : 'Tight'

  const monthlyAmount = Math.round(totalMonthlyIncome * (housingBudgetPercent / 100))

  const guidance = housingBudgetPercent <= 28
    ? 'Most planners suggest under 30%. You have room to breathe.'
    : housingBudgetPercent <= 33
    ? 'Right where most first-time buyers land.'
    : housingBudgetPercent <= 40
    ? 'Doable, but budget for maintenance and surprises.'
    : 'This is tight. Your other expenses will be squeezed.'

  return (
    <div className="stagger-fade-up">
      <p className="text-[10px] uppercase tracking-[0.12em] text-ink-faint mb-4 font-medium">Step 3 of 4</p>
      <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-1.5">
        Your comfort zone
      </h2>
      <p className="text-[13px] text-ink-faint mb-10 leading-relaxed">
        What share of your pay feels right for housing?
      </p>

      {/* Percentage + label */}
      <div className="text-center mb-4">
        <div className="flex items-baseline justify-center gap-2">
          <m.span
            key={housingBudgetPercent}
            initial={{ scale: 1.15, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold tabular-nums"
            style={{ color: budgetColor, fontFamily: 'var(--font-display)' }}
          >
            {housingBudgetPercent}%
          </m.span>
          <AnimatePresence mode="wait">
            <m.span
              key={budgetHint}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 4 }}
              transition={{ duration: 0.12 }}
              className="text-[12px] font-medium"
              style={{ color: budgetColor }}
            >
              {budgetHint}
            </m.span>
          </AnimatePresence>
        </div>
        {totalMonthlyIncome > 0 && (
          <p className="text-[13px] text-ink-muted mt-1 tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
            ~{formatCAD(monthlyAmount)}/mo toward housing
          </p>
        )}
      </div>

      {/* Slider */}
      <div className="relative w-full mb-4">
        <div
          className="absolute top-1/2 left-0 h-[6px] rounded-full -translate-y-1/2 pointer-events-none transition-all duration-150"
          style={{ width: `${((housingBudgetPercent - 20) / 30) * 100}%`, background: budgetColor, opacity: 0.7 }}
        />
        <input type="range" min={20} max={50} step={1} value={housingBudgetPercent}
          onChange={(e) => setHousingBudgetPercent(Number(e.target.value))} className="relative z-10 w-full" />
      </div>

      {/* Contextual guidance */}
      <p className="text-[11px] text-ink-faint leading-relaxed text-center min-h-[2rem]">
        {guidance}
      </p>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-10">
        <button onClick={onBack} className="px-3 py-2 text-[12px] font-medium text-ink-faint hover:text-ink-muted transition-colors active:scale-[0.97]">
          Back
        </button>
        <button onClick={onNext} className="flex-1 py-3.5 rounded-xl text-[14px] font-semibold tracking-wide transition-all active:scale-[0.98]"
          style={{ background: 'var(--s-text-primary)', color: 'var(--s-surface-1)' }}>
          Continue
        </button>
      </div>
    </div>
  )
}
