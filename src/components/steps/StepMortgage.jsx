import { motion } from 'framer-motion'
import useAffordStore from '../../store/useAffordStore'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all active:scale-[0.97] border ${
        active
          ? 'bg-[var(--s-text-primary)] text-[var(--s-surface-1)] border-transparent'
          : 'text-ink-muted border-[var(--s-border)] hover:border-[var(--s-surface-3)] hover:text-ink'
      }`}
    >
      {children}
    </button>
  )
}

export default function StepMortgage({ onNext, onBack }) {
  const {
    downPaymentPercent, setDownPaymentPercent,
    amortizationYears, setAmortizationYears,
    interestRate, setInterestRate,
  } = useAffordStore()

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible">
      <motion.p variants={fadeUp} className="text-sm text-ink-faint mb-2">Step 3</motion.p>
      <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink mb-8">
        Mortgage preferences
      </motion.h2>

      {/* Down payment */}
      <motion.div variants={fadeUp} className="mb-7">
        <label className="text-[11px] text-ink-faint uppercase tracking-wider mb-3 block">Down payment</label>
        <div className="flex flex-wrap gap-2">
          {[5, 10, 15, 20, 25].map((v) => (
            <Chip key={v} active={downPaymentPercent === v} onClick={() => setDownPaymentPercent(v)}>
              {v}%
            </Chip>
          ))}
        </div>
        {downPaymentPercent < 20 && (
          <p className="text-[11px] text-ink-faint mt-2">
            Below 20% requires CMHC insurance
          </p>
        )}
      </motion.div>

      {/* Amortization */}
      <motion.div variants={fadeUp} className="mb-7">
        <label className="text-[11px] text-ink-faint uppercase tracking-wider mb-3 block">Amortization</label>
        <div className="flex gap-2">
          {[20, 25, 30].map((v) => (
            <Chip key={v} active={amortizationYears === v} onClick={() => setAmortizationYears(v)}>
              {v} years
            </Chip>
          ))}
        </div>
      </motion.div>

      {/* Interest rate */}
      <motion.div variants={fadeUp} className="mb-2">
        <label className="text-[11px] text-ink-faint uppercase tracking-wider mb-3 block">Target interest rate</label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={1}
            max={10}
            step={0.1}
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            className="flex-1"
          />
          <span
            className="text-2xl font-bold w-20 text-right tabular-nums"
            style={{ color: 'var(--s-text-primary)', fontFamily: 'var(--font-display)' }}
          >
            {interestRate.toFixed(1)}%
          </span>
        </div>
      </motion.div>

      {/* Navigation */}
      <motion.div variants={fadeUp} className="flex gap-3 mt-8">
        <button
          onClick={onBack}
          className="px-5 py-3 rounded-xl text-[14px] font-medium text-ink-faint transition-all active:scale-[0.98]"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl text-[14px] font-semibold tracking-wide transition-all active:scale-[0.98]"
          style={{ background: 'var(--s-text-primary)', color: 'var(--s-surface-1)' }}
        >
          See what I can afford
        </button>
      </motion.div>
    </motion.div>
  )
}
