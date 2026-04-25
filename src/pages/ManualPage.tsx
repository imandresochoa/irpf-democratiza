import { Link, useParams } from 'react-router-dom'
import { useEffect } from 'react'

const sections = [
  { id: 'orden', title: 'Orden del cálculo' },
  { id: 'ss', title: 'Cotizaciones (SS)' },
  { id: 'rendimiento', title: 'Rendimiento y reducciones' },
  { id: 'irpf', title: 'IRPF: tramos y cuota' },
  { id: 'retencion', title: 'Retención y neto' },
  { id: 'inflacion', title: 'Inflación y comparativa' },
] as const

export function ManualPage() {
  const { section } = useParams()

  useEffect(() => {
    if (!section) return
    const el = document.getElementById(section)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [section])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mt-0 text-2xl font-semibold text-neutral-900">Manual breve</h1>
        <p className="text-base text-neutral-600">
          Capítulos cortos alineados con las etapas del cálculo.{' '}
          <Link to="/calcular" className="text-[var(--color-accent)] no-underline hover:underline">
            Ir al calculador
          </Link>
          .
        </p>
      </div>

      <nav
        className="rounded-lg border border-neutral-200 bg-[var(--color-surface-elevated)] p-4"
        aria-label="Índice del manual"
      >
        <p className="mt-0 text-xs font-medium uppercase tracking-wide text-neutral-500">Índice</p>
        <ul className="mb-0 mt-2 flex flex-col gap-1 sm:flex-row sm:flex-wrap">
          {sections.map((s) => (
            <li key={s.id}>
              <Link
                to={`/manual/${s.id}`}
                className="text-base text-[var(--color-accent)] no-underline hover:underline"
              >
                {s.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <article id="orden" className="scroll-mt-20 space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Orden del cálculo</h2>
        <ol className="list-decimal space-y-2 pl-5 text-base text-neutral-700">
          <li>Salario bruto anual.</li>
          <li>Base de cotización (tope a la base máxima de ese año).</li>
          <li>Cotizaciones empleador y trabajador (incl. MEI y, si procede, solidaridad sobre exceso).</li>
          <li>Rendimiento previo = bruto − cotización trabajador.</li>
          <li>Gastos deducibles fijos (art. 19) y reducción por obtención de renta del trabajo (art. 20).</li>
          <li>Base imponible general del IRPF.</li>
          <li>Cuota íntegra por tramos; sustraer mínimo del contribuyente en tipo del primer tramo.</li>
          <li>Deducción por rentas bajas vinculada al SMI (años contemplados en el modelo).</li>
          <li>Tope de retención (art. 85.3): máximo entre cuota y el 43% del exceso sobre mínimo exento.</li>
          <li>Neto = bruto − cotización trabajador − IRPF final retenido.</li>
        </ol>
      </article>

      <article id="ss" className="scroll-mt-20 space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Cotizaciones (SS)</h2>
        <p className="text-base leading-relaxed text-neutral-700">
          Se aplican tipos por conceptos (comunes, desempleo, etc.) a la base cotizada. A partir de 2023
          entra el MEI con tramos por año. Con exceso sobre la base máxima, el modelo añade cotización
          de solidaridad repartida 5/6 empleador y 1/6 trabajador en los años configurados.
        </p>
      </article>

      <article id="rendimiento" className="scroll-mt-20 space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Rendimiento y reducciones</h2>
        <p className="text-base leading-relaxed text-neutral-700">
          Los umbrales y pendientes de la reducción por trabajo cambian por periodos (incluido el régimen
          transitorio de 2018). El resultado es una base imponible menor que el rendimiento neto del
          trabajo antes de tramos.
        </p>
      </article>

      <article id="irpf" className="scroll-mt-20 space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">IRPF: tramos y cuota</h2>
        <p className="text-base leading-relaxed text-neutral-700">
          La escala estatal del IRPF se actualiza por años: número de tramos, límites y tipos. La cuota
          íntegra es la suma de cada tramo marginal aplicado a la base imponible.
        </p>
      </article>

      <article id="retencion" className="scroll-mt-20 space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Retención y neto</h2>
        <p className="text-base leading-relaxed text-neutral-700">
          Tras la cuota teórica y deducciones del modelo, la retención efectiva no supera el límite legal
          del 43% sobre la parte del bruto que excede del mínimo exento de retención del año. El salario
          neto es lo que queda en manos del trabajador en esta simplificación.
        </p>
      </article>

      <article id="inflacion" className="scroll-mt-20 space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">Inflación y comparativa</h2>
        <p className="text-base leading-relaxed text-neutral-700">
          La comparativa toma variaciones IPC diciembre a diciembre año a año, acumuladas hasta 2026. Un
          bruto &quot;equivalente en 2026&quot; se traduce en bruto nominal del año histórico dividiendo
          por ese factor; se recalcula la nómina de aquel año y se reescala todo a euros de 2026 para
          comparar con el neto obtenido con el mismo bruto nominal en 2026.
        </p>
      </article>
    </div>
  )
}
