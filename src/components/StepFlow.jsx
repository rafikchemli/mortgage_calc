import { useState, useEffect, useCallback, useRef } from 'react'
import { m } from 'framer-motion'
import StepWelcome from './steps/StepWelcome'
import StepIncome from './steps/StepIncome'
import StepSavings from './steps/StepSavings'
import StepMortgage from './steps/StepMortgage'
import StepReveal from './steps/StepReveal'
import StepShared from './steps/StepShared'
import Results from './Results'
import PrivacyNotice from './layout/PrivacyNotice'
import { hapticTap, hapticSuccess } from '../utils/haptics'
import useAffordStore from '../store/useAffordStore'

const STEPS = ['welcome', 'income', 'savings', 'mortgage', 'reveal']

// No AnimatePresence — instant swap, CSS .step-enter handles the
// single container fade-in on the compositor thread.
// AnimatePresence always creates a gap (mode="wait") or ghosting
// (mode="sync"), both of which flash on mobile.

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
  const [showResults, setShowResults] = useState(false)
  const [showShared, setShowShared] = useState(fromShare)

  const isWelcome = step === 0

  // Progress dots skip the welcome screen
  const progressSteps = STEPS.slice(1)
  const progressIndex = step - 1

  const goNext = useCallback(() => {
    if (step === STEPS.length - 1) {
      hapticSuccess()
      setShowResults(true)
      return
    }
    hapticTap()
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }, [step])

  const goBack = useCallback(() => {
    if (showResults) {
      setShowResults(false)
      return
    }
    if (step <= 0) return
    setStep((s) => Math.max(s - 1, 0))
  }, [showResults, step])

  const restart = useCallback(() => {
    setShowResults(false)
    setShowShared(false)
    setFromShare(false)
    setStep(0)
  }, [setFromShare])

  // Keyboard navigation — use refs so the listener is attached once
  const goNextRef = useRef(goNext)
  const goBackRef = useRef(goBack)
  const stepRef = useRef(step)
  goNextRef.current = goNext
  goBackRef.current = goBack
  stepRef.current = step

  useEffect(() => {
    const handler = (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === 'Enter') {
          e.preventDefault()
          goNextRef.current()
        }
        return
      }
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault()
        goNextRef.current()
      }
      if ((e.key === 'ArrowUp' || e.key === 'Backspace') && stepRef.current > 0) {
        e.preventDefault()
        goBackRef.current()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

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
      <div className="step-enter">
        <Results onBack={goBack} onRestart={restart} isDark={isDark} toggleDark={toggleDark} />
      </div>
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
              transition={{ duration: 0.2 }}
            />
          ))}
        </m.div>
      )}

      {/* Step content — key forces remount, CSS .step-enter handles fade */}
      <div
        key={step}
        className="absolute inset-0 flex items-center justify-center step-enter"
        style={{ background: 'var(--s-base)' }}
      >
        <div className="w-full max-w-lg px-6">
          {step === 0 && <StepWelcome onNext={goNext} />}
          {step === 1 && <StepIncome onNext={goNext} />}
          {step === 2 && <StepSavings onNext={goNext} onBack={goBack} />}
          {step === 3 && <StepMortgage onNext={goNext} onBack={goBack} />}
          {step === 4 && <StepReveal onNext={goNext} onBack={goBack} />}
        </div>
      </div>

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
