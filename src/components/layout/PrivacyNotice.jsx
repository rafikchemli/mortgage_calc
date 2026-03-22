export default function PrivacyNotice() {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] text-ink-faint" style={{ background: 'color-mix(in srgb, var(--s-surface-1) 80%, transparent)', backdropFilter: 'blur(8px)' }}>
        <svg className="w-3 h-3 shrink-0" style={{ color: 'var(--s-teal)' }} viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0L1.5 3v4.5c0 4.1 2.8 7.9 6.5 8.5 3.7-.6 6.5-4.4 6.5-8.5V3L8 0zm0 2.1l4.5 2.1v3.3c0 3.2-2.1 6.1-4.5 6.8-2.4-.7-4.5-3.6-4.5-6.8V4.2L8 2.1z" />
          <path d="M7 9.4L5.3 7.7l-.9.9L7 11.2l3.6-3.6-.9-.9L7 9.4z" />
        </svg>
        100% local — your data never leaves this device
      </div>
    </div>
  )
}
