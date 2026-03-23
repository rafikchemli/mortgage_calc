import { m } from 'framer-motion'
import { useComputedAfford } from '../../hooks/useComputedAfford'
import { formatCAD } from '../shared/CurrencyDisplay'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 20 } },
}

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { pathLength: { duration: 1.2, ease: [0.65, 0, 0.35, 1], delay: 0.6 }, opacity: { duration: 0.3, delay: 0.6 } },
  },
}

export default function StepShared({ onNext }) {
  const { maxPrice } = useComputedAfford()

  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="text-center"
    >
      {/* House icon — same as welcome */}
      <m.svg
        viewBox="0 0 120 100"
        fill="none"
        className="w-20 h-20 sm:w-24 sm:h-24 mx-auto"
        initial="hidden"
        animate="visible"
      >
        <m.path
          d="M60 12 L16 48 L104 48 Z"
          stroke="var(--s-gold)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          variants={draw}
        />
        <m.rect
          x="24" y="48" width="72" height="40"
          stroke="var(--s-text-tertiary)"
          strokeWidth="1.5"
          fill="none"
          variants={draw}
        />
        <m.rect
          x="50" y="60" width="16" height="28"
          stroke="var(--s-text-tertiary)"
          strokeWidth="1.5"
          rx="1"
          fill="none"
          variants={draw}
        />
        <m.circle
          cx="63" cy="75" r="1.2"
          fill="var(--s-gold)"
          variants={{
            hidden: { scale: 0, opacity: 0 },
            visible: { scale: 1, opacity: 1, transition: { delay: 1.4, type: 'spring', stiffness: 300 } },
          }}
        />
      </m.svg>

      <m.p
        variants={fadeUp}
        className="text-[13px] text-ink-faint mt-6 mb-3"
      >
        Someone shared their results with you
      </m.p>

      <m.h1
        variants={fadeUp}
        className="text-2xl sm:text-3xl font-bold tracking-tight text-ink leading-tight"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        They can afford up to
      </m.h1>

      <m.p
        variants={fadeUp}
        className="text-4xl sm:text-5xl font-bold tracking-tighter mt-3"
        style={{ color: 'var(--s-gold)', fontFamily: 'var(--font-display)' }}
      >
        {formatCAD(maxPrice)}
      </m.p>

      <m.p
        variants={fadeUp}
        className="text-[13px] text-ink-faint mt-4"
      >
        in Montreal, Quebec
      </m.p>

      <m.button
        variants={fadeUp}
        onClick={onNext}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-10 w-full py-3.5 rounded-xl text-[15px] font-semibold tracking-wide transition-colors"
        style={{ background: 'var(--s-text-primary)', color: 'var(--s-surface-1)' }}
      >
        See the breakdown
      </m.button>
    </m.div>
  )
}
