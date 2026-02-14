import { useState, useEffect } from 'react'

export default function CompactValueInput({ label, min, max, step, value, onChange, formatFn, tooltip, showSteppers }) {
  const [localValue, setLocalValue] = useState(value)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleFocus = () => {
    setIsEditing(true)
    setEditText(String(localValue))
  }

  const handleInput = (e) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    setEditText(raw)
    const v = Number(raw)
    if (!isNaN(v) && v >= min && v <= max) {
      setLocalValue(v)
      onChange(v)
    }
  }

  const handleBlur = () => {
    setIsEditing(false)
    const v = Number(editText)
    if (editText !== '' && !isNaN(v)) {
      const clamped = Math.min(max, Math.max(min, v))
      const snapped = Math.round(clamped / step) * step
      setLocalValue(snapped)
      onChange(snapped)
    } else {
      setLocalValue(value)
    }
  }

  const increment = () => {
    const next = Math.min(max, localValue + step)
    const snapped = Math.round(next / step) * step
    setLocalValue(snapped)
    onChange(snapped)
  }

  const decrement = () => {
    const prev = Math.max(min, localValue - step)
    const snapped = Math.round(prev / step) * step
    setLocalValue(snapped)
    onChange(snapped)
  }

  const displayValue = isEditing ? editText : (formatFn ? formatFn(localValue) : localValue)

  return (
    <div>
      <label className="flex items-center gap-1 text-[11px] font-medium text-ink-muted mb-1.5">
        {label}
        {tooltip && (
          <span
            className="inline-flex items-center justify-center w-3.5 h-3.5 text-[8px] rounded-full bg-surface-3 text-ink-faint cursor-help"
            title={tooltip}
            aria-label={tooltip}
          >
            ?
          </span>
        )}
      </label>
      <div className="flex items-center gap-1">
        {showSteppers && (
          <button
            onClick={decrement}
            disabled={localValue <= min}
            className="w-7 h-7 rounded-md bg-surface text-ink-muted hover:text-ink text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={`Decrease ${label}`}
          >
            -
          </button>
        )}
        <input
          type="text"
          value={displayValue}
          onFocus={handleFocus}
          onChange={handleInput}
          onBlur={handleBlur}
          aria-label={`${label} value`}
          className="money flex-1 min-w-0 text-center bg-surface border-ink-ghost border rounded-lg px-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet/20 transition-colors"
        />
        {showSteppers && (
          <button
            onClick={increment}
            disabled={localValue >= max}
            className="w-7 h-7 rounded-md bg-surface text-ink-muted hover:text-ink text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={`Increase ${label}`}
          >
            +
          </button>
        )}
      </div>
    </div>
  )
}
