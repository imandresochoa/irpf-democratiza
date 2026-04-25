import { Link } from 'react-router-dom'

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
            className="inline-flex items-center justify-center rounded-lg bg-[var(--color-accent)] px-4 py-2.5 text-base font-medium text-white no-underline hover:opacity-95"
          >
            Empezar a calcular
          </Link>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        <div className="space-y-2">
          <h2 className="mt-0 text-base font-semibold text-neutral-900">Calcular</h2>
          <p className="text-base text-neutral-600">
            Introduce bruto y año. Verás el neto resaltado y un desglose por etapas; puedes abrir el
            detalle de cada bloque.
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="mt-0 text-base font-semibold text-neutral-900">Comparar</h2>
          <p className="text-base text-neutral-600">
            Fija un salario en &quot;euros de 2026&quot; y compara con un año anterior reescalado por IPC
            (diciembre a diciembre).
          </p>
        </div>
        <div className="space-y-2">
          <h2 className="mt-0 text-base font-semibold text-neutral-900">Normativa</h2>
          <p className="text-base text-neutral-600">
            Línea de tiempo con cambios clave en tramos, mínimos, MEI y otros parámetros del modelo.
          </p>
        </div>
      </section>
    </div>
  )
}
