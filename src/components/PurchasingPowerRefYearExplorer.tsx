import { useId, useMemo, useState } from 'react'
import {
  getAccumulatedInflation,
  INFLATION_COMPARISON_REF_YEAR,
  isTaxYear,
  reexpressNominalEurAeurConstante,
  type TaxYear,
  TAX_YEARS,
} from '../domain/tax'
import { formatEur, formatPct } from '../lib/format'

const kCompareBoxClass =
  'flex min-h-0 min-w-0 flex-1 flex-col justify-between rounded-xl border border-neutral-200/80 bg-[var(--color-surface)] p-4 sm:min-h-[11.5rem] sm:p-5'
const kNetCompareFigureClass = 'm-0 text-2xl font-semibold leading-tight tabular-nums text-neutral-900 sm:text-3xl'

type PurchasingPowerRefYearExplorerProps = {
  currentYear: TaxYear
  grossNominal: number | null
  netNominal: number | null
}

/** Misma piel y ritmo que las tablas de comparativa (sin borde de tarjeta). */
const kExplorerCardClass =
  'flex min-w-0 flex-col gap-5 overflow-hidden rounded-xl bg-neutral-100 p-5 [font-family:var(--font-sans)] sm:gap-6 sm:p-7'

const kSelectClass =
  'h-11 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-neutral-200/80 bg-[var(--color-surface)] py-0 pl-3.5 pr-12 text-base font-medium text-neutral-900 [font-family:var(--font-sans)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]'

function SelectChevron({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden>
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.127l3.71-3.89a.75.75 0 111.08 1.04l-4.25 4.45a.75.75 0 01-1.08 0l-4.25-4.45a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  )
}

/**
 * Ajusta el neto (y bruto) nominal del año de la calculadora a € constantes de un año
 * elegible: al ir a años anteriores, el importe “baja” y se ve el poder adquisitivo real.
 */
export function PurchasingPowerRefYearExplorer({
  currentYear,
  grossNominal,
  netNominal,
}: PurchasingPowerRefYearExplorerProps) {
  const groupId = useId()
  const [refYear, setRefYear] = useState<TaxYear>(INFLATION_COMPARISON_REF_YEAR)

  const netInRef = useMemo(() => {
    if (netNominal == null) return null
    return reexpressNominalEurAeurConstante(netNominal, currentYear, refYear)
  }, [netNominal, currentYear, refYear])

  const grossInRef = useMemo(() => {
    if (grossNominal == null) return null
    return reexpressNominalEurAeurConstante(grossNominal, currentYear, refYear)
  }, [grossNominal, currentYear, refYear])

  /** Diferencia en € entre el neto en constantes (derecha) y el nominal (izquierda). */
  const netDeltaVsNominal = useMemo(() => {
    if (netNominal == null || netInRef == null) return null
    return netInRef - netNominal
  }, [netNominal, netInRef])

  /** Texto breve: variación del neto al pasar a € constantes + subida/bajada del IPC entre años. */
  const resumenPoderAdquisitivo = useMemo(() => {
    if (netNominal == null || netInRef == null || refYear === currentYear) return null
    if (refYear < currentYear) {
      return {
        modo: 'pasado' as const,
        refYear,
        currentYear,
      }
    }
    const ratio = netInRef / netNominal
    const fPrecios = getAccumulatedInflation(currentYear, refYear)
    const subidaPreciosPct = 100 * (fPrecios - 1)
    const subeCifraPct = 100 * (ratio - 1)
    return {
      modo: 'futuro' as const,
      refYear,
      currentYear,
      subidaPreciosPct,
      subeCifraPct,
    }
  }, [refYear, currentYear, netNominal, netInRef])

  if (grossNominal == null || netNominal == null || netInRef == null || grossInRef == null) {
    return (
      <div
        className="flex min-w-0 flex-col gap-4 rounded-xl bg-neutral-100 p-6 [font-family:var(--font-sans)] sm:gap-5 sm:p-8"
        role="region"
        aria-labelledby={groupId + '-h'}
      >
        <h2
          id={groupId + '-h'}
          className="m-0 text-2xl font-semibold text-neutral-900 [font-family:var(--font-serif)] sm:text-3xl"
        >
          Poder adquisitivo real
        </h2>
        <p className="m-0 text-base text-neutral-700 [font-family:var(--font-serif)]">
          Introduce un bruto arriba para ver cómo se traduce tu neto en € constantes de otros años
          (IPC diciembre–diciembre).
        </p>
      </div>
    )
  }

  return (
    <div
      className={kExplorerCardClass}
      role="group"
      aria-label="Comparar neto nominal con euros constantes de un año de referencia"
    >
      <h2
        className="m-0 min-w-0 text-2xl font-semibold leading-tight text-neutral-900 [font-family:var(--font-serif)] sm:text-3xl"
      >
        Poder adquisitivo real
      </h2>
      <p className="m-0 text-base leading-relaxed text-neutral-800 [font-family:var(--font-serif)]">
        Elige el año para comparar tu poder adquisitivo. La cifra de la derecha muestra tu nómina en euros de ese
        año. Esta comparación te permite ver si tu dinero rinde más o menos que antes, es decir, cuánto han cambiado
        los precios y tu capacidad real de compra.
      </p>

      <label
        className="flex w-full min-w-0 max-w-sm flex-col gap-2.5 [font-family:var(--font-sans)]"
        id={groupId + '-a'}
      >
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">Año de referencia</span>
        <div className="relative w-full min-w-0">
          <select
            value={refYear}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10)
              if (isTaxYear(n)) setRefYear(n)
            }}
            className={kSelectClass}
          >
            {TAX_YEARS.map((y) => (
              <option key={y} value={y}>
                {y} {y === currentYear ? '(hoy, nominal)' : ''}
              </option>
            ))}
          </select>
          <SelectChevron className="pointer-events-none absolute right-0 top-0 flex h-11 w-12 items-center justify-center text-neutral-500" />
        </div>
      </label>

      <div
        className="pt-5 sm:pt-6"
        aria-describedby={groupId + '-a'}
      >
        <div
          className="grid min-h-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch sm:gap-5"
          role="group"
          aria-label="Mismo neto: nómina nominal (año actual) a la izquierda, euros de referencia a la derecha"
        >
          <div className={kCompareBoxClass}>
            <p className="m-0 text-xs font-medium uppercase tracking-wider text-neutral-500 [font-family:var(--font-sans)]">
              Tu salario neto actual (nominal)
            </p>
            <p className={`${kNetCompareFigureClass} mt-3`}>{formatEur(netNominal, 0)}</p>
          </div>
          <div className={kCompareBoxClass}>
            <p className="m-0 text-xs font-medium uppercase tracking-wider text-neutral-500 [font-family:var(--font-sans)]">
              Tu salario en euros de {refYear}
            </p>
            <div className="mt-3 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className="text-2xl font-semibold leading-tight tabular-nums text-neutral-900 sm:text-3xl">
                {formatEur(netInRef, 0)}
              </span>
              {refYear !== currentYear && netDeltaVsNominal != null ? (
                <span
                  className={`text-lg font-semibold leading-tight tabular-nums sm:text-xl ${
                    netDeltaVsNominal < 0
                      ? 'text-[color:var(--color-chart-terracotta-line)]'
                      : netDeltaVsNominal > 0
                        ? 'text-[color:var(--color-chart-green-line)]'
                        : 'text-neutral-600'
                  }`}
                >
                  {formatEur(netDeltaVsNominal, 0)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        {resumenPoderAdquisitivo != null ? (
          <p className="m-0 mt-4 text-base leading-relaxed text-neutral-800 [font-family:var(--font-serif)]">
            {resumenPoderAdquisitivo.modo === 'pasado' ? (
              <>
                Con tu sueldo actual,{' '}
                <span className="underline decoration-dashed decoration-2 [text-decoration-color:var(--color-focus)] underline-offset-[0.22em]">
                  tienes el mismo poder de compra que alguien que ganaba{' '}
                  <strong className="font-semibold text-neutral-900">{formatEur(netInRef, 0)}</strong> netos en{' '}
                  {resumenPoderAdquisitivo.refYear}
                </span>
                .
              </>
            ) : (
              <>
                Entre {resumenPoderAdquisitivo.currentYear} y {resumenPoderAdquisitivo.refYear} el IPC acumuló un{' '}
                <strong className="font-semibold text-neutral-900">
                  {formatPct(resumenPoderAdquisitivo.subidaPreciosPct, 1)}
                </strong>{' '}
                de subida en precios al consumo. Por eso tu neto en constantes de {resumenPoderAdquisitivo.refYear}{' '}
                sale un{' '}
                <strong className="font-semibold text-neutral-900">
                  {formatPct(resumenPoderAdquisitivo.subeCifraPct, 1)}
                </strong>{' '}
                más alto en papel que el nominal de {resumenPoderAdquisitivo.currentYear}: misma nómina, cesta más
                cara, otra forma de expresarlo —no significa que hayas ganado poder adquisitivo real.
              </>
            )}
          </p>
        ) : null}
      </div>
    </div>
  )
}
