import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useQuickGross } from '../context/QuickGrossContext'
import { BrandLogo } from './BrandLogo'
import { EurAmountInput } from './EurAmountInput'
import { SiteFooter } from './SiteFooter'

export function AppShell({ children }: { children: ReactNode }) {
  const { quickGrossInput, setQuickGrossInput, calculatorSectionRef } = useQuickGross()
  const [headerBrutoVisible, setHeaderBrutoVisible] = useState(false)

  const updateHeaderBrutoVisibility = useCallback(() => {
    const el = calculatorSectionRef.current
    if (el == null) {
      setHeaderBrutoVisible(false)
      return
    }
    // Toda la tarjeta calculadora quedó por encima del viewport: el usuario ha pasado esa sección.
    setHeaderBrutoVisible(el.getBoundingClientRect().bottom < 0)
  }, [calculatorSectionRef])

  useEffect(() => {
    updateHeaderBrutoVisibility()
    window.addEventListener('scroll', updateHeaderBrutoVisibility, { passive: true })
    window.addEventListener('resize', updateHeaderBrutoVisibility, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateHeaderBrutoVisibility)
      window.removeEventListener('resize', updateHeaderBrutoVisibility)
    }
  }, [updateHeaderBrutoVisibility])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b border-neutral-200/50 bg-[var(--color-surface)]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:px-6">
          <div className="min-w-0 min-h-0 flex-1">
            <Link
              to="/"
              className="flex min-w-0 items-center gap-2.5 text-base font-semibold tracking-tight text-neutral-900 no-underline"
            >
              <BrandLogo menu className="h-8 w-auto shrink-0" />
              <span className="min-w-0 truncate sm:whitespace-normal">Comparador de sueldo neto</span>
            </Link>
          </div>
          {headerBrutoVisible ? (
            <div className="flex shrink-0 items-end gap-0.5 sm:items-center">
              <label
                htmlFor="header-quick-gross"
                className="shrink-0 text-sm text-neutral-800 max-sm:sr-only"
              >
                Bruto:
              </label>
              <EurAmountInput
                id="header-quick-gross"
                value={quickGrossInput}
                onValueChange={setQuickGrossInput}
                placeholder="35.000,00 €"
                className="w-28 min-w-0 rounded-lg bg-[var(--color-surface)] px-2 py-1.5 text-sm text-neutral-900 placeholder:text-neutral-700 underline decoration-dashed decoration-2 [text-decoration-color:var(--color-focus)] underline-offset-[0.2em] transition-[text-decoration-color] duration-200 hover:[text-decoration-color:color-mix(in_srgb,var(--color-focus)_48%,var(--color-neutral-400))] focus:no-underline focus-visible:no-underline focus:outline-none focus-visible:outline-none sm:w-40 sm:px-3 sm:py-2 sm:text-base"
              />
            </div>
          ) : null}
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <SiteFooter />
    </div>
  )
}
