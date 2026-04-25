import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { computePayrollBreakdown, inflationFactorTo2026, TAX_YEARS, type TaxYear } from '../domain/tax'
import { EurAmountInput } from '../components/EurAmountInput'
import { formatEur, parseEurInputToNumber } from '../lib/format'
import heroCharacterImage from '../assets/images/hero-character.svg'

const quickCalcYear: TaxYear = 2026
const ipcChartYears = TAX_YEARS.filter((year) => year !== 2026)
const ipcChartPoints = ipcChartYears.map((year) => ({
  year,
  percent: Math.round((inflationFactorTo2026(year) - 1) * 100),
}))
const maxIpcPercent = Math.max(...ipcChartPoints.map((point) => point.percent))

const homeCards = [
  {
    title: 'Calcular',
    description:
      'Introduce bruto y año. Verás el neto resaltado y un desglose por etapas del cálculo.',
    to: '/calcular',
    cta: 'Abrir calculadora',
    className: 'bg-neutral-100',
    imageLabel: 'Gráfico de nómina',
  },
  {
    title: 'Comparar',
    description:
      'Fija un salario en euros de 2026 y compara poder adquisitivo con un año anterior.',
    to: '/comparar',
    cta: 'Comparar años',
    className: 'bg-neutral-100',
    imageLabel: 'Comparativa anual',
  },
  {
    title: 'Manual',
    description:
      'Lee el orden del cálculo y las reglas principales detrás de cotizaciones, retenciones e inflación.',
    to: '/manual',
    cta: 'Leer manual',
    className: 'bg-neutral-100',
    imageLabel: 'Guía de cálculo',
  },
  {
    title: 'Normativa',
    description:
      'Consulta los cambios clave en tramos, mínimos, MEI y otros parámetros del modelo.',
    to: '/normativa',
    cta: 'Ver fuentes',
    className: 'bg-neutral-100',
    imageLabel: 'Fuentes oficiales',
  },
] as const

export function LandingPage() {
  const [quickGrossInput, setQuickGrossInput] = useState('15574,85')
  const [selectedIpcYear, setSelectedIpcYear] = useState<TaxYear>(2012)

  const quickGrossAnnual = useMemo(() => {
    const value = parseEurInputToNumber(quickGrossInput)
    return value !== null && value > 0 ? value : null
  }, [quickGrossInput])

  const quickNetAnnual = useMemo(() => {
    if (quickGrossAnnual === null) return null
    return computePayrollBreakdown(quickGrossAnnual, quickCalcYear).salarioNeto
  }, [quickGrossAnnual])

  const selectedIpcPercent = Math.round((inflationFactorTo2026(selectedIpcYear) - 1) * 100)

  return (
    <div className="space-y-10">
      <section className="grid min-h-[calc(100vh-7rem)] gap-6 pt-6 lg:h-[calc(100vh-7rem)] lg:grid-rows-[auto_minmax(18rem,1fr)]">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1.25fr)_minmax(24rem,0.75fr)] md:items-start">
          <h1
            className="m-0 text-[clamp(3rem,5vw,4.75rem)] font-normal leading-[1.03] tracking-[-0.04em] text-neutral-800"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            <span className="block lg:whitespace-nowrap">Entiende cuánto cobras</span>
            <span className="block">de verdad</span>
          </h1>
          <div className="max-w-md justify-self-start pt-3 md:pt-8 lg:pt-10">
            <p className="m-0 text-lg text-neutral-800">
              Calcula tu salario neto, compara años y entiende qué parte se va en cotizaciones e IRPF.
              Todo con cifras claras, contexto histórico y enlaces a fuentes oficiales.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/calcular"
                className="inline-flex items-center justify-center rounded-lg bg-neutral-800 px-4 py-2 text-base font-normal text-white no-underline [font-family:var(--font-sans)] hover:opacity-95"
              >
                Empezar a calcular
              </Link>
            </div>
          </div>
        </div>

        <div className="grid content-end gap-4 md:grid-cols-2 lg:grid-cols-12">
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
                Bruto anual
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
          <div className="flex flex-col justify-between rounded-xl bg-[var(--color-brand-mint-soft)] p-6 lg:col-span-4 lg:min-h-80">
            <p
              className="m-0 max-w-44 text-3xl font-semibold leading-none tracking-[-0.025em] text-neutral-900"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              IPC acumulado
            </p>
            <div>
              <div className="flex items-end justify-between gap-4">
                <p className="m-0 text-base text-neutral-800">
                  Desde {selectedIpcYear} hasta 2026
                </p>
                <p className="m-0 text-3xl font-semibold tracking-[-0.025em] text-neutral-900">
                  {selectedIpcPercent}%
                </p>
              </div>
              <div className="mt-8 flex h-20 items-end gap-1.5">
                {ipcChartPoints.map((point) => (
                  <button
                    key={point.year}
                    type="button"
                    className={[
                      'w-full rounded-full transition-colors',
                      selectedIpcYear === point.year ? 'bg-neutral-900' : 'bg-neutral-900/25 hover:bg-neutral-900/45',
                    ].join(' ')}
                    style={{ height: `${Math.max(16, (point.percent / maxIpcPercent) * 80)}px` }}
                    aria-label={`Ver IPC acumulado desde ${point.year}: ${point.percent}%`}
                    onClick={() => setSelectedIpcYear(point.year)}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="relative flex min-h-80 flex-col justify-end overflow-hidden rounded-xl bg-[var(--color-brand-blue-soft)] p-6 text-neutral-900 lg:col-span-5">
            <img
              src={heroCharacterImage}
              alt=""
              className="pointer-events-none absolute right-4 bottom-0 h-56 w-auto object-contain opacity-90 lg:right-6 lg:h-72"
              aria-hidden="true"
            />
            <div className="relative z-10 flex w-full min-w-0 items-end justify-between gap-x-4 gap-y-2">
              <p
                className="m-0 max-w-[min(100%,18rem)] text-3xl font-semibold leading-[1.05] tracking-[-0.025em] sm:max-w-[20rem]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                ¿Me ayudas a mejorarlo?
              </p>
              <a
                href="https://x.com/imandresochoa"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 self-end rounded-md px-3 py-2 text-base font-normal text-neutral-800 no-underline [font-family:var(--font-sans)] hover:bg-neutral-800 hover:text-white"
              >
                @imandresochoa
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4" aria-label="Secciones principales">
        {homeCards.map((card) => (
          <article
            key={card.to}
            className={`${card.className} grid min-h-56 gap-8 rounded-xl p-8 sm:grid-cols-[minmax(0,1fr)_13rem] sm:items-center`}
          >
            <div className="max-w-xl">
              <h2
                className="mt-0 text-3xl font-semibold tracking-[-0.01em] text-neutral-900"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {card.title}
              </h2>
              <p className="mb-0 mt-3 max-w-lg text-lg text-neutral-800">{card.description}</p>
              <Link
                to={card.to}
                className="mt-8 flex w-fit items-center rounded-lg border border-neutral-800 px-4 py-2.5 text-base font-normal text-neutral-800 no-underline [font-family:var(--font-sans)] hover:bg-neutral-800 hover:text-white"
              >
                {card.cta}
              </Link>
            </div>
            <div
              className="flex aspect-square w-36 items-center justify-center justify-self-end rounded-xl bg-neutral-900/10 text-center text-xs font-medium uppercase tracking-wide text-neutral-800 sm:w-44"
              aria-hidden="true"
            >
              {card.imageLabel}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
