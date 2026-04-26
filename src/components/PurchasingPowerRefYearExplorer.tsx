import { useEffect, useId, useMemo, useState } from 'react'
import {
  getAccumulatedInflation,
  isTaxYear,
  reexpressNominalEurAeurConstante,
  type TaxYear,
  TAX_YEARS,
} from '../domain/tax'
import { formatEur, formatPct } from '../lib/format'

const kCompareBoxClass =
  'flex min-h-0 min-w-0 flex-1 flex-col justify-between rounded-lg border border-neutral-200/80 bg-white/30 p-4 sm:min-h-[11.5rem] sm:p-5'
const kNetCompareFigureClass = 'm-0 text-2xl font-semibold leading-tight tabular-nums text-neutral-900 sm:text-3xl'

type PurchasingPowerRefYearExplorerProps = {
  currentYear: TaxYear
  grossNominal: number | null
  netNominal: number | null
}

/** Misma piel y ritmo que las tablas de comparativa (`kComparisonTableCardClass`). */
const kExplorerCardClass =
  'flex min-w-0 flex-col gap-5 overflow-hidden rounded-xl border border-neutral-200/70 bg-neutral-100 p-5 [font-family:var(--font-sans)] sm:gap-6 sm:p-7'

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
  const [refYear, setRefYear] = useState<TaxYear>(currentYear)

  useEffect(() => {
    setRefYear(currentYear)
  }, [currentYear])

  const netInRef = useMemo(() => {
    if (netNominal == null) return null
    return reexpressNominalEurAeurConstante(netNominal, currentYear, refYear)
  }, [netNominal, currentYear, refYear])

  const grossInRef = useMemo(() => {
    if (grossNominal == null) return null
    return reexpressNominalEurAeurConstante(grossNominal, currentYear, refYear)
  }, [grossNominal, currentYear, refYear])

  const ipcExplicacion = useMemo(() => {
    if (refYear === currentYear) return null
    if (refYear < currentYear) {
      const f = getAccumulatedInflation(refYear, currentYear)
      return { dir: 'up' as const, factor: f, desde: refYear, hasta: currentYear }
    }
    const f = getAccumulatedInflation(currentYear, refYear)
    return { dir: 'down' as const, factor: f, desde: currentYear, hasta: refYear }
  }, [refYear, currentYear])

  if (grossNominal == null || netNominal == null || netInRef == null || grossInRef == null) {
    return (
      <div
        className="flex min-w-0 flex-col gap-4 rounded-xl border border-neutral-200/70 bg-neutral-100 p-6 [font-family:var(--font-sans)] sm:gap-5 sm:p-8"
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
        Elige un <strong className="font-semibold">año de referencia</strong> para fijar la cesta (IPC): la cifra
        cambia de unidad, no es un “más o menos” en el calendario.
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
        className="border-t border-neutral-200/70 pt-5 sm:pt-6"
        aria-describedby={groupId + '-a'}
      >
        <p className="m-0 mb-4 text-sm leading-relaxed text-neutral-600 [font-family:var(--font-serif)]">
          Las dos cajas usan <strong className="font-medium text-neutral-800">el mismo</strong> sueldo, en dos
          unidades: no es de izquierda a derecha &quot;peor a mejor en el tiempo&quot;; el año de referencia fija
          solo con qué cesta mides, no ganas o pierdes al pasar al año {currentYear}.
        </p>
        <div
          className="grid min-h-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:items-stretch sm:gap-5"
          role="group"
          aria-label="Mismo neto: euros constantes de referencia frente a nominal"
        >
          <div className={kCompareBoxClass}>
            <p className="m-0 text-xs font-medium uppercase tracking-wider text-neutral-500 [font-family:var(--font-sans)]">
              Neto en € {refYear} (constantes, IPC diciembre–diciembre)
            </p>
            <p className={`${kNetCompareFigureClass} mt-3`}>{formatEur(netInRef, 0)}</p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-neutral-600 [font-family:var(--font-serif)]">
              Lo que hoy te pagan, expresado con precios fijados al cierre de {refYear}. Si este número baja, es
              otro cálculo en otra unidad, no &quot;menos vida en {refYear}&quot; que ahora.
            </p>
          </div>
          <div className={kCompareBoxClass}>
            <p className="m-0 text-xs font-medium uppercase tracking-wider text-neutral-500 [font-family:var(--font-sans)]">
              Neto en nómina (nominal) · {currentYear}
            </p>
            <p className={`${kNetCompareFigureClass} mt-3`}>{formatEur(netNominal, 0)}</p>
            <p className="m-0 mt-3 text-sm leading-relaxed text-neutral-600 [font-family:var(--font-serif)]">
              Cifra del mes con la ley e inflación al momento. Es la de la calculadora de arriba.
            </p>
          </div>
        </div>
        <p className="m-0 mt-4 text-sm leading-relaxed text-neutral-600 [font-family:var(--font-sans)]">
          Bruto con el mismo ajuste: <span className="font-medium text-neutral-800">{formatEur(grossInRef, 0)}</span>{' '}
          en € {refYear} (const.) ·{' '}
          <span className="font-medium text-neutral-800">{formatEur(grossNominal, 0)}</span> nominal.
        </p>
        {ipcExplicacion != null ? (
          <p className="m-0 mt-3 text-sm leading-relaxed text-neutral-500 [font-family:var(--font-serif)]">
            {ipcExplicacion.dir === 'up' ? (
              <>
                De {ipcExplicacion.desde} a {ipcExplicacion.hasta} el IPC al consumo se multiplica aprox. ×
                {ipcExplicacion.factor.toFixed(3)}: el neto al pie de hoy, leído con precios fijos en {ipcExplicacion.desde} (caja
                de la izquierda), baja al pasar a esa unidad, sin decir nada aún de “cómo se vivía entonces” frente
                a hoy.
              </>
            ) : (
              <>
                De {ipcExplicacion.desde} a {ipcExplicacion.hasta} los precios suben (×{ipcExplicacion.factor.toFixed(3)}):
                leer el sueldo en {refYear} sube el número, sin implicar una subida real de poder adquisitivo.
              </>
            )}
          </p>
        ) : null}
        {refYear !== currentYear ? (
          <p className="m-0 mt-3 text-sm leading-relaxed text-neutral-500 [font-family:var(--font-serif)]">
            Con la misma nómina, el neto en € {refYear} supone aprox.{' '}
            <span className="font-medium text-neutral-700">
              {formatPct(100 * (netInRef / netNominal), 1)}
            </span>{' '}
            del neto de la caja de la derecha, solo al cambiar la moneda fija, no al comparar años reales.
          </p>
        ) : null}
      </div>
    </div>
  )
}
