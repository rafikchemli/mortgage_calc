import { useState, useEffect } from 'react'
import { useRafCallback } from '../../hooks/useDebounce'

export default function CompactValueInput({ label, min, max, step, value, onChange, formatFn, tooltip, showSteppers, slider, sliderMin, sliderMax, sliderStep }) {
  const throttledOnChange = useRafCallback(onChange)
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
  }

  const commitEdit = () => {
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur()
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
      <label className="flex items-center gap-1 text-[11px] font-medium text-ink-faint mb-1.5">
        {label}
        {tooltip && (
          <span
            className="inline-flex items-center justify-center w-3.5 h-3.5 text-[8px] rounded-full text-ink-faint cursor-help"
            style={{ background: 'var(--s-surface-3)' }}
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
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-faint hover:text-ink hover:bg-[var(--s-surface-2)] text-sm font-medium transition-all active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed"
            aria-label={`Decrease ${label}`}
          >
            -
          </button>
        )}
        <input
          type="text"
          inputMode="decimal"
          value={displayValue}
          onFocus={handleFocus}
          onChange={handleInput}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          aria-label={`${label} value`}
          className="money flex-1 min-w-0 text-center rounded-lg px-2 py-1.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal/20 transition-colors border"
          style={{ background: 'var(--s-surface-2)', borderColor: 'var(--s-border)' }}
        />
        {showSteppers && (
          <button
            onClick={increment}
            disabled={localValue >= max}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-faint hover:text-ink hover:bg-[var(--s-surface-2)] text-sm font-medium transition-all active:scale-95 disabled:opacity-25 disabled:cursor-not-allowed"
            aria-label={`Increase ${label}`}
          >
            +
          </button>
        )}
      </div>
      {slider && (
        <input
          type="range"
          min={sliderMin ?? min}
          max={sliderMax ?? max}
          step={sliderStep ?? step}
          value={localValue}
          onChange={(e) => {
            const v = Number(e.target.value)
            setLocalValue(v)
            throttledOnChange(v)
          }}
          className="w-full mt-2"
          aria-label={`${label} slider`}
        />
      )}
    </div>
  )
}
