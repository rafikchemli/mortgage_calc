import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function InfoTip({ text }) {
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const tipRef = useRef(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  const updatePos = useCallback(() => {
    if (!btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    const tipW = 224 // w-56 = 14rem = 224px
    let left = r.left + r.width / 2 - tipW / 2
    // Clamp to viewport
    left = Math.max(8, Math.min(left, window.innerWidth - tipW - 8))
    setPos({ top: r.top - 8, left })
  }, [])

  useEffect(() => {
    if (!open) return
    updatePos()
    const handleClickOutside = (e) => {
      if (btnRef.current?.contains(e.target)) return
      if (tipRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('pointerdown', handleClickOutside)
    window.addEventListener('scroll', updatePos, true)
    window.addEventListener('resize', updatePos)
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
      window.removeEventListener('scroll', updatePos, true)
      window.removeEventListener('resize', updatePos)
    }
  }, [open, updatePos])

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center w-7 h-7 cursor-help"
        aria-label="More info"
      >
        <span
          className="inline-flex items-center justify-center w-3.5 h-3.5 text-[8px] font-semibold rounded-full text-ink-faint hover:text-ink-muted transition-colors"
          style={{ background: 'var(--s-surface-3)' }}
        >
          ?
        </span>
      </button>
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              ref={tipRef}
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="fixed w-56 p-3 rounded-xl shadow-lg border text-[11px] leading-relaxed text-ink-muted z-[9999]"
              style={{
                background: 'var(--s-surface-1)',
                borderColor: 'var(--s-border)',
                top: pos.top,
                left: pos.left,
                transform: 'translateY(-100%)',
              }}
            >
              {text}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
