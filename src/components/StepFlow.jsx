import { useState, useEffect, useCallback } from 'react'
import { m, AnimatePresence } from 'framer-motion'
import StepWelcome from './steps/StepWelcome'
import StepIncome from './steps/StepIncome'
import StepSavings from './steps/StepSavings'
import StepMortgage from './steps/StepMortgage'
import StepReveal from './steps/StepReveal'
import StepShared from './steps/StepShared'
import Results from './Results'
import PrivacyNotice from './layout/PrivacyNotice'
import useAffordStore from '../store/useAffordStore'

const STEPS = ['welcome', 'income', 'savings', 'mortgage', 'reveal']

const stepVariants = {
  welcome: {
    enter: { opacity: 0, scale: 0.96 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98, y: -20 },
    exitBack: { opacity: 0 },
  },
  income: {
    enter: { y: 40, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: -30, opacity: 0, scale: 0.98 },
    exitBack: { y: 40, opacity: 0 },
  },
  savings: {
    enter: { y: 50, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: -30, opacity: 0, scale: 0.98 },
    exitBack: { y: 50, opacity: 0 },
  },
  mortgage: {
    enter: { y: 50, opacity: 0 },
    center: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0, scale: 0.92 },
    exitBack: { y: 50, opacity: 0 },
  },
  reveal: {
    enter: { scale: 0.85, opacity: 0 },
    center: { scale: 1, opacity: 1 },
    exit: { scale: 1.05, opacity: 0 },
    exitBack: { scale: 0.92, opacity: 0 },
  },
}

const stepTransitions = {
  welcome: { type: 'spring', stiffness: 200, damping: 22, mass: 0.8 },
  income: { type: 'spring', stiffness: 250, damping: 25, mass: 0.8 },
  savings: { type: 'spring', stiffness: 280, damping: 26, mass: 0.8 },
  mortgage: { type: 'spring', stiffness: 280, damping: 26, mass: 0.8 },
  reveal: { type: 'spring', stiffness: 180, damping: 22, mass: 1 },
}

const backTransition = { type: 'spring', stiffness: 400, damping: 35, mass: 0.6 }

function DarkToggle({ isDark, toggle }) {
  return (
    <button
      onClick={(e) => toggle(e)}
      className="p-2.5 rounded-xl text-ink-faint hover:text-ink hover:bg-[var(--s-surface-2)] transition-all active:scale-95"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  )
}

export default function StepFlow({ isDark, toggleDark }) {
  const fromShare = useAffordStore((s) => s.fromShare)
  const setFromShare = useAffordStore((s) => s.setFromShare)
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [showResults, setShowResults] = useState(false)
  const [showShared, setShowShared] = useState(fromShare)

  const currentStepName = STEPS[step]
  const isWelcome = step === 0

  // Progress dots skip the welcome screen
  const progressSteps = STEPS.slice(1)
  const progressIndex = step - 1

  const goNext = useCallback(() => {
    if (step === STEPS.length - 1) {
      setShowResults(true)
      return
    }
    setDirection(1)
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }, [step])

  const goBack = useCallback(() => {
    if (showResults) {
      setShowResults(false)
      return
    }
    if (step <= 0) return
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }, [showResults, step])

  const restart = useCallback(() => {
    setShowResults(false)
    setShowShared(false)
    setFromShare(false)
    setDirection(-1)
    setStep(0)
  }, [setFromShare])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Enter') {
          e.preventDefault()
          goNext()
        }
        return
      }
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault()
        goNext()
      }
      if ((e.key === 'ArrowUp' || e.key === 'Backspace') && step > 0) {
        e.preventDefault()
        goBack()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goBack, step])

  // Shared link interstitial
  if (showShared && !showResults) {
    return (
      <div className="relative h-dvh w-full overflow-hidden flex flex-col">
        <div className="absolute top-4 right-4 z-10">
          <DarkToggle isDark={isDark} toggle={toggleDark} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-lg px-6">
            <StepShared onNext={() => setShowResults(true)} />
          </div>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <m.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Results onBack={goBack} onRestart={restart} isDark={isDark} toggleDark={toggleDark} />
      </m.div>
    )
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden flex flex-col">
      {/* Dark mode — fixed top-right during steps */}
      <div className="absolute top-4 right-4 z-10">
        <DarkToggle isDark={isDark} toggle={toggleDark} />
      </div>

      {/* Progress dots — hidden on welcome */}
      {!isWelcome && (
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex gap-2"
        >
          {progressSteps.map((_, i) => (
            <m.div
              key={i}
              animate={{
                scale: i === progressIndex ? 1.4 : 1,
                backgroundColor: i < progressIndex ? 'var(--s-gold)' : i === progressIndex ? 'var(--s-text-primary)' : 'var(--s-surface-3)',
              }}
              className="w-1.5 h-1.5 rounded-full"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          ))}
        </m.div>
      )}

      {/* Step content */}
      <AnimatePresence initial={false} mode="wait">
        <m.div
          key={step}
          initial={direction > 0 ? stepVariants[currentStepName].enter : stepVariants[currentStepName].exitBack || stepVariants[currentStepName].enter}
          animate={stepVariants[currentStepName].center}
          exit={direction > 0 ? stepVariants[currentStepName].exit : stepVariants[currentStepName].exitBack}
          transition={direction > 0 ? stepTransitions[currentStepName] : backTransition}
          className="absolute inset-0 flex items-center justify-center"
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="w-full max-w-lg px-6">
            {step === 0 && <StepWelcome onNext={goNext} />}
            {step === 1 && <StepIncome onNext={goNext} />}
            {step === 2 && <StepSavings onNext={goNext} onBack={goBack} />}
            {step === 3 && <StepMortgage onNext={goNext} onBack={goBack} />}
            {step === 4 && <StepReveal onNext={goNext} onBack={goBack} />}
          </div>
        </m.div>
      </AnimatePresence>

      {/* Navigation hint — only on input steps, not welcome or reveal */}
      {/* Privacy notice — only on welcome and income steps */}
      {step <= 1 && !showResults && !showShared && <PrivacyNotice />}

      <m.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
        animate={{ opacity: step > 0 && step < 4 ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-[11px] text-ink-faint tracking-wide">
          press <span className="font-mono text-ink-muted">Enter ↵</span>
        </span>
      </m.div>
    </div>
  )
}
