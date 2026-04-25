import { Link } from 'react-router-dom'

const homeCards = [
  {
    title: 'Calcular',
    description:
      'Introduce bruto y año. Verás el neto resaltado y un desglose por etapas del cálculo.',
    to: '/calcular',
    cta: 'Abrir calculadora',
    className: 'bg-[var(--color-brand-green-soft)]',
    imageLabel: 'Gráfico de nómina',
  },
  {
    title: 'Comparar',
    description:
      'Fija un salario en euros de 2026 y compara poder adquisitivo con un año anterior.',
    to: '/comparar',
    cta: 'Comparar años',
    className: 'bg-[var(--color-brand-mint-soft)]',
    imageLabel: 'Comparativa anual',
  },
  {
    title: 'Manual',
    description:
      'Lee el orden del cálculo y las reglas principales detrás de cotizaciones, retenciones e inflación.',
    to: '/manual',
    cta: 'Leer manual',
    className: 'bg-[var(--color-brand-lavender-soft)]',
    imageLabel: 'Guía de cálculo',
  },
  {
    title: 'Normativa',
    description:
      'Consulta los cambios clave en tramos, mínimos, MEI y otros parámetros del modelo.',
    to: '/normativa',
    cta: 'Ver fuentes',
    className: 'bg-[var(--color-brand-blue-soft)]',
    imageLabel: 'Fuentes oficiales',
  },
] as const

export function LandingPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-neutral-900">
          Del bruto al neto: nómina e IRPF, paso a paso
        </h1>
        <p className="max-w-2xl text-lg text-neutral-600">
          Aquí puedes ver cómo se pasa del salario bruto al neto en España entre 2012 y 2026: cotizaciones
          a la Seguridad Social, reducciones por trabajo, tramos del IRPF, deducciones y el tope de
          retención. También puedes comparar el poder adquisitivo ajustando por inflación acumulada
          hasta 2026.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/calcular"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-base font-normal text-white no-underline [font-family:var(--font-sans)] hover:opacity-95"
          >
            Empezar a calcular
          </Link>
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
                className="mt-6 inline-flex w-fit items-center rounded-lg border border-neutral-900 px-3 py-2 text-base font-normal text-neutral-900 no-underline [font-family:var(--font-sans)] hover:bg-neutral-900 hover:text-white"
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
