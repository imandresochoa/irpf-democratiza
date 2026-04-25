import { useId, useState, type ReactNode } from 'react'

export function Collapsible({
  title,
  children,
  defaultOpen = false,
}: {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const id = useId()
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-lg border border-neutral-200 bg-[var(--color-surface-elevated)]">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-neutral-900"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        {title}
        <span className="text-neutral-400" aria-hidden>
          {open ? '−' : '+'}
        </span>
      </button>
      {open ? (
        <div id={id} className="border-t border-neutral-100 px-4 py-3 text-sm text-neutral-700">
          {children}
        </div>
      ) : null}
    </div>
  )
}
