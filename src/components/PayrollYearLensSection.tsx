import type * as React from 'react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { TaxYear } from '../domain/tax'
import { TAX_YEARS } from '../domain/tax'
import { costeMensual, viviendaPropiedad, type CostOfLivingCategory } from '../domain/cost-of-living'
import { formatEur, formatPct } from '../lib/format'

export type PayrollYearLensRow = {
  year: TaxYear
  bruto: number
  cotTrabajador: number
  irpf: number
  neto: number
  costeLaboral: number
}

type PayrollYearLensSectionProps = {
  rows: PayrollYearLensRow[] | null
  /** Año en el que interpretas el bruto nominal introducido (texto en cabecera del recibo). */
  grossNominalYear: TaxYear
  emptyMessage?: string
}

const labelClass =
  'min-w-0 shrink text-left text-[0.65rem] font-medium uppercase leading-snug tracking-[0.14em] text-neutral-600'
const valueBlack = 'shrink-0 text-right text-sm font-normal tabular-nums text-neutral-900 sm:text-[0.9375rem]'
const valueDed = `${valueBlack} text-red-700`
const captionClass =
  'mt-0.5 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-neutral-500 [font-family:var(--font-sans)]'
const infoBtnClass =
  'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-neutral-400 transition-colors hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--color-surface)] aria-expanded:text-neutral-900'

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  )
}

function YearSelectChevron({ className }: { className?: string }) {
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

type ConceptRowProps = {
  label: string
  detail: string
  open: boolean
  onToggle: () => void
  /** Right column. Puede ser una sola línea (string) o un nodo libre. */
  right: React.ReactNode
  /** Fila secundaria bajo la principal (a ancho completo). */
  footer?: React.ReactNode
  /** Si la fila va antes de un total y no debe tener separador inferior. */
  noBorder?: boolean
}

/**
 * Caja de la leyenda emergente: mismo lenguaje visual que el tooltip flotante de los gráficos
 * (`kComparisonTooltipShellClass`), pero anclada al botón de info por su esquina inferior izquierda
 * (es decir, el popover crece hacia arriba y hacia la derecha desde la esquina superior derecha
 * del icono).
 */
const popoverShellClass =
  'absolute bottom-full left-full z-20 mb-1.5 w-max max-w-[14rem] rounded-xl border border-neutral-200/50 bg-[color-mix(in_srgb,var(--color-neutral-100)_88%,var(--color-surface))] px-3 py-2 text-[0.78rem] leading-snug text-neutral-700 shadow-sm backdrop-blur-md [font-family:var(--font-sans)]'

function ConceptRow({ label, detail, open, onToggle, right, footer, noBorder }: ConceptRowProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const tipId = useId()

  useEffect(() => {
    if (!open) return
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (wrapperRef.current && wrapperRef.current.contains(target)) return
      onToggle()
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onToggle()
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, onToggle])

  return (
    <div
      ref={wrapperRef}
      className={[
        '[font-family:var(--font-sans)]',
        noBorder ? '' : 'border-b border-dotted border-neutral-300/90',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex min-w-0 items-baseline justify-between gap-3 py-2.5">
        <div className="flex min-w-0 items-center gap-1.5 pr-2">
          <span className={labelClass}>{label}</span>
          <span className="relative inline-flex">
            <button
              type="button"
              onClick={onToggle}
              className={infoBtnClass}
              aria-expanded={open}
              aria-controls={tipId}
              aria-label={open ? `Ocultar explicación de ${label}` : `Ver explicación de ${label}`}
            >
              <InfoIcon />
            </button>
            {open && (
              <div id={tipId} role="tooltip" className={popoverShellClass}>
                {detail}
              </div>
            )}
          </span>
        </div>
        <div className="shrink-0 text-right">{right}</div>
      </div>
      {footer ? <div className="pb-3.5">{footer}</div> : null}
    </div>
  )
}

function variationVs2012Text(deltaPctPoints: number): {
  text: string
  className: string
} {
  const absDelta = Math.abs(deltaPctPoints)
  if (absDelta < 0.05) {
    return {
      text: 'igual que en 2012',
      className: 'bg-neutral-100 text-neutral-700',
    }
  }
  if (deltaPctPoints > 0) {
    return {
      text: `dedicas un ${formatPct(absDelta, 1)} más que en 2012`,
      className: 'bg-red-100 text-red-700',
    }
  }
  return {
    text: `dedicas un ${formatPct(absDelta, 1)} menos que en 2012`,
    className: 'bg-emerald-100 text-emerald-700',
  }
}

function timesVs2012Text(current: number, base: number): {
  text: string
  className: string
} {
  if (base <= 0 || current <= 0) {
    return {
      text: 'igual que en 2012',
      className: 'bg-neutral-100 text-neutral-700',
    }
  }
  const ratio = current / base
  if (Math.abs(ratio - 1) < 0.01) {
    return {
      text: 'igual que en 2012',
      className: 'bg-neutral-100 text-neutral-700',
    }
  }
  const formatTimes = (n: number) =>
    new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(n)
  if (ratio > 1) {
    return {
      text: `${formatTimes(ratio)} veces más que en 2012`,
      className: 'bg-red-100 text-red-700',
    }
  }
  return {
    text: `${formatTimes(base / current)} veces menos que en 2012`,
    className: 'bg-emerald-100 text-emerald-700',
  }
}

function cargaSobreBrutoPct(r: PayrollYearLensRow): number {
  if (r.bruto <= 0) return 0
  return (100 * (r.cotTrabajador + r.irpf)) / r.bruto
}

function cunhaLaboralPct(r: PayrollYearLensRow): number {
  if (r.costeLaboral <= 0) return 0
  return (100 * (r.costeLaboral - r.neto)) / r.costeLaboral
}

function PayrollReceiptCard({
  row,
  badgeLine,
}: {
  row: PayrollYearLensRow
  badgeLine: string
}) {
  const carga = cargaSobreBrutoPct(row)
  const cunha = cunhaLaboralPct(row)
  const [openSource, setOpenSource] = useState<string | null>(null)
  const toggle = (key: string) =>
    setOpenSource((prev) => (prev === key ? null : key))
  return (
    <article
      className="flex h-full min-w-0 flex-col rounded-xl border border-neutral-200/80 bg-[var(--color-surface)] px-4 py-4 sm:px-5 sm:py-5"
      aria-label={`Nómina nominal ejercicio ${row.year}`}
    >
      <div className="mb-1 flex min-w-0 items-end justify-between gap-2 border-b border-neutral-200/70 pb-3">
        <div className="min-w-0">
          <p className="m-0 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-neutral-500">{badgeLine}</p>
        </div>
        <p
          className="m-0 shrink-0 text-3xl font-semibold tabular-nums leading-none tracking-tight text-neutral-900 sm:text-4xl"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {row.year}
        </p>
      </div>

      <ConceptRow
        label="Bruto"
        detail="Tu salario antes de impuestos y cotizaciones, lo que pone tu contrato como sueldo anual."
        open={openSource === 'bruto'}
        onToggle={() => toggle('bruto')}
        right={<span className={valueBlack}>{formatEur(row.bruto, 0)}</span>}
      />
      <ConceptRow
        label="SS trabajador"
        detail="La parte de la cotización a la Seguridad Social que pagas tú como trabajador. Se descuenta directamente de tu nómina (en torno al 6,35 % del bruto, hasta la base máxima)."
        open={openSource === 'ss'}
        onToggle={() => toggle('ss')}
        right={<span className={valueDed}>{formatEur(-row.cotTrabajador, 0)}</span>}
      />
      <ConceptRow
        label="IRPF final"
        detail="La retención del impuesto sobre la renta que tu empresa te aplica durante el año, ya con todos los ajustes (mínimo personal y familiar, deducción por SMI, etc.)."
        open={openSource === 'irpf'}
        onToggle={() => toggle('irpf')}
        right={<span className={valueDed}>{formatEur(-row.irpf, 0)}</span>}
      />
      <ConceptRow
        label="Carga sobre bruto"
        detail="Porcentaje de tu sueldo bruto que se va en IRPF y en tu cotización a la Seguridad Social."
        open={openSource === 'carga'}
        onToggle={() => toggle('carga')}
        right={<span className={valueBlack}>{formatPct(carga, 1)}</span>}
      />
      <ConceptRow
        label="Cuña laboral"
        detail="Diferencia entre lo que cuestas a tu empresa (coste laboral total) y lo que recibes neto, en porcentaje del coste laboral. Incluye IRPF, tu cotización y la cotización empresarial."
        open={openSource === 'cunha'}
        onToggle={() => toggle('cunha')}
        right={<span className={valueBlack}>{formatPct(cunha, 1)}</span>}
        noBorder
      />

      <div className="mt-auto pt-6">
        <div className="flex min-w-0 items-end justify-between gap-3 border-t-2 border-neutral-900 pt-4">
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

const COST_ROWS: ReadonlyArray<{
  category: CostOfLivingCategory
  label: string
  caption: string
}> = [
  {
    category: 'cesta',
    label: 'Cesta de la compra familiar',
    caption: 'INE · Alimentos y bebidas no alcohólicas (gasto medio por hogar)',
  },
  { category: 'alquiler', label: 'Alquiler mensual', caption: 'INE · Alquileres reales por la vivienda' },
  { category: 'energia', label: 'Luz y gas en casa', caption: 'INE · Electricidad, gas y otros combustibles' },
  { category: 'carburantes', label: 'Combustible', caption: 'INE · Carburantes para vehículo personal' },
]

function CostOfLivingCard({ row, baseRow }: { row: PayrollYearLensRow; baseRow: PayrollYearLensRow }) {
  const netoMensual = row.neto / 12
  const baseNetoMensual = baseRow.neto / 12
  const vivienda = viviendaPropiedad(row.year)
  const viviendaBase = viviendaPropiedad(2012)
  const priceM2Variation = timesVs2012Text(
    vivienda.pricePerSquareMeterEur,
    viviendaBase.pricePerSquareMeterEur,
  )
  const viviendaTotalVariation = timesVs2012Text(
    vivienda.totalEurForTypicalSize,
    viviendaBase.totalEurForTypicalSize,
  )
  const [openSource, setOpenSource] = useState<string | null>(null)
  const toggleSource = (key: string) =>
    setOpenSource((prev) => (prev === key ? null : key))
  return (
    <article
      className="flex h-full min-w-0 flex-col rounded-xl border border-neutral-200/80 bg-[var(--color-surface)] px-4 py-4 sm:px-5 sm:py-5"
      aria-label={`Coste de vida estimado ${row.year}`}
    >
      <div className="mb-1 flex min-w-0 items-end justify-between gap-2 border-b border-neutral-200/70 pb-3">
        <div className="min-w-0">
          <p className="m-0 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Coste de vida
          </p>
        </div>
        <p
          className="m-0 shrink-0 text-3xl font-semibold tabular-nums leading-none tracking-tight text-neutral-900 sm:text-4xl"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {row.year}
        </p>
      </div>

      {COST_ROWS.map(({ category, label, caption }) => {
        const item = costeMensual(row.year, category)
        const pct = netoMensual > 0 ? (100 * item.amountMonthlyEur) / netoMensual : 0
        const baseItem = costeMensual(2012, category)
        const basePct = baseNetoMensual > 0 ? (100 * baseItem.amountMonthlyEur) / baseNetoMensual : 0
        const delta = pct - basePct
        const variation = variationVs2012Text(delta)
        return (
          <ConceptRow
            key={category}
            label={label}
            detail={caption}
            open={openSource === category}
            onToggle={() => toggleSource(category)}
            right={
              <div className="flex items-center justify-end gap-2">
                <p className={`m-0 ${captionClass}`}>{formatPct(pct, 1)} del neto</p>
                <p className={`m-0 ${valueBlack}`}>{formatEur(item.amountMonthlyEur, 0)}/mes</p>
              </div>
            }
            footer={
              <div className="flex items-center justify-end gap-1.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[0.62rem] font-medium leading-none ${variation.className}`}
                >
                  {variation.text}
                </span>
              </div>
            }
          />
        )
      })}

      <ConceptRow
        label="Precio del m² (vivienda libre)"
        detail="Estimación del precio medio del metro cuadrado de vivienda libre. Punto de partida 2012 (Mitma, “Estadística de precios de vivienda libre”) proyectado año a año con el IPV del INE."
        open={openSource === 'precioM2'}
        onToggle={() => toggleSource('precioM2')}
        right={<span className={valueBlack}>{formatEur(vivienda.pricePerSquareMeterEur, 0)}/m²</span>}
        footer={
          <div className="flex items-center justify-end gap-1.5">
            <span
              className={`rounded-full px-2 py-0.5 text-[0.62rem] font-medium leading-none ${priceM2Variation.className}`}
            >
              {priceM2Variation.text}
            </span>
          </div>
        }
      />
      <ConceptRow
        label="Vivienda en propiedad"
        detail="Total estimado para un piso tipo de 80 m² al precio del año."
        open={openSource === 'vivienda'}
        onToggle={() => toggleSource('vivienda')}
        right={
          <p className={`m-0 ${valueBlack}`}>{formatEur(vivienda.totalEurForTypicalSize, 0)}</p>
        }
        footer={
          <div className="flex items-center justify-end gap-1.5">
            <span
              className={`rounded-full px-2 py-0.5 text-[0.62rem] font-medium leading-none ${viviendaTotalVariation.className}`}
            >
              {viviendaTotalVariation.text}
            </span>
          </div>
        }
        noBorder
      />
    </article>
  )
}

/**
 * Selector de año único que muestra a la izquierda el recibo de ese ejercicio y a la derecha
 * un panel de coste de vida (cesta, alquiler, vivienda, energía, carburantes) con la
 * proporción que representan sobre el neto mensual.
 */
export function PayrollYearLensSection({
  rows,
  grossNominalYear,
  emptyMessage = 'Añade un bruto anual',
}: PayrollYearLensSectionProps) {
  const selectId = useId()
  const [selectedYear, setSelectedYear] = useState<TaxYear>(grossNominalYear)

  const rowByYear = useMemo(() => {
    if (rows == null) return null
    const m = new Map<TaxYear, PayrollYearLensRow>()
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

  const row = rowByYear.get(selectedYear)
  const baseRow = rowByYear.get(2012 as TaxYear)
  if (row == null) {
    return (
      <p className="m-0 text-sm text-neutral-500 [font-family:var(--font-sans)]" role="status">
        Faltan datos para mostrar este ejercicio.
      </p>
    )
  }
  if (baseRow == null) {
    return (
      <p className="m-0 text-sm text-neutral-500 [font-family:var(--font-sans)]" role="status">
        Faltan datos base de 2012 para calcular variaciones.
      </p>
    )
  }

  return (
    <div className="min-w-0 [font-family:var(--font-sans)]">
      <p className="sr-only">
        Recibo y coste de vida para el ejercicio {selectedYear}; bruto nominal en euros de {grossNominalYear}.
      </p>

      <label className="mb-5 flex w-full min-w-0 max-w-sm flex-col gap-2.5 [font-family:var(--font-sans)]" htmlFor={selectId}>
        <span className="text-xs font-medium uppercase tracking-wider text-neutral-500">Año seleccionado</span>
        <div className="relative w-full min-w-0">
          <select
            id={selectId}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value) as TaxYear)}
            className="h-11 w-full min-w-0 cursor-pointer appearance-none rounded-lg border border-neutral-200/80 bg-[var(--color-surface)] py-0 pl-3.5 pr-12 text-base font-medium text-neutral-900 [font-family:var(--font-sans)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]"
          >
            {TAX_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <YearSelectChevron className="pointer-events-none absolute right-0 top-0 flex h-11 w-12 items-center justify-center text-neutral-500" />
        </div>
      </label>

      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
        <PayrollReceiptCard row={row} badgeLine="Desglose de tu salario" />
        <CostOfLivingCard row={row} baseRow={baseRow} />
      </div>
    </div>
  )
}
