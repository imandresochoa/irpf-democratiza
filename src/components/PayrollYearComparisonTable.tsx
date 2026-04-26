import type { TaxYear } from '../domain/tax'
import { formatEur, formatPct } from '../lib/format'

export type PayrollYearComparisonRow = {
  year: TaxYear
  bruto: number
  baseCotizacion: number
  cotTrabajador: number
  irpf: number
  neto: number
  cotEmpresa: number
  costeLaboral: number
  netoSobreCostePct: number | null
  poderAdquisitivoDelta: number
}

type PayrollYearComparisonTableProps = {
  rows: PayrollYearComparisonRow[] | null
  /** Año de referencia de moneda (reexpresión IPC). */
  refYear: TaxYear
  emptyMessage?: string
}

const thGroup =
  'border-b border-neutral-200/80 px-2.5 pb-1.5 pt-0.5 text-center text-[0.65rem] font-medium uppercase tracking-[0.12em] text-neutral-500 first:pl-0 last:pr-0 sm:px-3 sm:text-xs'
const thSub =
  'border-b border-neutral-200/80 px-2.5 pb-2.5 pt-0 text-left text-[0.65rem] font-normal uppercase tracking-[0.1em] text-neutral-500 first:pl-0 last:pr-0 sm:px-3 sm:text-xs'
const tdYear =
  'sticky left-0 z-10 whitespace-nowrap bg-neutral-100 px-2.5 py-3 text-left text-sm font-medium text-neutral-900 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.08)] [font-family:var(--font-sans)] first:pl-0 sm:px-3 sm:text-[0.9375rem]'
const tdNum =
  'px-2.5 py-3 text-right text-sm tabular-nums text-neutral-800 [font-family:var(--font-sans)] sm:px-3 sm:text-[0.9375rem]'

/**
 * Tabla anual: devengos, deducciones tipo nómina, coste empresa y Δ poder adquisitivo.
 * Importes en euros del año `refYear` (IPC diciembre–diciembre).
 */
export function PayrollYearComparisonTable({
  rows,
  refYear,
  emptyMessage = 'Añade un bruto anual',
}: PayrollYearComparisonTableProps) {
  if (rows == null || rows.length === 0) {
    return (
      <p
        className="m-0 border-b border-neutral-200/70 py-6 text-left text-sm text-neutral-500 [font-family:var(--font-sans)]"
        role="status"
      >
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="-mx-1 min-w-0 overflow-x-auto px-1 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[56rem] border-collapse text-left [font-family:var(--font-sans)]">
        <caption className="sr-only">
          Evolución por ejercicio fiscal: bruto, cotizaciones, IRPF, neto y coste laboral en euros de {refYear}
        </caption>
        <thead>
          <tr>
            <th scope="col" rowSpan={2} className={thGroup + ' w-14 text-left align-bottom'}>
              Año
            </th>
            <th scope="colgroup" colSpan={2} className={thGroup}>
              Devengos
            </th>
            <th scope="colgroup" colSpan={3} className={thGroup}>
              Deducciones
            </th>
            <th scope="col" rowSpan={2} className={thGroup + ' align-bottom'}>
              Líquido
            </th>
            <th scope="colgroup" colSpan={2} className={thGroup}>
              Empresa / total
            </th>
            <th scope="col" rowSpan={2} className={thGroup + ' align-bottom'}>
              Neto / coste
            </th>
            <th scope="col" rowSpan={2} className={thGroup + ' align-bottom'}>
              Δ Poder vs 2012
            </th>
          </tr>
          <tr>
            <th scope="col" className={thSub}>
              Bruto
            </th>
            <th scope="col" className={thSub}>
              Base cot. SS
            </th>
            <th scope="col" className={thSub}>
              Cot. SS trab.
            </th>
            <th scope="col" className={thSub}>
              IRPF
            </th>
            <th scope="col" className={thSub}>
              Total ded.
            </th>
            <th scope="col" className={thSub}>
              Cot. SS emp.
            </th>
            <th scope="col" className={thSub}>
              Coste lab.
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200/60">
          {rows.map((r) => {
            const totalDed = r.cotTrabajador + r.irpf
            return (
              <tr key={r.year} className="transition-colors hover:bg-neutral-200/25">
                <th scope="row" className={tdYear}>
                  {r.year}
                </th>
                <td className={tdNum}>{formatEur(r.bruto, 0)}</td>
                <td className={tdNum}>{formatEur(r.baseCotizacion, 0)}</td>
                <td className={tdNum}>{formatEur(r.cotTrabajador, 0)}</td>
                <td className={tdNum}>{formatEur(r.irpf, 0)}</td>
                <td className={tdNum}>{formatEur(totalDed, 0)}</td>
                <td className={tdNum}>{formatEur(r.neto, 0)}</td>
                <td className={tdNum}>{formatEur(r.cotEmpresa, 0)}</td>
                <td className={tdNum}>{formatEur(r.costeLaboral, 0)}</td>
                <td className={tdNum}>
                  {r.netoSobreCostePct != null ? formatPct(r.netoSobreCostePct, 1) : '—'}
                </td>
                <td className={tdNum}>{formatEur(r.poderAdquisitivoDelta, 0)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
