import { useCallback, useId, useMemo, useState, type CSSProperties, type PointerEvent } from 'react'
import type { TaxYear } from '../domain/tax'
import { comparisonLegendMainCopy, kComparisonTooltipShellClass } from '../lib/comparisonLegendCopy'
import { formatEur } from '../lib/format'

export type YearValueTableRow = {
  year: TaxYear
  value: number
  netoEur: number
}

type YearValueTableProps = {
  rows: YearValueTableRow[] | null
  valueColumnLabel: string
  formatValue: (n: number) => string
  emptyMessage?: string
  comparableYear: number
  /** Texto de leyenda al hover: compra irpf vs poder. */
  legendKind: 'poder' | 'irpf'
}

/**
 * Tabla mínima (solo reglas horizontales). Leyenda al hover con texto vs 2012, estilo bloque de gráfica.
 */
export function YearValueTable({
  rows,
  valueColumnLabel,
  formatValue,
  emptyMessage = 'Añade un bruto anual',
  comparableYear,
  legendKind,
}: YearValueTableProps) {
  const tipId = useId()
  const [hover, setHover] = useState<{
    i: number
    x: number
    y: number
  } | null>(null)

  const onRowPointer = useCallback((i: number) => (e: PointerEvent) => {
    setHover({ i, x: e.clientX, y: e.clientY })
  }, [])
  const onRowMove = useCallback((e: PointerEvent) => {
    setHover((h) => (h ? { ...h, x: e.clientX, y: e.clientY } : null))
  }, [])
  const onRowLeave = useCallback(() => setHover(null), [])

  const tipStyle = useMemo((): CSSProperties | null => {
    if (!hover) return null
    const gap = 8
    const maxW = 256
    const x = Math.min(hover.x + gap, (typeof window !== 'undefined' ? window.innerWidth : 1200) - maxW - 8)
    const y = Math.min(
      hover.y + gap,
      (typeof window !== 'undefined' ? window.innerHeight : 800) - 120,
    )
    return { left: Math.max(8, x), top: Math.max(8, y) }
  }, [hover])

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

  const first = rows[0]!.value
  const firstYear = rows[0]!.year

  const thHead =
    'px-2.5 pb-2.5 pt-0.5 text-left text-[0.65rem] font-normal leading-snug tracking-[0.14em] text-neutral-500 first:pl-0 last:pr-0 sm:px-3 sm:text-xs sm:tracking-[0.12em]'
  const tdBase =
    'px-2.5 py-3.5 text-left text-sm font-normal text-neutral-800 [font-family:var(--font-sans)] first:pl-0 last:pr-0 sm:px-3 sm:text-[0.9375rem]'
  const tdNum = `${tdBase} tabular-nums text-neutral-800`
  const tip = hover != null ? rows[hover.i]! : null
  const deltaVs2012Eur = tip == null ? null : tip.value - first

  return (
    <div className="relative w-full [font-family:var(--font-sans)]">
      <span id={tipId} className="sr-only">
        Leyenda al pasar el cursor por una fila
      </span>
      <table
        className="w-full min-w-0 border-collapse text-left"
        role="table"
        aria-describedby={tipId}
      >
        <caption className="sr-only">Valores por ejercicio fiscal</caption>
        <thead>
          <tr className="border-b border-neutral-200/80">
            <th scope="col" className={thHead + ' uppercase'}>
              AÑO
            </th>
            <th scope="col" className={thHead + ' uppercase'}>
              {valueColumnLabel}
            </th>
            <th scope="col" className={thHead + ' uppercase'}>
              Neto
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200/60">
          {rows.map((row, i) => (
            <tr
              key={row.year}
              className="cursor-default transition-colors hover:bg-neutral-200/20"
              onPointerEnter={onRowPointer(i)}
              onPointerMove={onRowMove}
              onPointerLeave={onRowLeave}
            >
              <th scope="row" className={tdBase}>
                {row.year}
              </th>
              <td className={tdNum}>{formatValue(row.value)}</td>
              <td className={tdNum}>{formatValue(row.netoEur)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {hover != null && tip != null && tipStyle && deltaVs2012Eur != null ? (
        <div
          className={kComparisonTooltipShellClass}
          style={tipStyle}
          role="tooltip"
        >
          <p className="m-0 text-sm text-neutral-500">Ejercicio {tip.year}</p>
          <p className="m-0 mt-1.5 text-sm font-medium leading-snug text-neutral-900">
            {comparisonLegendMainCopy(legendKind, tip.year, firstYear, deltaVs2012Eur)}
          </p>
          <p className="m-0 mt-2 border-t border-neutral-200/60 pt-2 text-sm leading-snug text-neutral-600">
            Neto (€ {comparableYear} comp.):{' '}
            <span className="font-medium text-neutral-800">{formatValue(tip.netoEur)}</span>
          </p>
        </div>
      ) : null}
    </div>
  )
}
