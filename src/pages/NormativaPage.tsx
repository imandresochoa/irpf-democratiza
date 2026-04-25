import { NormativaTimeline } from '../components/NormativaTimeline'

export function NormativaPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mt-0 text-2xl font-semibold text-neutral-900">Normativa y fuentes oficiales</h1>
        <p className="text-base text-neutral-700">
          Referencias legales y administrativas que ayudan a situar los cambios de IRPF,
          cotizaciones y retenciones usados por la herramienta. Cada hito enlaza con su fuente
          oficial para que puedas consultar el texto completo.
        </p>
      </div>

      <NormativaTimeline />
    </div>
  )
}
