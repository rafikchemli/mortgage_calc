import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import StepIncome from './steps/StepIncome'
import StepSavings from './steps/StepSavings'
import StepMortgage from './steps/StepMortgage'
import StepReveal from './steps/StepReveal'
import Results from './Results'

const STEPS = ['income', 'savings', 'mortgage', 'reveal']

// Each step gets a unique transition character
const stepVariants = {
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
    exit: { y: -20, opacity: 0, scale: 0.95, filter: 'blur(4px)' },
    exitBack: { y: 50, opacity: 0 },
  },
  reveal: {
    enter: { scale: 0.85, opacity: 0, filter: 'blur(8px)' },
    center: { scale: 1, opacity: 1, filter: 'blur(0px)' },
    exit: { scale: 1.05, opacity: 0 },
    exitBack: { scale: 0.95, opacity: 0, filter: 'blur(4px)' },
  },
}

const stepTransitions = {
  income: { type: 'spring', stiffness: 250, damping: 25, mass: 0.8 },
  savings: { type: 'spring', stiffness: 280, damping: 26, mass: 0.8 },
  mortgage: { type: 'spring', stiffness: 280, damping: 26, mass: 0.8 },
  reveal: { type: 'spring', stiffness: 180, damping: 22, mass: 1 },
}

const backTransition = { type: 'spring', stiffness: 400, damping: 35, mass: 0.6 }

export default function StepFlow() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [showResults, setShowResults] = useState(false)

  const currentStepName = STEPS[step]

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
    setDirection(-1)
    setStep((s) => Math.max(s - 1, 0))
  }, [showResults])

  const restart = useCallback(() => {
    setShowResults(false)
    setDirection(-1)
    setStep(0)
  }, [])

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

  if (showResults) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Results onBack={goBack} onRestart={restart} />
      </motion.div>
    )
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden flex flex-col">
      {/* Progress dots */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              scale: i === step ? 1.4 : 1,
              backgroundColor: i < step ? 'var(--s-gold)' : i === step ? 'var(--s-text-primary)' : 'var(--s-surface-3)',
            }}
            className="w-1.5 h-1.5 rounded-full"
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={step}
          initial={direction > 0 ? stepVariants[currentStepName].enter : stepVariants[currentStepName].exitBack || stepVariants[currentStepName].enter}
          animate={stepVariants[currentStepName].center}
          exit={direction > 0 ? stepVariants[currentStepName].exit : stepVariants[currentStepName].exitBack}
          transition={direction > 0 ? stepTransitions[currentStepName] : backTransition}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-full max-w-lg px-6">
            {step === 0 && <StepIncome onNext={goNext} />}
            {step === 1 && <StepSavings onNext={goNext} onBack={goBack} />}
            {step === 2 && <StepMortgage onNext={goNext} onBack={goBack} />}
            {step === 3 && <StepReveal onNext={goNext} onBack={goBack} />}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation hint — hidden on reveal */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ opacity: step < 3 ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <span className="text-[11px] text-ink-faint tracking-wide">
          press <span className="font-mono text-ink-muted">Enter ↵</span>
        </span>
      </motion.div>
    </div>
  )
}
