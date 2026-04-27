import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuickGross } from '../context/QuickGrossContext'
import { BrandLogo } from './BrandLogo'
import { EurAmountInput } from './EurAmountInput'
import { SiteFooter } from './SiteFooter'

export function AppShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const { quickGrossInput, setQuickGrossInput, calculatorSectionRef } = useQuickGross()
  const [headerBrutoVisible, setHeaderBrutoVisible] = useState(false)
  const isHome = pathname === '/'
  const headerGrossWidthCh = useMemo(() => {
    const fallback = '35.000,00 €'
    const base = (quickGrossInput && quickGrossInput.trim().length > 0 ? quickGrossInput : fallback).replace(/\s/g, '')
    const ch = base.length + 0.6
    return Math.max(7.5, Math.min(12.5, ch))
  }, [quickGrossInput])

  const updateHeaderBrutoVisibility = useCallback(() => {
    const el = calculatorSectionRef.current
    const scrollY = window.scrollY || document.documentElement.scrollTop
    // En cuanto el usuario hace scroll, o si la calculadora entra bajo la barra sticky (h-14 ≈ 56px).
    if (el == null) {
      setHeaderBrutoVisible(scrollY > 12)
      return
    }
    const rect = el.getBoundingClientRect()
    const stickyHeaderPx = 56
    setHeaderBrutoVisible(scrollY > 12 || rect.top < stickyHeaderPx)
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
            {isHome ? (
              <Link
                to="/"
                className="flex min-w-0 items-center gap-2.5 text-base font-semibold tracking-tight text-neutral-900 no-underline"
              >
                <BrandLogo menu className="h-8 w-auto shrink-0" />
                <span className="min-w-0 truncate sm:whitespace-normal">Comparador de sueldo neto</span>
              </Link>
            ) : (
              <Link
                to="/"
                className="text-base font-medium text-neutral-700 no-underline underline-offset-2 hover:text-neutral-900 hover:underline"
              >
                ← Volver al comparador
              </Link>
            )}
          </div>
          {headerBrutoVisible ? (
            <div className="flex shrink-0 items-end gap-2 sm:items-center">
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
                style={{ width: `${headerGrossWidthCh}ch` }}
                className="min-w-0 rounded-lg bg-transparent px-0 py-1.5 text-right text-sm text-neutral-900 placeholder:text-neutral-700 underline decoration-dashed decoration-2 [text-decoration-color:var(--color-focus)] underline-offset-[0.2em] outline-none focus:underline focus-visible:underline focus:!outline-none focus-visible:!outline-none sm:py-2 sm:text-base"
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
