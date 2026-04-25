import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { BrandLogo } from './BrandLogo'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-base font-normal transition-colors',
    isActive
      ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
  ].join(' ')

export function AppShell({ children }: { children: ReactNode }) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const topVisibilityThreshold = 48
    const scrollDeltaThreshold = 12
    let frameId: number | null = null

    const updateHeaderVisibility = () => {
      const currentScrollY = window.scrollY
      const scrollDelta = currentScrollY - lastScrollY.current

      if (currentScrollY <= topVisibilityThreshold) {
        setIsHeaderVisible(true)
        lastScrollY.current = currentScrollY
        frameId = null
        return
      }

      if (Math.abs(scrollDelta) >= scrollDeltaThreshold) {
        setIsHeaderVisible(scrollDelta < 0)
        lastScrollY.current = currentScrollY
      }

      frameId = null
    }

    const handleScroll = () => {
      if (frameId !== null) return
      frameId = window.requestAnimationFrame(updateHeaderVisibility)
    }

    lastScrollY.current = window.scrollY
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId)
      }
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={[
          'sticky top-0 z-10 bg-[var(--color-surface)] transition-transform duration-200 ease-out motion-reduce:transition-none',
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full',
        ].join(' ')}
        onFocusCapture={() => setIsHeaderVisible(true)}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-neutral-900 no-underline"
          >
            <BrandLogo menu className="h-8 w-auto shrink-0" />
            <span>Nómina e IRPF</span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1" aria-label="Principal">
            <NavLink to="/manual" className={navLinkClass}>
              Manual
            </NavLink>
            <NavLink to="/calcular" className={navLinkClass}>
              Calcular
            </NavLink>
            <NavLink to="/comparar" className={navLinkClass}>
              Comparar
            </NavLink>
            <NavLink to="/normativa" className={navLinkClass}>
              Normativa
            </NavLink>
          </nav>
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
