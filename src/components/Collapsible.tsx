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
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 rounded-lg bg-neutral-100 px-4 py-3 text-left text-base font-normal text-neutral-900"
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
        <div id={id} className="px-4 py-3 text-base text-neutral-700">
          {children}
        </div>
      ) : null}
    </div>
  )
}
