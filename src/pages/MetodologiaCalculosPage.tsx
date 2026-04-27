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
        Resumen de cómo se calculan las cifras de la aplicación y en qué archivos está la lógica. La
        referencia detallada sigue en el repositorio en{' '}
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

      <h2 className={h2}>Fórmulas usadas con frecuencia</h2>
      <h3 className={h3}>Bruto nominal → € constantes 2012</h3>
      <p className={`m-0 ${prose}`}>
        Dado un bruto nominal <em>G</em> del año <em>t</em> y el factor de precios acumulado desde 2012 hasta{' '}
        <em>t</em>, <code className={codePath}>f = precios2012HastaAnio(t)</code>: el bruto en € 2012
        comparables es <strong className="font-semibold text-neutral-900">G / f</strong>.
      </p>
      <h3 className={h3}>Neto nominal → € constantes 2012</h3>
      <p className={`m-0 ${prose}`}>
        Con el mismo factor <em>f</em> del año de la nómina:{' '}
        <strong className="font-semibold text-neutral-900">N<sub>€2012</sub> = N<sub>nominal</sub> / f</strong>.
      </p>
      <h3 className={h3}>IPC acumulado desde 2012</h3>
      <p className={`m-0 ${prose}`}>
        Para cada año <em>k</em> desde 2013, se encadenan variaciones diciembre–diciembre{' '}
        <code className={codePath}>IPC_ANUAL_DIC[k]</code>: el factor acumulado es el producto de{' '}
        <strong className="font-semibold text-neutral-900">(1 + IPC<sub>k</sub>)</strong>. El nivel relativo
        P<sub>t</sub>/P<sub>2012</sub> es ese producto hasta <em>t</em>; el gráfico “IPC” muestra a menudo{' '}
        <strong className="font-semibold text-neutral-900">(P<sub>t</sub>/P<sub>2012</sub> − 1) × 100</strong>{' '}
        en %.
      </p>
      <h3 className={h3}>Gráfico “Evolución comparada” (neto e IRPF)</h3>
      <p className={`m-0 ${prose}`}>
        Con el <strong className="font-semibold text-neutral-900">mismo bruto nominal</strong> en cada
        ejercicio, se calcula la nómina del año, se deflacta neto (e IRPF) a € 2012 dividiendo por{' '}
        <code className={codePath}>precios2012HastaAnio(año)</code>, y se muestra el % respecto a 2012. Los
        importes en euros del bloque superior se muestran en términos reales (euros constantes 2012): por
        defecto usan el año de la calculadora y, al hacer clic en un punto del gráfico, usan ese año
        seleccionado.
      </p>
    </article>
  )
}
