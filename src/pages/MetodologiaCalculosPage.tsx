import { Link } from 'react-router-dom'

const prose =
  'max-w-3xl text-base leading-relaxed text-neutral-700 [font-family:var(--font-serif)] sm:text-lg'
const h2 = 'mt-10 mb-3 text-xl font-semibold text-neutral-900 [font-family:var(--font-serif)] sm:text-2xl'
const h3 = 'mt-6 mb-2 text-lg font-semibold text-neutral-900 [font-family:var(--font-serif)]'
const codePath =
  'rounded bg-neutral-200/80 px-1.5 py-0.5 text-sm font-medium text-neutral-800 [font-family:var(--font-sans)]'
const tableWrap = 'mt-4 w-full overflow-x-auto rounded-lg border border-neutral-200/80 bg-white/60'
const thtd = 'border-b border-neutral-200/70 px-3 py-2 text-left align-top text-sm sm:text-base'

export function MetodologiaCalculosPage() {
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
        Cálculos y fórmulas
      </h1>
      <p className={`mt-4 m-0 ${prose}`}>
        Fórmulas directas de cada bloque de la app. La referencia detallada sigue en{' '}
        <code className={codePath}>docs/CALCULOS_FUENTE_DE_VERDAD.md</code>.
      </p>

      <h2 className={h2}>Autoridad y equivalencia con el script de referencia</h2>
      <p className={`m-0 ${prose}`}>
        El script Python de auditoría integral de nóminas e inflación (2012–2026) es la especificación
        canónica de parámetros por ejercicio, lógica de nómina agregada / retención y comparativas con
        IPC diciembre–diciembre. Debe mantenerse versionado (p. ej. en{' '}
        <code className={codePath}>reference/auditoria_integral_nominas_irpf.py</code>
        ). Cualquier cambio normativo o de redondeo conviene replicarlo primero allí y luego en TypeScript.
      </p>
      <ul className={`mt-4 list-disc space-y-2 pl-6 ${prose}`}>
        <li>
          La <strong className="font-semibold text-neutral-900">evolución del neto</strong> en la portada
          reexpresa los importes a <strong className="font-semibold text-neutral-900">euros del año de la
          calculadora</strong> (misma moneda que el neto estimado).
        </li>
        <li>
          Tablas de <strong className="font-semibold text-neutral-900">poder adquisitivo</strong>, IRPF y
          cotizaciones en la comparativa IPC usan <strong className="font-semibold text-neutral-900">€
          constantes 2012</strong> frente a la norma de 2012.
        </li>
      </ul>

      <h2 className={h2}>Mapeo código TypeScript</h2>
      <div className={tableWrap}>
        <table className="m-0 w-full min-w-[28rem] border-collapse [font-family:var(--font-sans)]">
          <thead>
            <tr className="bg-neutral-100/90">
              <th className={thtd}>Concepto</th>
              <th className={thtd}>Código</th>
            </tr>
          </thead>
          <tbody className="text-neutral-800">
            <tr>
              <td className={thtd}>Parámetros anuales (cotización, tramos IRPF, mínimos…)</td>
              <td className={thtd}>
                <code className={codePath}>parameters.ts</code> → <code className={codePath}>getYearParameters</code>
              </td>
            </tr>
            <tr>
              <td className={thtd}>Nómina / IRPF (desglose)</td>
              <td className={thtd}>
                <code className={codePath}>computePayroll.ts</code> →{' '}
                <code className={codePath}>computePayrollBreakdown</code>,{' '}
                <code className={codePath}>computeNominaAgregada</code>
              </td>
            </tr>
            <tr>
              <td className={thtd}>IPC acumulado (cadena 1 + IPC anual)</td>
              <td className={thtd}>
                <code className={codePath}>inflation.ts</code> → <code className={codePath}>getAccumulatedInflation</code>
              </td>
            </tr>
            <tr>
              <td className={thtd}>Nivel de precios P<sub>año</sub> / P<sub>2012</sub></td>
              <td className={thtd}>
                <code className={codePath}>precios2012HastaAnio(year)</code>
              </td>
            </tr>
            <tr>
              <td className={thtd}>Reexpresión nominal → € constantes de un año dado</td>
              <td className={thtd}>
                <code className={codePath}>reexpressNominalEurAeurConstante</code>
              </td>
            </tr>
            <tr>
              <td className={thtd}>Comparativa poder / IRPF (base 2012, mismo bruto en € 2012)</td>
              <td className={thtd}>
                <code className={codePath}>compare.ts</code> → <code className={codePath}>computeInflationComparisonRow</code>
              </td>
            </tr>
            <tr>
              <td className={thtd}>Neto de la fila comparativa en moneda del año de la calculadora</td>
              <td className={thtd}>
                <code className={codePath}>netoReexpresadoAeurAñoElegido(row, añoCalculadora)</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className={h2}>Fórmulas (resumen)</h2>
      <h3 className={h3}>Bruto nominal → € constantes 2012</h3>
      <p className={`m-0 ${prose}`}>
        <strong className="font-semibold text-neutral-900">G<sub>real,2012</sub> = G<sub>nominal,t</sub> / f<sub>2012→t</sub></strong>, con{' '}
        <code className={codePath}>f = precios2012HastaAnio(t)</code>.
      </p>
      <h3 className={h3}>Neto nominal → € constantes 2012</h3>
      <p className={`m-0 ${prose}`}>
        <strong className="font-semibold text-neutral-900">N<sub>real,2012</sub> = N<sub>nominal,t</sub> / f<sub>2012→t</sub></strong>.
      </p>
      <h3 className={h3}>IRPF sobre bruto (%)</h3>
      <p className={`m-0 ${prose}`}>
        <strong className="font-semibold text-neutral-900">%IRPF<sub>t</sub> = 100 · IRPF<sub>t</sub> / Bruto<sub>t</sub></strong>.
      </p>
      <h3 className={h3}>Variación de poder adquisitivo vs 2012</h3>
      <p className={`m-0 ${prose}`}>
        <strong className="font-semibold text-neutral-900">
          ΔPoder<sub>t</sub> = Neto<sub>real,2012,t</sub> − Neto<sub>real,2012,2012</sub>
        </strong>.
      </p>
      <h3 className={h3}>IPC acumulado desde 2012</h3>
      <p className={`m-0 ${prose}`}>
        <strong className="font-semibold text-neutral-900">
          f<sub>2012→t</sub> = ∏<sub>k=2013..t</sub>(1 + IPC<sub>k</sub>)
        </strong>{' '}
        y la serie IPC del gráfico es{' '}
        <strong className="font-semibold text-neutral-900">(f<sub>2012→t</sub> − 1) · 100</strong>.
      </p>
      <h3 className={h3}>Gráfico “Evolución comparada” (neto e IRPF)</h3>
      <p className={`m-0 ${prose}`}>
        Neto: <strong className="font-semibold text-neutral-900">(N<sub>real,2012,t</sub>/N<sub>real,2012,2012</sub> − 1) · 100</strong>.<br />
        IRPF: <strong className="font-semibold text-neutral-900">100 · IRPF<sub>t</sub> / Bruto<sub>t</sub></strong>.<br />
        Arriba: <strong className="font-semibold text-neutral-900">Neto nominal del año seleccionado</strong> y{' '}
        <strong className="font-semibold text-neutral-900">ΔPoder vs 2012</strong>.
      </p>
    </article>
  )
}
