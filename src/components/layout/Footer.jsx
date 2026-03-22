export default function Footer() {
  return (
    <footer className="px-5 sm:px-8 py-6 sm:py-8">
      <div className="border-t pt-4 space-y-1.5" style={{ borderColor: 'var(--s-border)' }}>
        <p className="text-[11px] text-ink-faint leading-relaxed">
          Estimates based on municipal tax rates, Quebec school tax, CMHC insurance rules, and standard welcome tax brackets. Rates as of 2025.
        </p>
        <p className="text-[11px] text-ink-faint leading-relaxed">
          For illustration only — not financial advice.
        </p>
      </div>
    </footer>
  )
}
