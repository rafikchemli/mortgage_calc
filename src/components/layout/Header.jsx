import { useState, useCallback } from 'react'
import useAffordStore from '../../store/useAffordStore'
import { buildShareUrl } from '../../utils/shareUrl'

export default function Header({ isDark, toggleDark, maxPrice }) {
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(() => {
    const state = useAffordStore.getState()
    const url = buildShareUrl(state, maxPrice)
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [maxPrice])

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 pt-6 sm:pt-8 pb-2">
      <div className="min-w-0">
        <h1 className="display-number text-xl sm:text-3xl truncate text-balance">
          House Affordability for Couples
        </h1>
        <p className="text-[10px] sm:text-[11px] text-ink-faint mt-1 tracking-[0.12em] uppercase font-medium text-pretty">Montreal, Quebec, Canada</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleShare}
          className="relative p-2.5 w-10 h-10 rounded-full bg-ink-ghost text-ink-muted hover:text-violet focus:outline-none focus:ring-2 focus:ring-violet/30 transition-all"
          aria-label="Share calculator link"
        >
          {copied ? (
            <svg className="w-[18px] h-[18px] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-[18px] h-[18px] mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          )}
          {copied && (
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-medium text-violet whitespace-nowrap">
              Copied!
            </span>
          )}
        </button>
        <button
          onClick={toggleDark}
          className="relative p-2.5 w-10 h-10 rounded-full bg-ink-ghost text-ink-muted hover:text-gold focus:outline-none focus:ring-2 focus:ring-violet/30 transition-all overflow-hidden"
          aria-label="Toggle dark mode"
        >
          {/* Sun icon */}
          <svg
            className="absolute inset-0 m-auto w-[18px] h-[18px]"
            style={{
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isDark ? 1 : 0,
              transform: isDark ? 'rotate(0deg) translateY(0) scale(1)' : 'rotate(90deg) translateY(-6px) scale(0.8)',
            }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          {/* Moon icon */}
          <svg
            className="absolute inset-0 m-auto w-[18px] h-[18px]"
            style={{
              transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isDark ? 0 : 1,
              transform: isDark ? 'rotate(-90deg) translateY(-6px) scale(0.8)' : 'rotate(0deg) translateY(0) scale(1)',
            }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
    </header>
  )
}
