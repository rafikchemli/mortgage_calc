export default function Header({ isDark, toggleDark }) {
  return (
    <header className="flex items-center justify-between px-6 pt-8 pb-2">
      <div>
        <h1 className="display-number text-2xl sm:text-3xl">
          House Affordability for Couples
        </h1>
        <p className="text-[11px] text-ink-faint mt-1 tracking-widest uppercase font-medium">Montreal, Quebec, Canada</p>
      </div>
      <button
        onClick={toggleDark}
        className="p-2.5 rounded-full bg-ink-ghost text-ink-muted hover:text-gold focus:outline-none focus:ring-2 focus:ring-violet/30 transition-all"
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
    </header>
  )
}
