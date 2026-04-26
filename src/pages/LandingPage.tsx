import { useMemo } from 'react'
import {
  computeInflationComparisonRow,
  computePayrollBreakdown,
  INFLATION_COMPARISON_REF_YEAR,
  TAX_YEARS,
} from '../domain/tax'
import { CompareBarChart } from '../components/CompareBarChart'
import { useQuickGross } from '../context/QuickGrossContext'
import { EurAmountInput } from '../components/EurAmountInput'
import { NetEvolutionChart } from '../components/NetEvolutionChart'
import { formatEur, formatPct, parseEurInputToNumber } from '../lib/format'

export function LandingPage() {
  const { quickGrossInput, setQuickGrossInput, quickCalcYear, calculatorSectionRef } = useQuickGross()

  const quickGrossAnnual = useMemo(() => {
    const value = parseEurInputToNumber(quickGrossInput)
    return value !== null && value > 0 ? value : null
  }, [quickGrossInput])

  const quickNetAnnual = useMemo(() => {
    if (quickGrossAnnual === null) return null
    return computePayrollBreakdown(quickGrossAnnual, quickCalcYear).salarioNeto
  }, [quickGrossAnnual, quickCalcYear])

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

  /** Diferencia de neto anual frente a aplicar la norma de {INFLATION_COMPARISON_REF_YEAR} al mismo bruto (€ comparables, ver `docs/CALCULOS_FUENTE_DE_VERDAD.md`). */
  const purchasingPowerPoints = useMemo(() => {
    if (quickGrossAnnual === null) return null
    return TAX_YEARS.map((year) => {
      const row = computeInflationComparisonRow(year, quickGrossAnnual)
      return { year, net: row.perdidaGananciaAnualPoderAdq }
    })
  }, [quickGrossAnnual])

  /** Retención IRPF por ejercicio reexpresada a euros comparables (misma fila de comparativa). */
  const irpfComparablePoints = useMemo(() => {
    if (quickGrossAnnual === null) return null
    return TAX_YEARS.map((year) => {
      const row = computeInflationComparisonRow(year, quickGrossAnnual)
      return { year, net: row.irpfEur2026 }
    })
  }, [quickGrossAnnual])

  /** SS trabajador (€ comparables / año). */
  const workerSsPoints = useMemo(() => {
    if (quickGrossAnnual === null) return null
    return TAX_YEARS.map((year) => {
      const row = computeInflationComparisonRow(year, quickGrossAnnual)
      return { year, net: row.ssTraEur2026 }
    })
  }, [quickGrossAnnual])

  /** Coste laboral aprox. (€ comparables / año). */
  const laborCostPoints = useMemo(() => {
    if (quickGrossAnnual === null) return null
    return TAX_YEARS.map((year) => {
      const row = computeInflationComparisonRow(year, quickGrossAnnual)
      return { year, net: row.costeLaboralEur2026 }
    })
  }, [quickGrossAnnual])

  /** Neto anual / coste laboral (mismos € comparables). */
  const netOverLaborCostPoints = useMemo(() => {
    if (quickGrossAnnual === null) return null
    return TAX_YEARS.map((year) => {
      const row = computeInflationComparisonRow(year, quickGrossAnnual)
      const c = row.costeLaboralEur2026
      if (c <= 0) return { year, net: 0 }
      return { year, net: (100 * row.netoRealEnSuAnoEur2026) / c }
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
                Prueba un bruto: neto, carga, poder adquisitivo, IRPF, cotizaciones, coste laboral y qué
                parte del coste se queda en neto — todo con el IPC y la norma de cada año, como en la
                hoja de cálculo de referencia.
              </p>
            </div>
          </div>
        </div>
        <div className="h-24 w-full shrink-0 sm:h-32" aria-hidden="true" />
        <div className="grid w-full shrink-0 content-start gap-4 md:grid-cols-2 lg:grid-cols-12">
          <div
            ref={calculatorSectionRef}
            className="flex flex-col justify-between rounded-xl bg-neutral-100 p-6 lg:col-span-3 lg:min-h-80"
          >
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

        <div className="h-8 w-full shrink-0 sm:h-10" aria-hidden="true" />
        <div className="w-full shrink-0" aria-label="Más comparativas">
          <h2
            className="m-0 text-xl font-semibold text-neutral-900 [font-family:var(--font-serif)] sm:text-2xl"
          >
            Comparar con otros ejercicios
          </h2>
          <p className="mt-2 m-0 max-w-3xl text-base text-neutral-700 [font-family:var(--font-serif)]">
            Misma lógica que la documentación interna: norma y parámetros de cada año, inflación
            diciembre–diciembre hasta {quickCalcYear}. Pasa el cursor (línea o barras) para el detalle por
            año.
          </p>
          <div className="mt-6 grid w-full content-start gap-4 md:grid-cols-2">
            <div className="flex min-h-80 min-w-0 flex-col overflow-visible rounded-xl bg-[var(--color-brand-lavender-soft)]">
              <div className="px-6 pt-6">
                <p
                  className="m-0 text-2xl font-semibold leading-tight tracking-[-0.02em] text-neutral-900 sm:text-3xl"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Poder adquisitivo
                </p>
                <p className="mb-0 mt-2 text-base text-neutral-800" style={{ fontFamily: 'var(--font-serif)' }}>
                  Cuánto ganas o pierdes al año, en euros {quickCalcYear} comparables, respecto a lo que
                  dejaría la norma de {INFLATION_COMPARISON_REF_YEAR} con el mismo bruto. Cero: igual que
                  hoy; por encima: mejor; por debajo: peor.
                </p>
              </div>
              <div className="mt-4 flex min-h-0 flex-1 flex-col justify-end">
                <CompareBarChart
                  points={purchasingPowerPoints}
                  className="h-44"
                  variant="lavender"
                  formatY={(n) => formatEur(n, 0)}
                  tooltipSubtitle={`Frente a la norma de ${INFLATION_COMPARISON_REF_YEAR} (mismo bruto, € comparables).`}
                />
              </div>
            </div>
            <div className="flex min-h-80 min-w-0 flex-col overflow-visible rounded-xl bg-[var(--color-brand-mint-soft)]">
              <div className="px-6 pt-6">
                <p
                  className="m-0 text-2xl font-semibold leading-tight tracking-[-0.02em] text-neutral-900 sm:text-3xl"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  IRPF retenido
                </p>
                <p className="mb-0 mt-2 text-base text-neutral-800" style={{ fontFamily: 'var(--font-serif)' }}>
                  Importe de IRPF de cada ejercicio llevado a euros {quickCalcYear} (IPC), para ver cómo
                  sube o baja la carga de impuesto aun con el mismo poder adquisitivo nominal.
                </p>
              </div>
              <div className="mt-4 flex min-h-0 flex-1 flex-col justify-end">
                <CompareBarChart
                  points={irpfComparablePoints}
                  className="h-44"
                  variant="terracotta"
                  tooltipBgClassName="bg-[color-mix(in_srgb,var(--color-brand-mint-soft)_50%,var(--color-surface))]"
                  formatY={(n) => formatEur(n, 0)}
                  showDeltaVsFirst
                />
              </div>
            </div>
          </div>
        </div>

        <div className="h-8 w-full shrink-0 sm:h-10" aria-hidden="true" />
        <div className="w-full shrink-0" aria-label="Cotizaciones y coste laboral">
          <h2
            className="m-0 text-xl font-semibold text-neutral-900 [font-family:var(--font-serif)] sm:text-2xl"
          >
            Cotizaciones, coste y reparto
          </h2>
          <p className="mt-2 m-0 max-w-3xl text-base text-neutral-700 [font-family:var(--font-serif)]">
            Mismas filas de comparativa: cotización del trabajador, coste laboral aproximado (empresa y
            trabajador) y qué porcentaje del coste se traduce en neto.
          </p>
          <div className="mt-6 grid w-full content-start gap-4 lg:grid-cols-3">
            <div className="flex min-h-72 min-w-0 flex-col overflow-visible rounded-xl bg-[var(--color-brand-blue-soft)]">
              <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                <p
                  className="m-0 text-2xl font-semibold leading-tight tracking-[-0.02em] text-neutral-900"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Cotización trabajador
                </p>
                <p className="mb-0 mt-2 text-base text-neutral-800" style={{ fontFamily: 'var(--font-serif)' }}>
                  Cuota de la Seguridad Social (trabajador) de cada norma, en euros {quickCalcYear}{' '}
                  comparables (IPC).
                </p>
              </div>
              <div className="mt-3 flex min-h-0 flex-1 flex-col justify-end px-2 sm:px-3">
                <NetEvolutionChart
                  points={workerSsPoints}
                  className="h-40"
                  variant="pink"
                  tooltipBgClassName="bg-[color-mix(in_srgb,var(--color-brand-blue-soft)_50%,var(--color-surface))]"
                  formatY={(n) => formatEur(n, 0)}
                />
              </div>
            </div>
            <div className="flex min-h-72 min-w-0 flex-col overflow-visible rounded-xl bg-[var(--color-brand-pink-soft)]">
              <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                <p
                  className="m-0 text-2xl font-semibold leading-tight tracking-[-0.02em] text-neutral-900"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Coste laboral
                </p>
                <p className="mb-0 mt-2 text-base text-neutral-800" style={{ fontFamily: 'var(--font-serif)' }}>
                  Coste total aproximado (trabajador y empresa) bajo la norma de cada ejercicio, en €
                  comparables.
                </p>
              </div>
              <div className="mt-3 flex min-h-0 flex-1 flex-col justify-end px-2 sm:px-3">
                <NetEvolutionChart
                  points={laborCostPoints}
                  className="h-40"
                  variant="blue"
                  tooltipBgClassName="bg-[color-mix(in_srgb,var(--color-brand-pink-soft)_50%,var(--color-surface))]"
                  formatY={(n) => formatEur(n, 0)}
                />
              </div>
            </div>
            <div className="flex min-h-72 min-w-0 flex-col overflow-visible rounded-xl bg-[var(--color-brand-peach-soft)]">
              <div className="px-5 pt-5 sm:px-6 sm:pt-6">
                <p
                  className="m-0 text-2xl font-semibold leading-tight tracking-[-0.02em] text-neutral-900"
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  Neto del coste laboral
                </p>
                <p className="mb-0 mt-2 text-base text-neutral-800" style={{ fontFamily: 'var(--font-serif)' }}>
                  Porcentaje del coste laboral que acaba en neto (mismos € comparables en numerador y
                  denominador).
                </p>
              </div>
              <div className="mt-3 flex min-h-0 flex-1 flex-col justify-end px-2 sm:px-3">
                <NetEvolutionChart
                  points={netOverLaborCostPoints}
                  className="h-40"
                  variant="mint"
                  tooltipBgClassName="bg-[color-mix(in_srgb,var(--color-brand-peach-soft)_50%,var(--color-surface))]"
                  formatY={(n) => formatPct(n, 1)}
                  deltaMode="percentagePoints"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
