import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAffordStore from '../../store/useAffordStore'
import { buildShareUrl } from '../../utils/shareUrl'

export default function Header({ isDark, toggleDark }) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(() => {
    const state = useAffordStore.getState()
    const url = buildShareUrl(state)
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [])

  return (
    <header className="flex items-center justify-between px-5 sm:px-8 py-5 sm:py-6">
      <div className="min-w-0">
        <h1 className="text-base sm:text-lg font-semibold text-ink tracking-tight">
          House Affordability
        </h1>
        <p className="text-[11px] text-ink-faint mt-0.5 tracking-wide">
          Montreal, Quebec
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleShare}
          className="relative p-2.5 rounded-xl text-ink-faint hover:text-ink hover:bg-[var(--s-surface-2)] focus:outline-none focus:ring-2 focus:ring-violet/20 transition-all active:scale-95"
          aria-label="Share calculator link"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.svg
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="w-[18px] h-[18px]"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </motion.svg>
            ) : (
              <motion.svg
                key="link"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="w-[18px] h-[18px]"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </motion.svg>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {copied && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-medium whitespace-nowrap"
                style={{ color: 'var(--s-teal)' }}
              >
                Copied!
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          onClick={toggleDark}
          className="relative p-2.5 rounded-xl text-ink-faint hover:text-ink hover:bg-[var(--s-surface-2)] focus:outline-none focus:ring-2 focus:ring-violet/20 transition-all active:scale-95 overflow-hidden"
          aria-label="Toggle dark mode"
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.svg
                key="sun"
                initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-[18px] h-[18px]"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </motion.svg>
            ) : (
              <motion.svg
                key="moon"
                initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className="w-[18px] h-[18px]"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </motion.svg>
            )}
          </AnimatePresence>
        </button>
      </div>
    </header>
  )
}
