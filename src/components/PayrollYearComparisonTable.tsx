import type { TaxYear } from '../domain/tax'
import { formatEur } from '../lib/format'

export type PayrollYearComparisonRow = {
  year: TaxYear
  bruto: number
  cotTrabajador: number
  irpf: number
  neto: number
  costeLaboral: number
}

type PayrollYearComparisonTableProps = {
  rows: PayrollYearComparisonRow[] | null
  /** Año de referencia de moneda (reexpresión IPC). */
  refYear: TaxYear
  emptyMessage?: string
}

/** Mismo padding horizontal en cabecera y cuerpo para que las columnas coincidan. */
const padX = 'px-3'
const padYHead = 'py-2.5'
const padYBody = 'py-3'

const thYear = `${padX} ${padYHead} text-left text-[0.65rem] font-normal uppercase tracking-[0.12em] text-neutral-500 sm:text-xs`
const thNum = `${padX} ${padYHead} text-right text-[0.65rem] font-normal uppercase tracking-[0.12em] text-neutral-500 sm:text-xs`
const tdYear = `sticky left-0 z-10 ${padX} ${padYBody} whitespace-nowrap bg-neutral-100 text-left text-sm font-medium text-neutral-900 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.08)] [font-family:var(--font-sans)] sm:text-[0.9375rem]`
const tdNum = `${padX} ${padYBody} text-right text-sm tabular-nums text-neutral-800 [font-family:var(--font-sans)] sm:text-[0.9375rem]`

/**
 * Evolución anual en clave nómina: bruto, neto, retenciones y coste total.
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
      <table className="w-full table-fixed border-separate border-spacing-0 text-left [font-family:var(--font-sans)]">
        <caption className="sr-only">
          Por ejercicio: bruto, neto, cotización del trabajador, IRPF y coste laboral aproximado; euros de{' '}
          {refYear}.
        </caption>
        <colgroup>
          <col className="w-[4.25rem] sm:w-20" />
          <col />
          <col />
          <col />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th scope="col" className={thYear + ' border-b border-neutral-200/80'}>
              Año
            </th>
            <th scope="col" className={thNum + ' border-b border-neutral-200/80'}>
              Bruto
            </th>
            <th scope="col" className={thNum + ' border-b border-neutral-200/80'}>
              Neto
            </th>
            <th scope="col" className={thNum + ' border-b border-neutral-200/80'}>
              Cot. SS trab.
            </th>
            <th scope="col" className={thNum + ' border-b border-neutral-200/80'}>
              IRPF
            </th>
            <th scope="col" className={thNum + ' border-b border-neutral-200/80'}>
              Coste total
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.year} className="transition-colors hover:bg-neutral-200/25">
              <th scope="row" className={tdYear + (i > 0 ? ' border-t border-neutral-200/60' : '')}>
                {r.year}
              </th>
              <td className={tdNum + (i > 0 ? ' border-t border-neutral-200/60' : '')}>{formatEur(r.bruto, 0)}</td>
              <td className={tdNum + (i > 0 ? ' border-t border-neutral-200/60' : '')}>{formatEur(r.neto, 0)}</td>
              <td className={tdNum + (i > 0 ? ' border-t border-neutral-200/60' : '')}>
                {formatEur(r.cotTrabajador, 0)}
              </td>
              <td className={tdNum + (i > 0 ? ' border-t border-neutral-200/60' : '')}>{formatEur(r.irpf, 0)}</td>
              <td className={tdNum + (i > 0 ? ' border-t border-neutral-200/60' : '')}>
                {formatEur(r.costeLaboral, 0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
