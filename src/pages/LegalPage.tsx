import { Link } from 'react-router-dom'

const prose =
  'max-w-3xl text-base leading-relaxed text-neutral-700 [font-family:var(--font-serif)] sm:text-lg'
const h2 = 'mt-10 mb-3 text-xl font-semibold text-neutral-900 [font-family:var(--font-serif)] sm:text-2xl'

export function LegalPage() {
  return (
    <article className="pb-16">
      <p className="m-0 mb-6 [font-family:var(--font-sans)]">
        <Link
          to="/"
          className="text-base font-medium text-neutral-700 underline-offset-2 hover:text-neutral-900 hover:underline"
        >
          ← Volver al comparador
        </Link>
      </p>

      <h1 className="m-0 text-3xl font-semibold leading-tight tracking-[-0.02em] text-neutral-900 [font-family:var(--font-serif)] sm:text-4xl">
        Aviso legal y privacidad
      </h1>
      <p className={`mt-4 m-0 ${prose}`}>
        Esta web tiene un objetivo informativo y educativo. Las cifras mostradas son estimaciones y no
        sustituyen el asesoramiento profesional ni la información oficial de la Agencia Tributaria, la
        Seguridad Social u otros organismos públicos.
      </p>

      <h2 className={h2}>Responsable</h2>
      <p className={`m-0 ${prose}`}>
        Proyecto personal de Andrés Ochoa. Si detectas errores o quieres proponer mejoras, puedes usar
        los canales de contacto enlazados en el pie de la web.
      </p>

      <h2 className={h2}>Datos y fuentes</h2>
      <p className={`m-0 ${prose}`}>
        Para las estimaciones se usan series públicas oficiales (INE, AEAT y otras fuentes citadas en
        la página de metodología). Aunque se revisan periódicamente, puede haber desfases o cambios en
        las series originales.
      </p>

      <h2 className={h2}>Analítica</h2>
      <p className={`m-0 ${prose}`}>
        Esta web usa Vercel Web Analytics para obtener métricas agregadas de uso y rendimiento. Esta
        analítica se configura en modo sin cookies, con información estadística no identificativa.
      </p>

      <h2 className={h2}>Propiedad intelectual</h2>
      <p className={`m-0 ${prose}`}>
        El código y los contenidos de este proyecto se distribuyen según la licencia indicada en el
        repositorio. Las marcas y nombres de organismos citados pertenecen a sus respectivos titulares.
      </p>
    </article>
  )
}
