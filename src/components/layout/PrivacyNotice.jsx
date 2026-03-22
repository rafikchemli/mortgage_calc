import { useState, useEffect } from 'react'

const STORAGE_KEY = 'privacy-seen'

export default function PrivacyNotice() {
  const [visible, setVisible] = useState(false)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return
    // Small delay so it doesn't compete with initial page load
    const show = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(show)
  }, [])

  useEffect(() => {
    if (!visible) return
    const fade = setTimeout(() => {
      setFading(true)
      setTimeout(() => {
        setVisible(false)
        localStorage.setItem(STORAGE_KEY, '1')
      }, 600)
    }, 5000)
    return () => clearTimeout(fade)
  }, [visible])

  const dismiss = () => {
    setFading(true)
    setTimeout(() => {
      setVisible(false)
      localStorage.setItem(STORAGE_KEY, '1')
    }, 400)
  }

  if (!visible) return null

  return (
    <div
      onClick={dismiss}
      role="status"
      className="fixed bottom-5 left-1/2 z-50 cursor-pointer select-none"
      style={{
        transform: 'translateX(-50%)',
        animation: fading
          ? 'privacy-out 0.5s ease forwards'
          : 'privacy-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface border border-ink-ghost shadow-lg backdrop-blur-sm">
        {/* Shield icon — small, semantic */}
        <svg
          className="w-3.5 h-3.5 shrink-0"
          style={{ color: 'var(--s-teal)' }}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M8 0L1.5 3v4.5c0 4.1 2.8 7.9 6.5 8.5 3.7-.6 6.5-4.4 6.5-8.5V3L8 0zm0 2.1l4.5 2.1v3.3c0 3.2-2.1 6.1-4.5 6.8-2.4-.7-4.5-3.6-4.5-6.8V4.2L8 2.1z" />
          <path d="M7 9.4L5.3 7.7l-.9.9L7 11.2l3.6-3.6-.9-.9L7 9.4z" />
        </svg>
        <span className="text-[12px] font-medium text-ink-muted whitespace-nowrap">
          100% local — your data never leaves this device
        </span>
      </div>
    </div>
  )
}
