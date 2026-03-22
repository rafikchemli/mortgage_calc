export default function SelectInput({ label, options, value, onChange, compact }) {
  return (
    <div className={compact ? 'mb-0' : 'mb-4'}>
      <label className="block text-[11px] font-medium text-ink-faint mb-1.5">
        {label}
      </label>
      <div className="flex gap-1.5 flex-wrap" role="radiogroup" aria-label={label}>
        {options.map((opt) => {
          const optValue = typeof opt === 'object' ? opt.value : opt
          const optLabel = typeof opt === 'object' ? opt.label : opt
          const isActive = String(optValue) === String(value)

          return (
            <button
              key={optValue}
              onClick={() => onChange(optValue)}
              role="radio"
              aria-checked={isActive}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all border focus:outline-none focus:ring-2 focus:ring-violet/20 ${
                isActive
                  ? 'bg-[var(--s-text-primary)] text-[var(--s-surface-1)] border-transparent'
                  : 'bg-transparent text-ink-faint border-[var(--s-border)] hover:text-ink-muted hover:border-[var(--s-surface-3)]'
              }`}
            >
              {optLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}
