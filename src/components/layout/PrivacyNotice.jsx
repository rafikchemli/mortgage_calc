export default function PrivacyNotice({ prominent = false }) {
  if (prominent) {
    return (
      <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-full mx-auto w-fit"
        style={{ background: 'color-mix(in srgb, var(--s-teal) 8%, transparent)' }}
      >
        <svg className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--s-teal)' }} viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0L1.5 3v4.5c0 4.1 2.8 7.9 6.5 8.5 3.7-.6 6.5-4.4 6.5-8.5V3L8 0zm0 2.1l4.5 2.1v3.3c0 3.2-2.1 6.1-4.5 6.8-2.4-.7-4.5-3.6-4.5-6.8V4.2L8 2.1z" />
          <path d="M7 9.4L5.3 7.7l-.9.9L7 11.2l3.6-3.6-.9-.9L7 9.4z" />
        </svg>
        <span className="text-[11px] font-medium" style={{ color: 'var(--s-teal)' }}>
          No data stored — everything runs in your browser
        </span>
      </div>
    )
  }

  return (
    <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div className="flex items-center gap-1.5 text-[10px] text-ink-faint opacity-60">
        <svg className="w-3 h-3 shrink-0" style={{ color: 'var(--s-teal)' }} viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0L1.5 3v4.5c0 4.1 2.8 7.9 6.5 8.5 3.7-.6 6.5-4.4 6.5-8.5V3L8 0zm0 2.1l4.5 2.1v3.3c0 3.2-2.1 6.1-4.5 6.8-2.4-.7-4.5-3.6-4.5-6.8V4.2L8 2.1z" />
          <path d="M7 9.4L5.3 7.7l-.9.9L7 11.2l3.6-3.6-.9-.9L7 9.4z" />
        </svg>
        No data stored. Everything runs in your browser.
      </div>
    </div>
  )
}
