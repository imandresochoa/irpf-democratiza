import { useMemo, useState } from 'react'
import {
  computeInflationComparisonRow,
  computePayrollBreakdown,
  getCalculatorTaxYear,
  TAX_YEARS,
} from '../domain/tax'
import { EurAmountInput } from '../components/EurAmountInput'
import { NetEvolutionChart } from '../components/NetEvolutionChart'
import { formatEur, formatPct, parseEurInputToNumber } from '../lib/format'

export function LandingPage() {
  const quickCalcYear = getCalculatorTaxYear()
  const [quickGrossInput, setQuickGrossInput] = useState('15574,85')

  const quickGrossAnnual = useMemo(() => {
    const value = parseEurInputToNumber(quickGrossInput)
    return value !== null && value > 0 ? value : null
  }, [quickGrossInput])

  const quickNetAnnual = useMemo(() => {
    if (quickGrossAnnual === null) return null
    return computePayrollBreakdown(quickGrossAnnual, getCalculatorTaxYear()).salarioNeto
  }, [quickGrossAnnual])

  const netEvolutionPoints = useMemo(() => {
    if (quickGrossAnnual === null) return null
    return TAX_YEARS.map((year) => {
      const row = computeInflationComparisonRow(year, quickGrossAnnual)
      return { year, net: row.netoRealEnSuAnoEur2026 }
    })
  }, [quickGrossAnnual])

  /** IRPF + cot. trabajador, % sobre el bruto fijado (€ {quickCalcYear} comparables), norma y reexpresión por IPC como en el neto. */
  const fiscalLoadPoints = useMemo(() => {
    if (quickGrossAnnual === null) return null
    return TAX_YEARS.map((year) => {
      const row = computeInflationComparisonRow(year, quickGrossAnnual)
      const bruto = row.salarioEquivalente2026
      if (bruto <= 0) return { year, net: 0 }
      const pct = (100 * (row.irpfEur2026 + row.ssTraEur2026)) / bruto
      return { year, net: pct }
    })
  }, [quickGrossAnnual])

  return (
    <div className="space-y-10">
      <section
        className="flex w-full min-h-[calc(100dvh-7rem)] flex-col sm:min-h-[calc(100vh-7rem)]"
        aria-label="Intro"
      >
        <div className="min-h-0 w-full flex-1 basis-0" aria-hidden="true" />
        <div className="w-full shrink-0">
          <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-12 lg:gap-x-4 lg:gap-y-0">
            <div className="@container min-w-0 lg:col-span-7">
              <h1
                className="m-0 w-full [font-size:clamp(1.25rem,0.2rem+6cqw,6rem)] [font-family:var(--font-sans)] font-semibold leading-[1.2] text-neutral-900"
              >
                Descubre cuál es tu salario real después de impuestos
              </h1>
            </div>
            <div className="flex w-full min-w-0 flex-col pt-0 lg:col-span-5 lg:pt-0.5">
              <p className="m-0 text-hero-lead [font-family:var(--font-serif)] text-neutral-800">
                Prueba un bruto anual y ve el neto estimado para el ejercicio en curso. El gráfico muestra
                cómo habría variado tu neto en años anteriores (misma norma de cada año, reexpresado a
                euros actuales con el IPC encadenado).
              </p>
            </div>
          </div>
        </div>
        <div className="h-24 w-full shrink-0 sm:h-32" aria-hidden="true" />
        <div className="grid w-full shrink-0 content-start gap-4 md:grid-cols-2 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-xl bg-neutral-100 p-6 lg:col-span-3 lg:min-h-80">
            <p
              className="m-0 whitespace-nowrap text-3xl font-semibold leading-none tracking-[-0.025em] text-neutral-900"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Calculadora
            </p>
            <div className="my-6">
              <p className="m-0 text-base text-neutral-800">Neto estimado en {quickCalcYear}</p>
              <p className="mt-1 mb-0 text-[clamp(2.25rem,4vw,4.5rem)] font-semibold leading-none tracking-[-0.055em] text-neutral-900">
                {quickNetAnnual !== null ? formatEur(quickNetAnnual, 0) : 'Introduce un bruto'}
              </p>
            </div>
            <div>
              <label htmlFor="quick-gross" className="block text-base text-neutral-800">
                Bruto anual (€ {quickCalcYear})
              </label>
              <EurAmountInput
                id="quick-gross"
                className="mt-2 w-full rounded-lg bg-[var(--color-surface)] px-3 py-2 text-base text-neutral-900 placeholder:text-neutral-700"
                value={quickGrossInput}
                onValueChange={setQuickGrossInput}
                placeholder="35.000,00 €"
              />
            </div>
          </div>
          <div className="flex min-h-80 min-w-0 flex-col overflow-visible rounded-xl bg-[var(--color-brand-green-soft)] lg:col-span-4">
            <div className="px-6 pt-6">
              <p
                className="m-0 text-3xl font-semibold leading-none tracking-[-0.025em] text-neutral-900"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Evolución del neto
              </p>
              <p className="mb-0 mt-2 text-base text-neutral-800" style={{ fontFamily: 'var(--font-serif)' }}>
                Neto de cada ejercicio (norma de ese año) reexpresado a euros {quickCalcYear} con el IPC
                encadenado.
              </p>
            </div>
            <div className="mt-4 flex min-h-0 flex-1 flex-col justify-end">
              <NetEvolutionChart points={netEvolutionPoints} className="h-40" />
            </div>
          </div>
          <div className="flex min-h-80 min-w-0 flex-col overflow-visible rounded-xl bg-[var(--color-brand-terracotta-soft)] lg:col-span-5">
            <div className="px-6 pt-6">
              <p
                className="m-0 text-3xl font-semibold leading-none tracking-[-0.025em] text-neutral-900"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Carga fiscal
              </p>
              <p className="mb-0 mt-2 text-base text-neutral-800" style={{ fontFamily: 'var(--font-serif)' }}>
                IRPF retenido más cotizaciones del trabajador, en % de tu bruto fijado (€ {quickCalcYear}{' '}
                comparables, norma de cada ejercicio e IPC).
              </p>
            </div>
            <div className="mt-4 flex min-h-0 flex-1 flex-col justify-end">
              <NetEvolutionChart
                points={fiscalLoadPoints}
                className="h-40"
                variant="terracotta"
                formatY={(n) => formatPct(n, 1)}
                deltaMode="percentagePoints"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
