import { useState, useEffect } from 'react'
import AnimatedNumber from '../shared/AnimatedNumber'

export default function StickyResult({ computed }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show sticky bar once user scrolls past the verdict section
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  const { costBreakdown, housingPercent, activePrice } = computed
  const housingColor = housingPercent < 30 ? 'var(--s-teal)' : housingPercent < 40 ? 'var(--s-gold)' : housingPercent < 50 ? 'var(--s-copper)' : 'var(--s-danger)'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden border-t"
      style={{
        background: 'var(--s-surface-1)',
        borderColor: 'var(--s-border)',
        animation: 'privacy-in 0.3s ease forwards',
      }}
    >
      <div className="max-w-2xl mx-auto flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-[10px] text-ink-faint uppercase tracking-wider">Monthly</p>
          <p className="display-number text-xl leading-none mt-0.5">
            <AnimatedNumber value={costBreakdown.total} />
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-ink-faint uppercase tracking-wider">Max Price</p>
          <p className="display-number text-base leading-none mt-0.5">
            <AnimatedNumber value={activePrice} />
          </p>
        </div>
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ background: housingColor }}
          title={`${housingPercent}% of income`}
        />
      </div>
    </div>
  )
}
