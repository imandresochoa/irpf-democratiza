import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'

/** La cabecera solo se muestra a partir de este desplazamiento; arriba del todo queda oculta. */
const REVEAL_HEADER_AFTER_SCROLL_PX = 200

export function AppShell({ children }: { children: ReactNode }) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const frameId = useRef<number | null>(null)

  const updateHeaderVisibility = useCallback(() => {
    if (frameId.current !== null) {
      window.cancelAnimationFrame(frameId.current)
    }
    frameId.current = window.requestAnimationFrame(() => {
      frameId.current = null
      const y = window.scrollY
      const root = headerRef.current
      const focusInHeader = root != null && root.contains(document.activeElement)
      setIsHeaderVisible(y >= REVEAL_HEADER_AFTER_SCROLL_PX || focusInHeader)
    })
  }, [])

  useEffect(() => {
    updateHeaderVisibility()
    window.addEventListener('scroll', updateHeaderVisibility, { passive: true })
    window.addEventListener('focusin', updateHeaderVisibility)
    window.addEventListener('focusout', updateHeaderVisibility)
    return () => {
      window.removeEventListener('scroll', updateHeaderVisibility)
      window.removeEventListener('focusin', updateHeaderVisibility)
      window.removeEventListener('focusout', updateHeaderVisibility)
      if (frameId.current !== null) {
        window.cancelAnimationFrame(frameId.current)
      }
    }
  }, [updateHeaderVisibility])

  return (
    <div className="flex min-h-screen flex-col">
      <header
        ref={headerRef}
        className={[
          'sticky top-0 z-10 border-b border-transparent bg-[var(--color-surface)]/95 backdrop-blur-sm transition-transform duration-200 ease-out motion-reduce:transition-none',
          isHeaderVisible
            ? 'translate-y-0 border-b-neutral-200/50 shadow-sm'
            : 'pointer-events-none -translate-y-full',
        ].join(' ')}
        onFocusCapture={updateHeaderVisibility}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6">
          <Link
            to="/"
            className="pointer-events-auto flex items-center gap-2.5 text-base font-semibold tracking-tight text-neutral-900 no-underline"
          >
            <BrandLogo menu className="h-8 w-auto shrink-0" />
            <span>Comparador de sueldo neto</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <footer className="px-4 py-8 text-center text-xs text-neutral-600 sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-3">
          <BrandLogo className="h-12 w-auto opacity-95" />
          <p className="m-0 max-w-md leading-snug">
            Herramienta educativa. No sustituye asesoramiento fiscal o laboral.
          </p>
          <a
            href="https://x.com/Jongonzlz/status/2047638381501313508"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            Origen del proyecto
          </a>
        </div>
      </footer>
    </div>
  )
}
