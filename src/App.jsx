import { useEffect } from 'react'
import { useDarkMode } from './hooks/useDarkMode'
import StepFlow from './components/StepFlow'
import PrivacyNotice from './components/layout/PrivacyNotice'
import useAffordStore from './store/useAffordStore'
import { decodeShareParams } from './utils/shareUrl'

export default function App() {
  const { isDark, toggle } = useDarkMode()

  useEffect(() => {
    const values = decodeShareParams()
    if (values) {
      useAffordStore.getState().hydrateFromShare(values)
      history.replaceState(null, '', window.location.pathname)
    }
  }, [])

  return (
    <div className="app-bg">
      {/* Dark mode toggle — fixed top-right */}
      <button
        onClick={toggle}
        className="fixed top-5 right-5 z-50 p-2.5 rounded-xl text-ink-faint hover:text-ink hover:bg-[var(--s-surface-2)] transition-all active:scale-95"
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

      <StepFlow />
      <PrivacyNotice />
    </div>
  )
}
