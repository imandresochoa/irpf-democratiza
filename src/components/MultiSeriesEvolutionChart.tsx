import { useCallback, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { TaxYear } from '../domain/tax'
import { formatEur, formatPct, formatSignedPctCompact } from '../lib/format'

const VIEW = { w: 100, h: 44 }

const Y_TICK_STEP = 10

function buildYTicks(yAxisLo: number, yAxisHi: number): number[] {
  const first = Math.floor(yAxisLo / Y_TICK_STEP) * Y_TICK_STEP
  const last = Math.ceil(yAxisHi / Y_TICK_STEP) * Y_TICK_STEP
  const out: number[] = []
  for (let t = first; t <= last + 1e-6; t += Y_TICK_STEP) {
    out.push(Math.round(t * 100) / 100)
  }
  return out
}

/**
 * `value` = % acumulado vs `baselineYear`; `yoyPercent` = intra-anual.
 * Opcional: Δ en € vs el mismo año base (constantes base) y en € nominales del año de referencia.
 */
export type MultiSeriesPoint = {
  year: TaxYear
  value: number
  yoyPercent?: number | null
  deltaEurVsBaselineConstant?: number | null
  deltaEurVsBaselineNominalRefYear?: number | null
}

export type ChartVariant =
  | 'green'
  | 'terracotta'
  | 'lavender'
  | 'mint'
  | 'blue'
  | 'pink'
  | 'peach'

export type MultiSeries = {
  id: string
  label: string
  variant: ChartVariant
  points: MultiSeriesPoint[]
}

type MultiSeriesEvolutionChartProps = {
  series: MultiSeries[]
  className?: string
  yFormat?: (n: number) => string
  /** Año donde anclar 0 (línea horizontal). 2012 por defecto. */
  baselineYear?: TaxYear
  /** Título opcional junto al eje Y (si se omite, no se muestra). */
  yAxisLabel?: string
  /** Si las series traen `deltaEurVsBaselineNominalRefYear`, etiqueta del año nominal (p. ej. calculadora). */
  euroNominalRefYear?: TaxYear
  /** Dominio Y fijo opcional [min, max] para mantener escala estable entre vistas. */
  yDomain?: readonly [number, number]
  /** Control opcional alineado con los selectores (leyenda) del gráfico. */
  topRightControl?: ReactNode
  /** Notifica el año más cercano cuando se hace clic en el área del plot. */
  onYearClick?: (year: TaxYear) => void
  /** Año actualmente seleccionado en el gráfico (si existe). */
  selectedYear?: TaxYear | null
}

const variantStyles: Record<ChartVariant, { fillVar: string; lineVar: string }> = {
  green: {
    fillVar: 'var(--color-chart-green-fill, rgb(98 150 120))',
    lineVar: 'var(--color-chart-green-line, rgb(60 100 70))',
  },
  terracotta: {
    fillVar: 'var(--color-chart-terracotta-fill, rgb(188 115 95))',
    lineVar: 'var(--color-chart-terracotta-line, rgb(120 64 52))',
  },
  lavender: {
    fillVar: 'var(--color-chart-lavender-fill, rgb(150 130 180))',
    lineVar: 'var(--color-chart-lavender-line, rgb(90 70 120))',
  },
  mint: {
    fillVar: 'var(--color-chart-mint-fill, rgb(95 160 150))',
    lineVar: 'var(--color-chart-mint-line, rgb(50 95 90))',
  },
  blue: {
    fillVar: 'var(--color-chart-blue-fill, rgb(110 150 200))',
    lineVar: 'var(--color-chart-blue-line, rgb(50 80 120))',
  },
  pink: {
    fillVar: 'var(--color-chart-pink-fill, rgb(200 120 150))',
    lineVar: 'var(--color-chart-pink-line, rgb(110 55 75))',
  },
  peach: {
    fillVar: 'var(--color-chart-peach-fill, rgb(200 130 100))',
    lineVar: 'var(--color-chart-peach-line, rgb(120 70 50))',
  },
}

function smoothPathLine(points: ReadonlyArray<{ x: number; y: number }>): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  const p = (i: number) => points[Math.max(0, Math.min(points.length - 1, i))]
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = p(i - 1)
    const p1 = p(i)
    const p2 = p(i + 1)
    const p3 = p(i + 2)
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x} ${c1y} ${c2x} ${c2y} ${p2.x} ${p2.y}`
  }
  return d
}

function yForValue(v: number, min: number, max: number, pad: number): number {
  const range = max - min
  if (range <= 0) return VIEW.h / 2
  const lo = min - range * pad
  const hi = max + range * pad
  const t = (v - lo) / (hi - lo)
  const topY = 0.08 * VIEW.h
  const bottomY = 0.92 * VIEW.h
  return bottomY - t * (bottomY - topY)
}

/**
 * Gráfico multi-serie a ancho completo con leyenda clicable. Foco: clic en una serie la
 * resalta y atenúa el resto; otro clic la suelta. Tooltip al pasar el cursor con el valor
 * de cada serie en el año bajo el cursor.
 */
export function MultiSeriesEvolutionChart({
  series,
  className,
  yFormat = (n) => formatPct(n, 1),
  baselineYear = 2012,
  yAxisLabel,
  euroNominalRefYear,
  yDomain,
  topRightControl,
  onYearClick,
  selectedYear = null,
}: MultiSeriesEvolutionChartProps) {
  const gradId = useId()
  const labelledById = useId()
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const plotRef = useRef<HTMLDivElement | null>(null)
  const [plotSize, setPlotSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 })
  const [hover, setHover] = useState<{
    index: number
    xPx: number
    yPx: number
    boxW: number
    boxH: number
  } | null>(null)

  const usableSeries = useMemo(
    () => series.filter((s) => s.points.length > 0),
    [series],
  )

  /** Ordena: enfocada al final (encima del resto). */
  const renderOrder = useMemo(() => {
    if (focusedId == null) {
      const green = usableSeries.filter((s) => s.id === 'poder')
      const rest = usableSeries.filter((s) => s.id !== 'poder')
      return [...rest, ...green]
    }
    return [...usableSeries.filter((s) => s.id !== focusedId), ...usableSeries.filter((s) => s.id === focusedId)]
  }, [usableSeries, focusedId])

  const years = useMemo(() => {
    const set = new Set<TaxYear>()
    for (const s of usableSeries) for (const p of s.points) set.add(p.year)
    return Array.from(set).sort((a, b) => a - b)
  }, [usableSeries])

  const yearToIndex = useMemo(() => {
    const m = new Map<TaxYear, number>()
    years.forEach((y, i) => m.set(y, i))
    return m
  }, [years])

  const { layoutBySeries, mn, mx, pad, yTicks, yAxisHi, yAxisLo } = useMemo(() => {
    if (usableSeries.length === 0 || years.length === 0) {
      return {
        layoutBySeries: new Map<string, { x: number; y: number; year: TaxYear; value: number }[]>(),
        mn: 0,
        mx: 0,
        pad: 0.1,
        yTicks: [] as number[],
        yAxisHi: 0,
        yAxisLo: 0,
      }
    }
    const allValues = usableSeries.flatMap((s) => s.points.map((p) => p.value))
    let mn = yDomain?.[0] ?? Math.min(...allValues, 0)
    let mx = yDomain?.[1] ?? Math.max(...allValues, 0)
    if (mn === mx) {
      mn -= 1
      mx += 1
    }
    const pad = 0.1
    const range = mx - mn
    const yAxisLo = mn - range * pad
    const yAxisHi = mx + range * pad
    const yTicks = buildYTicks(yAxisLo, yAxisHi)
    const n = years.length
    const map = new Map<string, { x: number; y: number; year: TaxYear; value: number }[]>()
    for (const s of usableSeries) {
      const sorted = [...s.points].sort((a, b) => a.year - b.year)
      const layout = sorted.map((p) => {
        const idx = yearToIndex.get(p.year) ?? 0
        const x = n === 1 ? 50 : (idx / (n - 1)) * 100
        return { x, y: yForValue(p.value, mn, mx, pad), year: p.year, value: p.value }
      })
      map.set(s.id, layout)
    }
    return { layoutBySeries: map, mn, mx, pad, yTicks, yAxisHi, yAxisLo }
  }, [usableSeries, years, yearToIndex, yDomain])

  /** Hit-test solo sobre el tramo del plot (SVG + eje X), no la columna de ticks del eje Y,
   * para que x=0 y x=ancho correspondan a 2012 y al último año (p. ej. 2026). */
  const onMove = useCallback(
    (clientX: number, clientY: number, plotEl: HTMLDivElement) => {
      if (years.length === 0) return
      const r = plotEl.getBoundingClientRect()
      const xPx = clientX - r.left
      const yPx = clientY - r.top
      const x = r.width > 0 ? Math.min(1, Math.max(0, xPx / r.width)) : 0
      const idx =
        years.length === 1
          ? 0
          : Math.max(0, Math.min(years.length - 1, Math.round(x * (years.length - 1))))
      setHover({ index: idx, xPx, yPx, boxW: r.width, boxH: r.height })
    },
    [years.length],
  )

  const hoveredYear = hover && years.length > 0 ? years[hover.index] : null
  const baselineSeries = usableSeries.length > 0 ? usableSeries[0] : null
  const lastYear = years.length > 0 ? years[years.length - 1] : null

  /** Punto de una serie en un año concreto (o `null` si no existe). */
  const pointAt = useCallback((s: MultiSeries, year: TaxYear | null): MultiSeriesPoint | null => {
    if (year == null) return null
    return s.points.find((pt) => pt.year === year) ?? null
  }, [])

  const tooltipStyle = useMemo((): CSSProperties | null => {
    if (!hover) return null
    const offsetX = 6
    const gap = 6
    const approxW = 280
    const { xPx, yPx, boxW, boxH } = hover
    const left = Math.min(Math.max(6, xPx + offsetX), Math.max(6, boxW - approxW - 6))
    const preferAbove = yPx > 60
    const top = preferAbove ? Math.min(Math.max(4, yPx), boxH - 2) : Math.min(yPx + gap, boxH - 8)
    const transform: CSSProperties['transform'] = preferAbove
      ? `translate(0, calc(-100% - ${gap}px))`
      : 'translate(0, 0)'
    return { left, top, transform }
  }, [hover])

  useEffect(() => {
    const el = plotRef.current
    if (el == null) return
    const update = () => {
      const r = el.getBoundingClientRect()
      setPlotSize({ w: r.width, h: r.height })
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  /**
   * Con preserveAspectRatio="none", X e Y escalan distinto.
   * Ajustamos ry para que el marcador se vea circular en pantalla.
   */
  const markerRyFactor = useMemo(() => {
    if (plotSize.w <= 0 || plotSize.h <= 0) return 1
    const scaleX = plotSize.w / VIEW.w
    const scaleY = plotSize.h / VIEW.h
    if (scaleY <= 0) return 1
    return scaleX / scaleY
  }, [plotSize])

  if (usableSeries.length === 0) {
    return (
      <div
        className={[
          'flex h-72 w-full min-h-0 items-center justify-center text-base text-neutral-800 [font-family:var(--font-serif)]',
          className ?? '',
        ].join(' ')}
      >
        Añade un bruto anual para comparar las series
      </div>
    )
  }

  /** Etiquetas X: mostrar todos los años disponibles. */
  const xTicks = years

  return (
    <div className={['flex w-full min-w-0 flex-col gap-3 sm:gap-4', className ?? ''].join(' ')}>
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <ul
          className="m-0 flex list-none flex-wrap items-center gap-x-4 gap-y-2 p-0 [font-family:var(--font-sans)]"
          aria-label="Series del gráfico (toca o haz clic para resaltar)"
        >
          {usableSeries.map((s) => {
            const isFocused = focusedId === s.id
            const dim = focusedId != null && !isFocused
            const colors = variantStyles[s.variant]
            const yearForValue = hoveredYear ?? lastYear
            const pt = pointAt(s, yearForValue)
            const v = pt?.value ?? null
            return (
              <li key={s.id} className="m-0 p-0">
                <button
                  type="button"
                  onClick={() => setFocusedId((prev) => (prev === s.id ? null : s.id))}
                  aria-pressed={isFocused}
                  style={{
                    backgroundColor: `color-mix(in srgb, ${colors.fillVar} ${dim ? 14 : isFocused ? 28 : 20}%, var(--color-surface))`,
                  }}
                  className={[
                    'inline-flex min-w-0 max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-opacity',
                    'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-surface)]',
                    'text-neutral-900',
                  ].join(' ')}
                >
                  <span
                    aria-hidden
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: colors.lineVar }}
                  />
                  <span className="flex min-w-0 max-w-full flex-col items-start gap-0.5">
                    <span className="min-w-0 truncate font-medium tabular-nums text-neutral-900">
                      {s.label}
                      {v != null ? (
                        <>
                          {' '}
                          {s.id === 'irpf' ? formatPct(v, 1) : formatSignedPctCompact(v, 1)}
                        </>
                      ) : null}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        {topRightControl != null ? <div className="shrink-0 sm:pt-0.5">{topRightControl}</div> : null}
      </div>

      <div
        className="w-full min-h-0 touch-none select-none overflow-visible"
        role="figure"
        aria-labelledby={labelledById}
      >
        <p id={labelledById} className="sr-only">
          Gráfico: {usableSeries.map((s) => s.label).join(', ')}. Valores en porcentaje respecto a {baselineYear}.
        </p>
        {yAxisLabel != null && yAxisLabel !== '' ? (
          <p className="m-0 mb-1 text-right text-xs font-medium text-neutral-600 [font-family:var(--font-sans)] sm:text-sm">
            {yAxisLabel}
          </p>
        ) : null}
        <div className="flex min-h-0 w-full flex-row-reverse gap-2 sm:gap-3">
          <div
            className="relative h-72 w-[3.75rem] shrink-0 text-left text-[10px] font-medium tabular-nums leading-none text-neutral-600 [font-family:var(--font-sans)] sm:h-96 sm:w-12 sm:text-[11px]"
            aria-hidden
          >
            {yTicks.map((v) => {
              const y = yForValue(v, mn, mx, pad)
              const pct = (y / VIEW.h) * 100
              return (
                <span
                  key={v}
                  className="absolute left-0 block whitespace-nowrap"
                  style={{ top: `${pct}%`, transform: 'translateY(-50%)' }}
                >
                  {yFormat(v)}
                </span>
              )
            })}
          </div>
          <div
            ref={plotRef}
            className="relative min-w-0 flex-1 select-none"
            onPointerEnter={(e) => onMove(e.clientX, e.clientY, e.currentTarget)}
            onPointerMove={(e) => onMove(e.clientX, e.clientY, e.currentTarget)}
            onPointerLeave={() => setHover(null)}
            onClick={(e) => {
              if (years.length === 0 || onYearClick == null) return
              const r = e.currentTarget.getBoundingClientRect()
              const xPx = e.clientX - r.left
              const x = r.width > 0 ? Math.min(1, Math.max(0, xPx / r.width)) : 0
              const idx =
                years.length === 1
                  ? 0
                  : Math.max(0, Math.min(years.length - 1, Math.round(x * (years.length - 1))))
              const y = years[idx]
              if (y != null) onYearClick(y)
            }}
          >
        <svg
          className="h-72 w-full sm:h-96"
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            {usableSeries.map((s) => {
              const colors = variantStyles[s.variant]
              return (
                <linearGradient key={s.id} id={`${gradId}-${s.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.fillVar} stopOpacity={0.26} />
                  <stop offset="100%" stopColor={colors.fillVar} stopOpacity={0.06} />
                </linearGradient>
              )
            })}
          </defs>

          {/* Cuadrícula horizontal cada 10 pp (sin el 0; el 0 se dibuja encima de las series). */}
          {yTicks.map((v) => {
            if (Math.abs(v) < 1e-9) return null
            const y = yForValue(v, mn, mx, pad)
            return (
              <line
                key={`grid-${v}`}
                x1={0}
                y1={y}
                x2={VIEW.w}
                y2={y}
                stroke="var(--color-neutral-300, rgb(192 188 183))"
                strokeWidth={0.2}
                strokeOpacity={0.45}
                vectorEffect="non-scaling-stroke"
                strokeDasharray="1.2 1.2"
              />
            )
          })}

          {/* Marcador vertical del año bajo el cursor (sutil). */}
          {hover && years.length > 1 ? (
            <line
              x1={(hover.index / (years.length - 1)) * 100}
              y1={0}
              x2={(hover.index / (years.length - 1)) * 100}
              y2={VIEW.h}
              stroke="var(--color-neutral-700, rgb(86 86 86))"
              strokeWidth={0.35}
              strokeOpacity={0.85}
              vectorEffect="non-scaling-stroke"
              strokeDasharray="2 1.5"
            />
          ) : null}

          {renderOrder.map((s) => {
            const layout = layoutBySeries.get(s.id) ?? []
            if (layout.length === 0) return null
            const colors = variantStyles[s.variant]
            const isFocused = focusedId === s.id
            const dim = focusedId != null && !isFocused
            const lineD = smoothPathLine(layout)
            const hp = hoveredYear ? layout.find((pt) => pt.year === hoveredYear) ?? null : null
            const opacity = dim ? 0.22 : 1
            const strokeW = isFocused ? 0.95 : focusedId != null ? 0.5 : 0.65
            return (
              <g key={s.id} opacity={opacity}>
                {!dim ? (
                  <path
                    d={`${lineD} L 100 ${VIEW.h} L 0 ${VIEW.h} Z`}
                    fill={`url(#${gradId}-${s.id})`}
                    opacity={isFocused ? 1 : 0.6}
                  />
                ) : null}
                <path
                  d={lineD}
                  fill="none"
                  stroke={colors.lineVar}
                  strokeWidth={strokeW}
                  vectorEffect="non-scaling-stroke"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {hp ? (
                  <ellipse
                    cx={hp.x}
                    cy={hp.y}
                    rx={isFocused ? 0.52 : 0.4}
                    ry={(isFocused ? 0.52 : 0.4) * markerRyFactor}
                    fill={colors.lineVar}
                    stroke={colors.lineVar}
                    strokeWidth={isFocused ? 0.18 : 0.14}
                    vectorEffect="non-scaling-stroke"
                    className="pointer-events-none"
                  />
                ) : null}
              </g>
            )
          })}

          {/* Línea de 0 encima del relleno para que se vea bien (discontinua, más marcada). */}
          {yAxisLo <= 0 && yAxisHi >= 0 ? (
            <line
              x1={0}
              y1={yForValue(0, mn, mx, pad)}
              x2={VIEW.w}
              y2={yForValue(0, mn, mx, pad)}
              stroke="var(--color-neutral-800, rgb(52 52 52))"
              strokeWidth={0.65}
              strokeOpacity={0.95}
              vectorEffect="non-scaling-stroke"
              strokeDasharray="4 3"
            />
          ) : null}
        </svg>

        {/* Eje X: etiquetas de año debajo del SVG. */}
        {baselineSeries != null ? (
          <div className="pointer-events-none mt-1 flex w-full min-w-0 justify-between text-[11px] font-medium tabular-nums text-neutral-500 [font-family:var(--font-sans)]">
            {xTicks.map((y) => (
              <span key={y} className="inline-flex items-center">
                <span
                  className={[
                    'inline-flex items-center rounded-full px-2 py-0.5 transition-colors',
                    y === selectedYear
                      ? 'bg-neutral-900 text-white'
                      : y === hoveredYear
                        ? 'bg-transparent text-neutral-900'
                        : 'bg-transparent text-neutral-500',
                  ].join(' ')}
                >
                  {y}
                </span>
              </span>
            ))}
          </div>
        ) : null}

            {/* Tooltip multi-serie (dentro del área del plot para coordenadas correctas). */}
            {hover && hoveredYear != null && tooltipStyle ? (
              <div
                className="pointer-events-none absolute z-10 w-max min-w-0 max-w-[24rem] rounded-xl bg-[color-mix(in_srgb,var(--color-neutral-50)_85%,var(--color-neutral-100))] px-3 py-2.5 text-left shadow-sm backdrop-blur-md [font-family:var(--font-sans)]"
                style={tooltipStyle}
              >
                <p className="m-0 text-base font-semibold leading-none tracking-[-0.02em] text-neutral-900">
                  {hoveredYear}
                </p>
                <p className="m-0 mt-1 text-[11px] leading-snug text-neutral-600">
                  Clic para fijar este año en los totales.
                </p>
                <ul className="m-0 mt-2 flex list-none flex-col gap-2 p-0">
                  {usableSeries.map((s) => {
                    const colors = variantStyles[s.variant]
                    const pt = pointAt(s, hoveredYear)
                    if (pt == null) return null
                    const v = pt.value
                    const yoy = pt.yoyPercent
                    const isFocused = focusedId === s.id
                    const dim = focusedId != null && !isFocused
                    return (
                      <li key={s.id} className="m-0 flex items-start gap-2 p-0">
                        <span
                          aria-hidden
                          className="mt-1 inline-block h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: colors.lineVar }}
                        />
                        <div className="min-w-0 flex-1">
                          <p
                            className={[
                              'm-0 text-sm leading-tight',
                              dim ? 'text-neutral-500' : 'text-neutral-700',
                            ].join(' ')}
                          >
                            {s.label}
                          </p>
                          <p
                            className={[
                              'm-0 mt-0.5 text-xs leading-snug tabular-nums',
                              isFocused
                                ? 'font-semibold text-neutral-900'
                                : dim
                                  ? 'text-neutral-500'
                                  : 'text-neutral-800',
                            ].join(' ')}
                          >
                            Valor en {hoveredYear}: {yFormat(v)}
                          </p>
                          {pt.deltaEurVsBaselineConstant != null &&
                          Number.isFinite(pt.deltaEurVsBaselineConstant) ? (
                            <p
                              className={[
                                'm-0 mt-1 text-[11px] leading-snug tabular-nums',
                                dim ? 'text-neutral-500' : 'text-neutral-600',
                              ].join(' ')}
                            >
                              Δ vs {baselineYear}: {formatEur(pt.deltaEurVsBaselineConstant, 0)} en € const.{' '}
                              {baselineYear}
                              {euroNominalRefYear != null &&
                              pt.deltaEurVsBaselineNominalRefYear != null &&
                              Number.isFinite(pt.deltaEurVsBaselineNominalRefYear) ? (
                                <>
                                  <span className="text-neutral-400"> · </span>
                                  ≈ {formatEur(pt.deltaEurVsBaselineNominalRefYear, 0)} nominales{' '}
                                  {euroNominalRefYear}
                                </>
                              ) : null}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
