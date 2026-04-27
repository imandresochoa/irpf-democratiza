import { useMemo, useState } from 'react'
import {
  brutoNominalAeur2012Comparables,
  computeInflationComparisonRow,
  computeNominaAgregada,
  computePayrollBreakdown,
  IPC_ANUAL_DIC,
  netoReexpresadoAeurAñoElegido,
  precios2012HastaAnio,
  round2,
  TAX_YEARS,
  type TaxYear,
} from '../domain/tax'
import { useQuickGross } from '../context/QuickGrossContext'
import { PurchasingPowerRefYearExplorer } from '../components/PurchasingPowerRefYearExplorer'
import { PayrollYearComparisonTable } from '../components/PayrollYearComparisonTable'
import { EurAmountInput } from '../components/EurAmountInput'
import { NetEvolutionChart } from '../components/NetEvolutionChart'
import { MultiSeriesEvolutionChart, type MultiSeries } from '../components/MultiSeriesEvolutionChart'
import { formatEur, formatPct, parseEurInputToNumber } from '../lib/format'

/** Caja de la tabla única año a año (nómina / coste). */
const kComparisonTableCardClass =
  'flex min-w-0 flex-col gap-5 rounded-xl border border-neutral-200/70 bg-neutral-100 p-5 [font-family:var(--font-sans)] sm:gap-6 sm:p-6'
const toggleBtnBase =
  'inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]'
const comparadaTitleClass =
  'm-0 text-2xl font-semibold leading-tight text-neutral-900 sm:text-3xl'
const comparadaMetricClass = 'm-0 text-sm font-medium leading-tight'

function formatSignedEur(n: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    signDisplay: 'exceptZero',
    useGrouping: 'always',
  }).format(n)
}

function masOMenos(n: number): 'más' | 'menos' | 'igual' {
  if (n > 0) return 'más'
  if (n < 0) return 'menos'
  return 'igual'
}

export function LandingPage() {
  const { quickGrossInput, setQuickGrossInput, quickCalcYear, calculatorSectionRef } = useQuickGross()
  const [escenarioIrpfDeflactado, setEscenarioIrpfDeflactado] = useState(false)

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
   * Tabla nómina: mismo bruto nominal (el de la calculadora) y norma de cada ejercicio; importes nominales
   * de ese año, sin reexpresión por IPC.
   */
  const payrollComparisonRows = useMemo(() => {
    if (quickGrossAnnual === null) return null
    const g = quickGrossAnnual
    return TAX_YEARS.map((year) => {
      const bd = computePayrollBreakdown(g, year)
      return {
        year,
        bruto: bd.salarioBruto,
        cotTrabajador: bd.cotTrabajador,
        irpf: bd.irpfFinal,
        neto: bd.salarioNeto,
        costeLaboral: bd.costeLaboral,
      }
    })
  }, [quickGrossAnnual])

  /**
   * Gráfico comparado: IPC acumulado; neto e IRPF con el **mismo bruto nominal** en cada
   * ejercicio (el de la calculadora). El toggle aplica un contrafactual de IRPF deflactado por IPC
   * (escala monetaria de la tarifa indexada) y afecta tanto al neto real como al IRPF.
   */
  const multiSeriesVs2012 = useMemo<MultiSeries[]>(() => {
    const ipcPoints = TAX_YEARS.map((year) => ({
      year,
      value: (precios2012HastaAnio(year) - 1) * 100,
      yoyPercent:
        year === 2012 ? null : IPC_ANUAL_DIC[year] !== undefined ? IPC_ANUAL_DIC[year] * 100 : null,
    }))
    const out: MultiSeries[] = [
      { id: 'ipc', label: 'IPC', variant: 'terracotta', points: ipcPoints },
    ]

    if (quickGrossAnnual == null) return out

    const g = quickGrossAnnual
    const mRef = precios2012HastaAnio(quickCalcYear)
    const nominaEscenario = (year: TaxYear) =>
      computeNominaAgregada(g, year, undefined, {
        irpfMonetaryScaleFactor: escenarioIrpfDeflactado ? precios2012HastaAnio(year) : 1,
      })
    const netoEur2012 = (year: TaxYear) => {
      const nom = nominaEscenario(year)
      const f = precios2012HastaAnio(year)
      return round2(nom.salarioNeto / f)
    }
    const irpfValue = (year: TaxYear) => round2(nominaEscenario(year).irpfFinal / precios2012HastaAnio(year))
    const baseNet = netoEur2012(2012)
    const baseIrpf = irpfValue(2012)

    if (baseNet > 0) {
      out.push({
        id: 'poder',
        label: 'Poder adquisitivo (neto real)',
        variant: 'green',
        points: TAX_YEARS.map((year, i) => {
          const net = netoEur2012(year)
          const prevYear = i > 0 ? TAX_YEARS[i - 1]! : null
          const prevNet = prevYear != null ? netoEur2012(prevYear) : null
          const yoy =
            prevNet != null && prevNet > 0 && year !== 2012 ? ((net / prevNet - 1) * 100) : null
          const dConst = round2(net - baseNet)
          const dNom = round2(dConst * mRef)
          return {
            year,
            value: (net / baseNet - 1) * 100,
            yoyPercent: year === 2012 ? null : yoy,
            deltaEurVsBaselineConstant: dConst,
            deltaEurVsBaselineNominalRefYear: dNom,
          }
        }),
      })
    }
    if (baseIrpf > 0) {
      out.push({
        id: 'irpf',
        label: 'IRPF retenido',
        variant: 'lavender',
        points: TAX_YEARS.map((year, i) => {
          const irpf = irpfValue(year)
          const prevYear = i > 0 ? TAX_YEARS[i - 1]! : null
          const prevIrpf = prevYear != null ? irpfValue(prevYear) : null
          const yoy =
            prevIrpf != null && prevIrpf > 0 && year !== 2012
              ? ((irpf / prevIrpf - 1) * 100)
              : null
          const dConst = round2(irpf - baseIrpf)
          const dNom = round2(dConst * mRef)
          return {
            year,
            value: (irpf / baseIrpf - 1) * 100,
            yoyPercent: year === 2012 ? null : yoy,
            deltaEurVsBaselineConstant: dConst,
            deltaEurVsBaselineNominalRefYear: dNom,
          }
        }),
      })
    }
    return out
  }, [quickGrossAnnual, quickCalcYear, escenarioIrpfDeflactado])

  /**
   * Dominio Y fijo para que el eje no cambie al alternar el toggle:
   * incluye IPC + series fiscales bajo escenario OFF y ON.
   */
  const multiSeriesYDomain = useMemo<readonly [number, number] | undefined>(() => {
    const ipcVals = TAX_YEARS.map((year) => (precios2012HastaAnio(year) - 1) * 100)
    if (quickGrossAnnual == null) {
      const lo = Math.min(0, ...ipcVals)
      const hi = Math.max(0, ...ipcVals)
      return [lo, hi] as const
    }
    const g = quickGrossAnnual
    const scenarioValues = (deflactado: boolean): number[] => {
      const nomina = (year: TaxYear) =>
        computeNominaAgregada(g, year, undefined, {
          irpfMonetaryScaleFactor: deflactado ? precios2012HastaAnio(year) : 1,
        })
      const netoEur2012 = (year: TaxYear) => round2(nomina(year).salarioNeto / precios2012HastaAnio(year))
      const irpfEur2012 = (year: TaxYear) => round2(nomina(year).irpfFinal / precios2012HastaAnio(year))
      const baseNet = netoEur2012(2012)
      const baseIrpf = irpfEur2012(2012)
      const vals: number[] = []
      if (baseNet > 0) {
        for (const year of TAX_YEARS) vals.push((netoEur2012(year) / baseNet - 1) * 100)
      }
      if (baseIrpf > 0) {
        for (const year of TAX_YEARS) vals.push((irpfEur2012(year) / baseIrpf - 1) * 100)
      }
      return vals
    }
    const all = [...ipcVals, ...scenarioValues(false), ...scenarioValues(true)]
    const lo = Math.min(0, ...all)
    const hi = Math.max(0, ...all)
    return [lo, hi] as const
  }, [quickGrossAnnual, quickCalcYear])

  const comparadaAbsSummary = useMemo(() => {
    if (quickGrossAnnual == null) return null
    const g = quickGrossAnnual
    const nomina = (year: TaxYear) =>
      computeNominaAgregada(g, year, undefined, {
        irpfMonetaryScaleFactor: escenarioIrpfDeflactado ? precios2012HastaAnio(year) : 1,
      })
    const mRef = precios2012HastaAnio(quickCalcYear)
    const netoEur2012 = (year: TaxYear) => round2(nomina(year).salarioNeto / precios2012HastaAnio(year))
    const irpfEur2012 = (year: TaxYear) => round2(nomina(year).irpfFinal / precios2012HastaAnio(year))
    const deltaPoderNomRef = round2((netoEur2012(quickCalcYear) - netoEur2012(2012)) * mRef)
    const deltaIrpfNomRef = round2((irpfEur2012(quickCalcYear) - irpfEur2012(2012)) * mRef)
    return { deltaPoderNomRef, deltaIrpfNomRef }
  }, [quickGrossAnnual, quickCalcYear, escenarioIrpfDeflactado])

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

        <div className="mt-8 w-full shrink-0 sm:mt-10" aria-label="Evolución comparada">
          <div className="flex min-w-0 flex-col gap-5 rounded-xl bg-neutral-100 p-5 [font-family:var(--font-sans)] sm:gap-6 sm:p-7">
            <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <h2 className={comparadaTitleClass}>
                Evolución comparada
              </h2>
              <div className="flex shrink-0 items-end gap-6">
                <div className="group relative flex items-baseline gap-2">
                  <span className={`${comparadaMetricClass} text-neutral-900`}>
                    IRPF:
                  </span>
                  <span className={`${comparadaMetricClass} text-neutral-900`}>
                    {comparadaAbsSummary ? formatSignedEur(comparadaAbsSummary.deltaIrpfNomRef) : '—'}
                  </span>
                  <span className="pointer-events-none absolute right-0 top-full z-10 mt-1 hidden max-w-xs rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-normal leading-snug text-neutral-700 shadow-sm group-hover:block group-focus-within:block">
                    {comparadaAbsSummary == null
                      ? 'Diferencia anual en IRPF frente a 2012, con el mismo bruto.'
                      : masOMenos(comparadaAbsSummary.deltaIrpfNomRef) === 'igual'
                        ? 'Pagas lo mismo al a&ntilde;o en IRPF que en 2012, con el mismo bruto.'
                        : `Pagas ${masOMenos(comparadaAbsSummary.deltaIrpfNomRef)} al a&ntilde;o en IRPF que en 2012, con el mismo bruto.`}
                  </span>
                </div>
                <div className="group relative flex items-baseline gap-2">
                  <span className={`${comparadaMetricClass} text-neutral-900`}>
                    PODER ADQUISITIVO:
                  </span>
                  <span className={`${comparadaMetricClass} text-neutral-900`}>
                    {comparadaAbsSummary ? formatSignedEur(comparadaAbsSummary.deltaPoderNomRef) : '—'}
                  </span>
                  <span className="pointer-events-none absolute right-0 top-full z-10 mt-1 hidden max-w-xs rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-normal leading-snug text-neutral-700 shadow-sm group-hover:block group-focus-within:block">
                    {comparadaAbsSummary == null
                      ? 'Cambio anual de poder adquisitivo frente a 2012, con el mismo bruto.'
                      : masOMenos(comparadaAbsSummary.deltaPoderNomRef) === 'igual'
                        ? 'Tu poder adquisitivo anual es igual que en 2012, con el mismo bruto.'
                        : masOMenos(comparadaAbsSummary.deltaPoderNomRef) === 'más'
                          ? 'Tienes m&aacute;s poder adquisitivo anual que en 2012, con el mismo bruto.'
                          : 'Tienes menos poder adquisitivo anual que en 2012, con el mismo bruto.'}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <p className="mt-2 m-0 max-w-3xl text-base leading-relaxed text-neutral-700 [font-family:var(--font-serif)]">
                IPC acumulado (nivel de precios). Neto e IRPF usan el{' '}
                <strong className="font-semibold text-neutral-800">mismo bruto nominal</strong> que has
                escrito en todos los ejercicios; cada punto es el % respecto a 2012 al pasar la nómina a{' '}
                <strong className="font-semibold text-neutral-800">€ constantes 2012</strong> (si el nominal
                no sube como el IPC, el neto real cae). Al pasar el cursor, leyenda y recuadro muestran
                acumulado, intra-anual y la diferencia en euros (constantes 2012 y equivalente nominal del año
                de la calculadora). Clic en una serie para resaltarla.
              </p>
            </div>
            <MultiSeriesEvolutionChart
              series={multiSeriesVs2012}
              yFormat={(n) => formatPct(n, 1)}
              euroNominalRefYear={quickCalcYear}
              yDomain={multiSeriesYDomain}
              topRightControl={
                <button
                  type="button"
                  aria-pressed={escenarioIrpfDeflactado}
                  onClick={() => setEscenarioIrpfDeflactado((v) => !v)}
                  className={[
                    toggleBtnBase,
                    escenarioIrpfDeflactado
                      ? '!border-neutral-800 !bg-neutral-900 !text-white'
                      : '!border-neutral-300 !bg-neutral-100 !text-neutral-800 hover:!border-neutral-800 hover:!bg-neutral-900 hover:!text-white',
                  ].join(' ')}
                >
                  Deflactar IRPF
                </button>
              }
            />
          </div>
        </div>

        <div className="h-8 w-full shrink-0 sm:h-10" aria-hidden="true" />
        <div className="w-full shrink-0" aria-label="Nómina y coste por ejercicio">
          <div className={kComparisonTableCardClass}>
            <div className="min-w-0">
              <h2
                className="m-0 text-xl font-semibold text-neutral-900 [font-family:var(--font-serif)] sm:text-2xl"
              >
                Nómina año a año
              </h2>
              <p className="mt-2 m-0 max-w-3xl text-base leading-relaxed text-neutral-700 [font-family:var(--font-serif)]">
                Mismo <strong className="font-semibold text-neutral-800">bruto anual nominal</strong> en euros
                de {quickCalcYear} (el que has escrito) en todas las filas; en cada año se aplica la norma fiscal
                de ese ejercicio. Cotizaciones, IRPF, neto y coste total son{' '}
                <strong className="font-semibold text-neutral-800">importes nominales</strong> de ese año, como
                en una nómina de ese periodo (sin reexpresar con el IPC entre ejercicios). Se muestran dos recibos
                (2026 y un año que eliges), con el orden bruto → retenciones → indicadores → neto anual.
              </p>
            </div>
            <PayrollYearComparisonTable rows={payrollComparisonRows} grossNominalYear={quickCalcYear} />
          </div>
        </div>
      </section>
    </div>
  )
}
