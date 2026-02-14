export default function Header({ isDark, toggleDark }) {
  return (
    <header className="flex items-center justify-between px-4 sm:px-6 pt-6 sm:pt-8 pb-2">
      <div className="min-w-0">
        <h1 className="display-number text-xl sm:text-3xl truncate">
          House Affordability for Couples
        </h1>
        <p className="text-[10px] sm:text-[11px] text-ink-faint mt-1 tracking-widest uppercase font-medium">Montreal, Quebec, Canada</p>
      </div>
      <button
        onClick={toggleDark}
        className="relative p-2.5 w-10 h-10 rounded-full bg-ink-ghost text-ink-muted hover:text-gold focus:outline-none focus:ring-2 focus:ring-violet/30 transition-all overflow-hidden"
        aria-label="Toggle dark mode"
      >
        {/* Sun icon */}
        <svg
          className="absolute inset-0 m-auto w-[18px] h-[18px] transition-all duration-300 ease-in-out"
          style={{
            opacity: isDark ? 1 : 0,
            transform: isDark ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.5)',
          }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        {/* Moon icon */}
        <svg
          className="absolute inset-0 m-auto w-[18px] h-[18px] transition-all duration-300 ease-in-out"
          style={{
            opacity: isDark ? 0 : 1,
            transform: isDark ? 'rotate(90deg) scale(0.5)' : 'rotate(0deg) scale(1)',
          }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>
    </header>
  )
}
