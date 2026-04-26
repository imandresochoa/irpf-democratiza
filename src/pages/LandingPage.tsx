import { useMemo } from 'react'
import {
  brutoNominalAeur2012Comparables,
  computeInflationComparisonRow,
  computePayrollBreakdown,
  INFLATION_COMPARISON_REF_YEAR,
  netoReexpresadoAeurAñoElegido,
  TAX_YEARS,
} from '../domain/tax'
import { useQuickGross } from '../context/QuickGrossContext'
import { ComparisonHeadlineValue } from '../components/ComparisonHeadlineValue'
import { PurchasingPowerRefYearExplorer } from '../components/PurchasingPowerRefYearExplorer'
import { YearValueTable } from '../components/YearValueTable'
import { EurAmountInput } from '../components/EurAmountInput'
import { NetEvolutionChart } from '../components/NetEvolutionChart'
import { formatEur, formatPct, parseEurInputToNumber } from '../lib/format'

/** Misma caja y espaciado para Poder adquisitivo e IRPF (comparar ejercicios). */
const kComparisonTableCardClass =
  'flex min-w-0 flex-col gap-5 rounded-xl border border-neutral-200/70 bg-neutral-100 p-5 [font-family:var(--font-sans)] sm:gap-6 sm:p-6'
const kComparisonTableTitle = 'm-0 min-w-0 flex-1 pr-1 text-lg font-medium leading-snug text-neutral-800 sm:pr-2 sm:text-xl'
const kComparisonTableHeadline = 'm-0 shrink-0 pl-2 text-right text-lg font-medium leading-snug tabular-nums text-neutral-500 sm:max-w-[48%] sm:pl-3 sm:text-xl'
const kComparisonTableDesc = 'mb-0 mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base'

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

  /** Mismo “bruto fijo” de la calculadora, homogeneizado a € 2012 para toda la comparación IPC. */
  const brutoEur2012 = useMemo(() => {
    if (quickGrossAnnual === null) return null
    return brutoNominalAeur2012Comparables(quickGrossAnnual, quickCalcYear)
  }, [quickGrossAnnual, quickCalcYear])

  const netEvolutionPoints = useMemo(() => {
    if (brutoEur2012 === null) return null
    return TAX_YEARS.map((year) => {
      const row = computeInflationComparisonRow(year, brutoEur2012)
      return { year, net: netoReexpresadoAeurAñoElegido(row, quickCalcYear) }
    })
  }, [brutoEur2012, quickCalcYear])

  /** IRPF + cot. trabajador, % sobre el bruto fijado (€ 2012 comparables), norma y reexpresión por IPC como en el neto. */
  const fiscalLoadPoints = useMemo(() => {
    if (brutoEur2012 === null) return null
    return TAX_YEARS.map((year) => {
      const row = computeInflationComparisonRow(year, brutoEur2012)
      const bruto = row.salarioBrutoEur2012
      if (bruto <= 0) return { year, net: 0 }
      const pct = (100 * (row.irpfEur2012 + row.ssTraEur2012)) / bruto
      return { year, net: pct }
    })
  }, [brutoEur2012])

  /**
   * Filas compartidas para tablas: poder adquisitivo, IRPF, y bruto/neto en € del año
   * de comparación (misma reexpresión).
   */
  const comparisonTableRows = useMemo(() => {
    if (brutoEur2012 === null) return null
    return TAX_YEARS.map((year) => {
      const r = computeInflationComparisonRow(year, brutoEur2012)
      return {
        year,
        poder: r.perdidaGananciaAnualPoderAdq,
        irpf: r.irpfEur2012,
        netoEur: r.netoReexpresadoEur2012,
      }
    })
  }, [brutoEur2012])

  /** Cifra del título: diferencia del año de la calculadora frente a 2012 (mismas columnas). */
  const headlineDiffVs2012 = useMemo(() => {
    if (comparisonTableRows == null) return null
    const y2012 = comparisonTableRows.find((r) => r.year === 2012)
    const yEnd = comparisonTableRows.find((r) => r.year === quickCalcYear)
    if (y2012 == null || yEnd == null) return null
    return {
      poder: yEnd.poder - y2012.poder,
      irpf: yEnd.irpf - y2012.irpf,
    }
  }, [comparisonTableRows, quickCalcYear])

  /** Fila del año de la calculadora: neto (€ 2012) compartido por las leyendas del título y la tabla. */
  const comparisonRowForCalcYear = useMemo(() => {
    if (comparisonTableRows == null) return null
    return comparisonTableRows.find((r) => r.year === quickCalcYear) ?? null
  }, [comparisonTableRows, quickCalcYear])

  /** SS trabajador (€ comparables / año). */
  const workerSsPoints = useMemo(() => {
    if (brutoEur2012 === null) return null
    return TAX_YEARS.map((year) => {
      const row = computeInflationComparisonRow(year, brutoEur2012)
      return { year, net: row.ssTraEur2012 }
    })
  }, [brutoEur2012])

  /** Coste laboral aprox. (€ 2012 comparables / año). */
  const laborCostPoints = useMemo(() => {
    if (brutoEur2012 === null) return null
    return TAX_YEARS.map((year) => {
      const row = computeInflationComparisonRow(year, brutoEur2012)
      return { year, net: row.costeLaboralEur2012 }
    })
  }, [brutoEur2012])

  /** Neto anual / coste laboral (mismos € 2012 comparables). */
  const netOverLaborCostPoints = useMemo(() => {
    if (brutoEur2012 === null) return null
    return TAX_YEARS.map((year) => {
      const row = computeInflationComparisonRow(year, brutoEur2012)
      const c = row.costeLaboralEur2012
      if (c <= 0) return { year, net: 0 }
      return { year, net: (100 * row.netoReexpresadoEur2012) / c }
    })
  }, [brutoEur2012])

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
                Neto de cada ejercicio (norma de ese año) reexpresado a euros {quickCalcYear} con el IPC: la
                serie y el neto de arriba comparten unidad, el último punto coincide con la calculadora.
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
                IRPF retenido más cotizaciones del trabajador, en % de tu bruto fijado (€ 2012 comparables,
                norma de cada ejercicio e IPC).
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

        <div className="mt-5 w-full shrink-0 sm:mt-6">
          <PurchasingPowerRefYearExplorer
            currentYear={quickCalcYear}
            grossNominal={quickGrossAnnual}
            netNominal={quickNetAnnual}
          />
        </div>

        <div className="h-8 w-full shrink-0 sm:h-10" aria-hidden="true" />
        <div className="w-full shrink-0" aria-label="Más comparativas">
          <h2
            className="m-0 text-xl font-semibold text-neutral-900 [font-family:var(--font-serif)] sm:text-2xl"
          >
            Comparar con otros ejercicios
          </h2>
          <p className="mt-2 m-0 max-w-3xl text-base text-neutral-700 [font-family:var(--font-serif)]">
            Misma lógica que la documentación interna: norma y parámetros de cada año; importes en € 2012
            comparables (IPC diciembre–diciembre). Tabla año a año; el resto de secciones siguen con gráficos.
          </p>
          <div className="mt-6 grid w-full content-start gap-4 md:grid-cols-2">
            <div className={kComparisonTableCardClass}>
              <div>
                <div className="flex w-full min-w-0 items-start justify-between gap-3 sm:gap-4">
                  <p className={kComparisonTableTitle}>Poder adquisitivo</p>
                  {headlineDiffVs2012 != null && brutoEur2012 !== null && comparisonRowForCalcYear != null ? (
                    <ComparisonHeadlineValue
                      className={kComparisonTableHeadline}
                      displayEur={headlineDiffVs2012.poder}
                      kind="poder"
                      year={quickCalcYear}
                      refYear={INFLATION_COMPARISON_REF_YEAR}
                      delta={headlineDiffVs2012.poder}
                      netoEur2012={comparisonRowForCalcYear.netoEur}
                    />
                  ) : null}
                </div>
                <p className={kComparisonTableDesc}>
                  Cuánto ganas o pierdes al año, en € 2012 comparables, respecto a la norma de{' '}
                  {INFLATION_COMPARISON_REF_YEAR} con el mismo poder adquisitivo nominal (bruto de{' '}
                  {quickCalcYear} llevado a esa base).
                </p>
              </div>
              <YearValueTable
                rows={
                  comparisonTableRows?.map((r) => ({
                    year: r.year,
                    value: r.poder,
                    netoEur: r.netoEur,
                  })) ?? null
                }
                valueColumnLabel="Diferencia"
                formatValue={(n) => formatEur(n, 0)}
                comparableYear={INFLATION_COMPARISON_REF_YEAR}
                legendKind="poder"
              />
            </div>
            <div className={kComparisonTableCardClass}>
              <div>
                <div className="flex w-full min-w-0 items-start justify-between gap-3 sm:gap-4">
                  <p className={kComparisonTableTitle}>IRPF retenido</p>
                  {headlineDiffVs2012 != null && brutoEur2012 !== null && comparisonRowForCalcYear != null ? (
                    <ComparisonHeadlineValue
                      className={kComparisonTableHeadline}
                      displayEur={headlineDiffVs2012.irpf}
                      kind="irpf"
                      year={quickCalcYear}
                      refYear={INFLATION_COMPARISON_REF_YEAR}
                      delta={headlineDiffVs2012.irpf}
                      netoEur2012={comparisonRowForCalcYear.netoEur}
                    />
                  ) : null}
                </div>
                <p className={kComparisonTableDesc}>
                  IRPF retenido de cada norma, en € 2012 comparables (IPC), con el mismo bruto fijo en esa
                  base; así ves cómo varía el impuesto.
                </p>
              </div>
              <YearValueTable
                rows={
                  comparisonTableRows?.map((r) => ({
                    year: r.year,
                    value: r.irpf,
                    netoEur: r.netoEur,
                  })) ?? null
                }
                valueColumnLabel="IRPF (€ c.)"
                formatValue={(n) => formatEur(n, 0)}
                comparableYear={INFLATION_COMPARISON_REF_YEAR}
                legendKind="irpf"
              />
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
                  Cuota de la Seguridad Social (trabajador) de cada norma, en € 2012 comparables (IPC).
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
                  Coste total aproximado (trabajador y empresa) bajo la norma de cada ejercicio, en € 2012
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
                  Porcentaje del coste laboral que acaba en neto (mismos € 2012 comparables en numerador y
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
