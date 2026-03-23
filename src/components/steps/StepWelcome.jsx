import { m } from 'framer-motion'

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

function HouseIllustration() {
  return (
    <m.svg
      viewBox="0 0 120 100"
      fill="none"
      className="w-24 h-24 sm:w-28 sm:h-28 mx-auto"
      initial="hidden"
      animate="visible"
    >
      {/* Roof */}
      <m.path
        d="M60 12 L16 48 L104 48 Z"
        stroke="var(--s-gold)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        variants={draw}
      />
      {/* Roof accent line */}
      <m.path
        d="M60 22 L30 44 L90 44 Z"
        stroke="var(--s-gold)"
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.3"
        variants={draw}
      />
      {/* Walls */}
      <m.rect
        x="24" y="48" width="72" height="40"
        stroke="var(--s-text-tertiary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        variants={draw}
      />
      {/* Door */}
      <m.rect
        x="50" y="60" width="16" height="28"
        stroke="var(--s-text-tertiary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        rx="1"
        fill="none"
        variants={draw}
      />
      {/* Door knob */}
      <m.circle
        cx="63" cy="75" r="1.2"
        fill="var(--s-gold)"
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: { scale: 1, opacity: 1, transition: { delay: 1.4, type: 'spring', stiffness: 300 } },
        }}
      />
      {/* Left window */}
      <m.rect
        x="30" y="56" width="12" height="12"
        stroke="var(--s-text-tertiary)"
        strokeWidth="1.2"
        rx="1"
        fill="none"
        variants={draw}
      />
      <m.line x1="36" y1="56" x2="36" y2="68" stroke="var(--s-text-tertiary)" strokeWidth="0.8" variants={draw} />
      <m.line x1="30" y1="62" x2="42" y2="62" stroke="var(--s-text-tertiary)" strokeWidth="0.8" variants={draw} />
      {/* Right window */}
      <m.rect
        x="74" y="56" width="12" height="12"
        stroke="var(--s-text-tertiary)"
        strokeWidth="1.2"
        rx="1"
        fill="none"
        variants={draw}
      />
      <m.line x1="80" y1="56" x2="80" y2="68" stroke="var(--s-text-tertiary)" strokeWidth="0.8" variants={draw} />
      <m.line x1="74" y1="62" x2="86" y2="62" stroke="var(--s-text-tertiary)" strokeWidth="0.8" variants={draw} />
      {/* Chimney */}
      <m.rect
        x="78" y="18" width="8" height="20"
        stroke="var(--s-text-tertiary)"
        strokeWidth="1.2"
        fill="none"
        variants={draw}
      />
      {/* Smoke */}
      <m.path
        d="M82 18 Q80 12 83 8 Q86 4 82 0"
        stroke="var(--s-text-tertiary)"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 0.4,
            transition: { duration: 1.5, delay: 1.6, ease: 'easeOut' },
          },
        }}
      />
      {/* Ground line */}
      <m.line
        x1="8" y1="88" x2="112" y2="88"
        stroke="var(--s-text-tertiary)"
        strokeWidth="0.8"
        opacity="0.3"
        variants={draw}
      />
    </m.svg>
  )
}

function FeaturePill({ children, delay }) {
  return (
    <m.span
      variants={{
        hidden: { opacity: 0, scale: 0.9, y: 8 },
        visible: {
          opacity: 1,
          scale: 1,
          y: 0,
          transition: { type: 'spring', stiffness: 250, damping: 22, delay },
        },
      }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border"
      style={{ borderColor: 'var(--s-border)', color: 'var(--s-text-secondary)' }}
    >
      {children}
    </m.span>
  )
}

export default function StepWelcome({ onNext }) {
  return (
    <m.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="text-center"
    >
      <HouseIllustration />

      <m.h1
        variants={fadeUp}
        className="text-3xl sm:text-[2.5rem] font-bold tracking-tight text-ink leading-[1.15] mt-8"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        How much house
        <br />
        <span style={{ color: 'var(--s-gold)' }}>can you afford?</span>
      </m.h1>

      <m.p
        variants={fadeUp}
        className="text-[15px] text-ink-muted mt-4 leading-relaxed max-w-[22rem] mx-auto"
      >
        A few questions about your finances.
        <br className="hidden sm:block" />
        {' '}A clear answer in 30 seconds.
      </m.p>

      <m.div variants={fadeUp} className="flex flex-wrap justify-center gap-2 mt-6">
        <FeaturePill delay={0}>
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--s-teal)' }}>
            <path d="M8 0L1.5 3v4.5c0 4.1 2.8 7.9 6.5 8.5 3.7-.6 6.5-4.4 6.5-8.5V3L8 0z" />
          </svg>
          100% private
        </FeaturePill>
        <FeaturePill delay={0.05}>
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--s-gold)' }}>
            <circle cx="8" cy="8" r="6" />
            <path d="M8 4.5v4l2.5 1.5" strokeLinecap="round" />
          </svg>
          30 seconds
        </FeaturePill>
        <FeaturePill delay={0.1}>
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--s-teal)' }}>
            <path d="M2 12l4-4 3 3 5-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Quebec 2025 rates
        </FeaturePill>
      </m.div>

      <m.button
        variants={fadeUp}
        onClick={onNext}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-10 w-full py-3.5 rounded-xl text-[15px] font-semibold tracking-wide transition-colors"
        style={{ background: 'var(--s-text-primary)', color: 'var(--s-surface-1)' }}
      >
        Get started
      </m.button>

      <m.p variants={fadeUp} className="text-[11px] text-ink-faint mt-3">
        For couples & solo buyers in Montreal
      </m.p>
    </m.div>
  )
}
