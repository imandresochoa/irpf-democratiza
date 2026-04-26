import { useId, useMemo, useState } from 'react'
import type { TaxYear } from '../domain/tax'
import { TAX_YEARS } from '../domain/tax'
import { formatEur, formatPct } from '../lib/format'

export type PayrollYearComparisonRow = {
  year: TaxYear
  bruto: number
  cotTrabajador: number
  irpf: number
  neto: number
  costeLaboral: number
}

/** Año fijo de referencia en la comparación de recibos. */
const ANCHOR_COMPARE_YEAR = 2026 as const satisfies TaxYear

const compareYearChoices = TAX_YEARS.filter((y): y is TaxYear => y !== ANCHOR_COMPARE_YEAR)

type PayrollYearComparisonTableProps = {
  rows: PayrollYearComparisonRow[] | null
  /** Año en el que interpretas el bruto nominal introducido (texto en cabecera de cada recibo). */
  grossNominalYear: TaxYear
  emptyMessage?: string
}

const rowLine =
  'flex min-w-0 items-baseline justify-between gap-3 border-b border-dotted border-neutral-300/90 py-2.5 [font-family:var(--font-sans)]'
const labelClass =
  'min-w-0 shrink text-left text-[0.65rem] font-medium uppercase leading-snug tracking-[0.14em] text-neutral-600'
const valueBlack = 'shrink-0 text-right text-sm font-normal tabular-nums text-neutral-900 sm:text-[0.9375rem]'
const valueDed = `${valueBlack} text-red-700`

function cargaSobreBrutoPct(r: PayrollYearComparisonRow): number {
  if (r.bruto <= 0) return 0
  return (100 * (r.cotTrabajador + r.irpf)) / r.bruto
}

function cunhaLaboralPct(r: PayrollYearComparisonRow): number {
  if (r.costeLaboral <= 0) return 0
  return (100 * (r.costeLaboral - r.neto)) / r.costeLaboral
}

function PayrollReceiptCard({
  row,
  grossNominalYear,
  badgeLine,
}: {
  row: PayrollYearComparisonRow
  grossNominalYear: TaxYear
  badgeLine: string
}) {
  const carga = cargaSobreBrutoPct(row)
  const cunha = cunhaLaboralPct(row)
  return (
    <article
      className="flex h-full min-w-0 flex-col rounded-xl border border-neutral-200/80 bg-[var(--color-surface)] px-4 py-4 shadow-sm sm:px-5 sm:py-5"
      aria-label={`Nómina nominal ejercicio ${row.year}`}
    >
      <div className="mb-1 flex min-w-0 items-start justify-between gap-2 border-b border-neutral-200/70 pb-3">
        <div className="min-w-0 pt-0.5">
          <p className="m-0 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-neutral-500">{badgeLine}</p>
          <p className="mt-1 m-0 text-xs leading-snug text-neutral-600">
            Bruto nominal · € {grossNominalYear}
          </p>
        </div>
        <p
          className="m-0 shrink-0 text-3xl font-semibold tabular-nums leading-none tracking-tight text-neutral-900 sm:text-4xl"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {row.year}
        </p>
      </div>

      <div className={rowLine}>
        <span className={labelClass}>Bruto</span>
        <span className={valueBlack}>{formatEur(row.bruto, 0)}</span>
      </div>
      <div className={rowLine}>
        <span className={labelClass}>SS trabajador</span>
        <span className={valueDed}>{formatEur(-row.cotTrabajador, 0)}</span>
      </div>
      <div className={rowLine}>
        <span className={labelClass}>IRPF final</span>
        <span className={valueDed}>{formatEur(-row.irpf, 0)}</span>
      </div>
      <div className={rowLine}>
        <span className={labelClass}>Carga sobre bruto</span>
        <span className={valueBlack}>{formatPct(carga, 1)}</span>
      </div>
      <div className="flex min-w-0 items-baseline justify-between gap-3 py-2.5">
        <span className={labelClass}>Cuña laboral</span>
        <span className={valueBlack}>{formatPct(cunha, 1)}</span>
      </div>

      <div className="mt-1 border-t-2 border-neutral-900 pt-4">
        <div className="flex min-w-0 items-end justify-between gap-3">
          <span className="min-w-0 max-w-[55%] text-left text-[0.65rem] font-semibold uppercase leading-snug tracking-[0.12em] text-neutral-800">
            Salario neto anual
          </span>
          <span
            className="shrink-0 text-right text-xl font-semibold tabular-nums tracking-tight text-neutral-900 sm:text-2xl"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {formatEur(row.neto, 0)}
          </span>
        </div>
      </div>
    </article>
  )
}

/**
 * Dos recibos: 2026 fijo y otro ejercicio elegible. Mismo bruto nominal en euros de `grossNominalYear`;
 * importes nominales del año de cada tarjeta.
 */
export function PayrollYearComparisonTable({
  rows,
  grossNominalYear,
  emptyMessage = 'Añade un bruto anual',
}: PayrollYearComparisonTableProps) {
  const selectId = useId()
  const [otherYear, setOtherYear] = useState<TaxYear>(2012)

  const rowByYear = useMemo(() => {
    if (rows == null) return null
    const m = new Map<TaxYear, PayrollYearComparisonRow>()
    for (const r of rows) m.set(r.year, r)
    return m
  }, [rows])

  if (rows == null || rows.length === 0 || rowByYear == null) {
    return (
      <p
        className="m-0 border-b border-neutral-200/70 py-6 text-left text-sm text-neutral-500 [font-family:var(--font-sans)]"
        role="status"
      >
        {emptyMessage}
      </p>
    )
  }

  const row2026 = rowByYear.get(ANCHOR_COMPARE_YEAR)
  const rowOther = rowByYear.get(otherYear)
  if (row2026 == null || rowOther == null) {
    return (
      <p className="m-0 text-sm text-neutral-500 [font-family:var(--font-sans)]" role="status">
        Faltan datos para comparar estos ejercicios.
      </p>
    )
  }

  return (
    <div className="min-w-0 [font-family:var(--font-sans)]">
      <p className="sr-only">
        Comparación de dos recibos: ejercicio {ANCHOR_COMPARE_YEAR} y ejercicio {otherYear}; mismo bruto nominal en
        euros de {grossNominalYear}.
      </p>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="m-0 max-w-xl text-sm leading-relaxed text-neutral-600">
          Fijamos <strong className="font-semibold text-neutral-800">{ANCHOR_COMPARE_YEAR}</strong> y eliges el
          otro ejercicio para ver la misma nómina nominal bajo cada norma.
        </p>
        <div className="flex shrink-0 flex-col gap-1.5 sm:items-end">
          <label htmlFor={selectId} className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-neutral-500">
            Comparar con
          </label>
          <select
            id={selectId}
            value={otherYear}
            onChange={(e) => setOtherYear(Number(e.target.value) as TaxYear)}
            className="min-w-[8.5rem] cursor-pointer rounded-lg border border-neutral-200/90 bg-[var(--color-surface)] px-3 py-2 text-base font-medium tabular-nums text-neutral-900 shadow-sm outline-none transition-[box-shadow,border-color] focus-visible:border-neutral-400 focus-visible:ring-2 focus-visible:ring-neutral-400/30"
          >
            {compareYearChoices.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
        <PayrollReceiptCard row={row2026} grossNominalYear={grossNominalYear} badgeLine="Legislación vigente" />
        <PayrollReceiptCard row={rowOther} grossNominalYear={grossNominalYear} badgeLine="Norma fiscal" />
      </div>
    </div>
  )
}
