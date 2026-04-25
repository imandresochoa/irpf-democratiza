import { Link } from 'react-router-dom'
import { inflationFactorTo2026, TAX_YEARS } from '../domain/tax'
import heroCharacterImage from '../assets/images/hero-character.svg'

const accumulatedIpc2012To2026 = Math.round((inflationFactorTo2026(2012) - 1) * 100)

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

        <div className="grid content-end gap-4 md:grid-cols-2 lg:grid-cols-12" aria-hidden="true">
          <div className="flex flex-col justify-end rounded-xl bg-[var(--color-brand-green-soft)] p-6 lg:col-span-3 lg:min-h-80">
            <p className="m-0 text-base text-neutral-800">Años para calcular tu neto</p>
            <p className="mt-3 mb-0 text-[4.5rem] font-semibold leading-none tracking-[-0.06em] text-neutral-900">
              {TAX_YEARS.length}
            </p>
            <p className="mt-2 mb-0 max-w-36 text-base text-neutral-800">de 2012 a 2026</p>
          </div>
          <div className="flex flex-col justify-end rounded-xl bg-[var(--color-brand-mint-soft)] p-6 lg:col-span-4 lg:min-h-80">
            <div className="flex items-start justify-between gap-4">
              <p className="m-0 text-base text-neutral-800">Pérdida de referencia por precios</p>
              <p className="m-0 text-3xl font-semibold tracking-[-0.025em] text-neutral-900">
                {accumulatedIpc2012To2026}%
              </p>
            </div>
            <div className="mt-20 flex h-10 items-end gap-1">
              {Array.from({ length: 28 }).map((_, i) => (
                <span
                  key={i}
                  className="w-1.5 rounded-full bg-neutral-900"
                  style={{ height: `${28 + ((i * 7) % 34)}px`, opacity: i > 21 ? 0.18 : 1 }}
                />
              ))}
            </div>
          </div>
          <div className="relative flex flex-col justify-end overflow-hidden rounded-xl bg-neutral-100 p-8 text-neutral-900 lg:col-span-5 lg:min-h-80">
            <img
              src={heroCharacterImage}
              alt=""
              className="pointer-events-none absolute right-6 bottom-0 h-56 w-auto object-contain opacity-90 lg:h-72"
              aria-hidden="true"
            />
            <div className="relative flex items-end justify-between gap-6">
              <p
                className="m-0 max-w-64 text-3xl font-semibold leading-none tracking-[-0.025em]"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                ¿Me ayudas a mejorarlo?
              </p>
              <a
                href="https://x.com/imandresochoa"
                target="_blank"
                rel="noopener noreferrer"
                className="-mr-3 -mb-2 inline-flex shrink-0 rounded-md px-3 py-2 text-base font-normal text-neutral-800 no-underline [font-family:var(--font-sans)] hover:bg-neutral-100/70 hover:text-neutral-900 hover:backdrop-blur-sm"
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
