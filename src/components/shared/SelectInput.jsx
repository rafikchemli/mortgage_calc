export default function SelectInput({ label, options, value, onChange, compact }) {
  return (
    <div className={compact ? 'mb-0' : 'mb-5'}>
      <label className="block text-[11px] font-medium text-ink-muted mb-1.5">
        {label}
      </label>
      <div className="flex gap-1 flex-wrap" role="radiogroup" aria-label={label}>
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
              className={`px-2.5 py-1 rounded-lg text-[12px] font-medium transition-all border focus:outline-none focus:ring-2 focus:ring-violet/30 ${
                isActive
                  ? 'bg-gold/15 text-gold border-gold/40 shadow-[0_0_8px_rgba(240,200,80,0.15)] chip-active'
                  : 'bg-surface text-ink-muted border-ink-ghost hover:border-violet/30 hover:text-ink'
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
