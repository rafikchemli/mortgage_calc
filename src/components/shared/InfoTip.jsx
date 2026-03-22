import { useState, useRef, useEffect } from 'react'

export default function InfoTip({ text }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', handleClick)
    return () => document.removeEventListener('pointerdown', handleClick)
  }, [open])

  return (
    <span ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center w-3.5 h-3.5 text-[8px] font-semibold rounded-full bg-surface-3 text-ink-faint hover:text-ink-muted transition-colors cursor-help"
        aria-label="More info"
      >
        ?
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-56 p-2.5 rounded-lg bg-surface-3 border border-ink-ghost shadow-lg text-[11px] leading-relaxed text-ink-muted z-50">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-surface-3 border-r border-b border-ink-ghost rotate-45 -mt-1" />
        </div>
      )}
    </span>
  )
}
