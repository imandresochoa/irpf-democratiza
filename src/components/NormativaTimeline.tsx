import { NORMATIVA_TIMELINE } from '../data/normativa'

export function NormativaTimeline() {
  const items = NORMATIVA_TIMELINE

  return (
    <div className="w-full">
      <ol className="m-0 list-none space-y-1 p-0">
        {items.map((item, i) => (
          <li key={`${item.year}-${i}-${item.href}`}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="grid min-h-16 grid-cols-[minmax(0,1fr)_auto] items-center gap-6 py-[1.125rem] text-neutral-900 no-underline transition-colors hover:text-neutral-700 sm:gap-10"
            >
              <span className="min-w-0 text-base font-medium leading-snug tracking-[-0.01em]">
                {item.title}
              </span>
              <span className="shrink-0 text-right text-base font-medium leading-none text-neutral-600 tabular-nums">
                {item.year}
              </span>
              <span className="sr-only">(enlace externo, nueva pestaña)</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}
