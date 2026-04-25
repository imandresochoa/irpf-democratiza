import { Link, NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
  ].join(' ')

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-[var(--color-surface-elevated)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="text-sm font-semibold tracking-tight text-neutral-900 no-underline"
          >
            Nómina e IRPF
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
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <footer className="border-t border-neutral-200 bg-neutral-50 py-6 text-center text-xs text-neutral-500">
        Herramienta educativa. No sustituye asesoramiento fiscal o laboral.
      </footer>
    </div>
  )
}
