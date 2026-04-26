import { useCallback, useId, useMemo, useState, type CSSProperties } from 'react'
import type { TaxYear } from '../domain/tax'
import { formatEur, formatEurNumber, formatPct } from '../lib/format'

const VIEW = { w: 100, h: 44 }

export type NetEvolutionPoint = { year: TaxYear; net: number }

function yForValue(net: number, min: number, max: number, pad: number): number {
  const range = max - min
  if (range <= 0) return VIEW.h / 2
  const lo = min - range * pad
  const hi = max + range * pad
  const t = (net - lo) / (hi - lo)
  const topY = 0.08 * VIEW.h
  const bottomY = 0.92 * VIEW.h
  return bottomY - t * (bottomY - topY)
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

function areaPathFromLine(lineD: string): string {
  if (!lineD) return ''
  const m = /^M\s*([\d.]+)\s*([\d.]+)\s*/.exec(lineD)
  if (!m) return ''
  const rest = lineD.slice(m[0].length)
  return `M 0 ${VIEW.h} L ${m[1]} ${m[2]} ${rest} L 100 ${VIEW.h} Z`
}

type NetEvolutionChartProps = {
  points: NetEvolutionPoint[] | null
  className?: string
  /** Colores del trazo (verde por defecto; otras para más series en home). */
  variant?: 'green' | 'terracotta' | 'lavender' | 'mint' | 'blue' | 'pink' | 'peach'
  /**
   * Sustituye el fondo del tooltip (por defecto se deriva de `variant`). Úsalo cuando el trazo
   * coincida con un `variant` distinto del fondo de la tarjeta (p. ej. tono rosa en la gráfica
   * y `--color-brand-blue-soft` en el contenedor).
   */
  tooltipBgClassName?: string
  /** Muestra la línea de comparación con el primer año (tooltip). */
  showDeltaInTooltip?: boolean
  /** Subtítulo bajo el valor principal en el tooltip. */
  tooltipSubtitle?: string
  /**
   * Dibuja una línea horizontal en el valor 0 (útil con cantidades con signo, p. ej. poder
   * adquisitivo vs norma de referencia).
   */
  showZeroLine?: boolean
  /** Valor mostrado en el tooltip. Por defecto, neto en €. */
  formatY?: (n: number) => string
  /**
   * Cómo mostrar el delta frente al primer año: retención relativa sobre el neto (comportamiento
   * original) o puntos de porcentaje (p. p.) para series ya en %.
   */
  deltaMode?: 'retention' | 'percentagePoints'
}

const variantStyles = {
  green: {
    fillVar: 'var(--color-chart-green-fill, rgb(98 150 120))',
    lineVar: 'var(--color-chart-green-line, rgb(60 100 70))',
    tipBg: 'bg-[color-mix(in_srgb,var(--color-brand-green-soft)_35%,var(--color-surface))]',
  },
  terracotta: {
    fillVar: 'var(--color-chart-terracotta-fill, rgb(188 115 95))',
    lineVar: 'var(--color-chart-terracotta-line, rgb(120 64 52))',
    tipBg: 'bg-[color-mix(in_srgb,var(--color-brand-terracotta-soft)_50%,var(--color-surface))]',
  },
  lavender: {
    fillVar: 'var(--color-chart-lavender-fill, rgb(150 130 180))',
    lineVar: 'var(--color-chart-lavender-line, rgb(90 70 120))',
    tipBg: 'bg-[color-mix(in_srgb,var(--color-brand-lavender-soft)_45%,var(--color-surface))]',
  },
  mint: {
    fillVar: 'var(--color-chart-mint-fill, rgb(95 160 150))',
    lineVar: 'var(--color-chart-mint-line, rgb(50 95 90))',
    tipBg: 'bg-[color-mix(in_srgb,var(--color-brand-mint-soft)_50%,var(--color-surface))]',
  },
  blue: {
    fillVar: 'var(--color-chart-blue-fill, rgb(110 150 200))',
    lineVar: 'var(--color-chart-blue-line, rgb(50 80 120))',
    tipBg: 'bg-[color-mix(in_srgb,var(--color-brand-blue-soft)_50%,var(--color-surface))]',
  },
  pink: {
    fillVar: 'var(--color-chart-pink-fill, rgb(200 120 150))',
    lineVar: 'var(--color-chart-pink-line, rgb(110 55 75))',
    tipBg: 'bg-[color-mix(in_srgb,var(--color-brand-pink-soft)_50%,var(--color-surface))]',
  },
  peach: {
    fillVar: 'var(--color-chart-peach-fill, rgb(200 130 100))',
    lineVar: 'var(--color-chart-peach-line, rgb(120 70 50))',
    tipBg: 'bg-[color-mix(in_srgb,var(--color-brand-peach-soft)_50%,var(--color-surface))]',
  },
} as const

/**
 * Línea + área al ras del contenedor (viewBox estirada). Leyenda al pasar el cursor.
 */
export function NetEvolutionChart({
  points,
  className,
  variant = 'green',
  formatY = (n) => formatEur(n, 0),
  deltaMode = 'retention',
  showDeltaInTooltip = true,
  tooltipBgClassName,
  tooltipSubtitle,
  showZeroLine = false,
}: NetEvolutionChartProps) {
  const gradId = useId()
  const colors = variantStyles[variant]
  const tipBg = tooltipBgClassName ?? colors.tipBg
  const [hover, setHover] = useState<{
    index: number
    xPx: number
    yPx: number
    boxW: number
    boxH: number
  } | null>(null)

  const { lineD, areaD, layout, zeroY } = useMemo(() => {
    if (!points || points.length === 0) {
      return {
        lineD: '',
        areaD: '',
        zeroY: null as number | null,
        layout: [] as { x: number; y: number; year: TaxYear; net: number }[],
      }
    }
    const nets = points.map((p) => p.net)
    const minN = Math.min(...nets)
    const maxN = Math.max(...nets)
    const padN = 0.1
    const n = points.length
    const zy =
      showZeroLine && minN < 0 && maxN > 0
        ? yForValue(0, minN, maxN, padN)
        : null
    const layout = points.map((p, i) => {
      const x = n === 1 ? 50 : (i / (n - 1)) * 100
      return {
        x,
        y: yForValue(p.net, minN, maxN, padN),
        year: p.year,
        net: p.net,
      }
    })
    if (n === 1) {
      const p = layout[0]
      const lineD0 = `M ${p.x} ${p.y}`
      const areaD0 = `M 0 ${VIEW.h} L ${p.x} ${p.y} L 100 ${VIEW.h} Z`
      return { lineD: lineD0, areaD: areaD0, zeroY: zy, layout }
    }
    const lineD0 = smoothPathLine(layout)
    return { lineD: lineD0, areaD: areaPathFromLine(lineD0), zeroY: zy, layout }
  }, [points, showZeroLine])

  const onMove = useCallback(
    (clientX: number, clientY: number, currentTarget: HTMLDivElement) => {
      if (!points || points.length < 1) return
      const r = currentTarget.getBoundingClientRect()
      const xPx = clientX - r.left
      const yPx = clientY - r.top
      const x = xPx / r.width
      const idx =
        points.length === 1
          ? 0
          : Math.max(0, Math.min(points.length - 1, Math.round(x * (points.length - 1))))
      setHover({ index: idx, xPx, yPx, boxW: r.width, boxH: r.height })
    },
    [points],
  )

  const hasPoints = Boolean(points && points.length > 0)
  const hp =
    hasPoints && hover && layout[hover.index] ? layout[hover.index] : null
  const firstPoint = hasPoints && points ? points[0]! : null
  const pctVsFirst =
    hp && firstPoint
      ? deltaMode === 'percentagePoints'
        ? hp.net - firstPoint.net
        : firstPoint.net !== 0
          ? ((hp.net - firstPoint.net) / firstPoint.net) * 100
          : null
      : null

  const tooltipStyle = useMemo((): CSSProperties | null => {
    if (!hover) return null
    const offsetX = 4
    const gap = 6
    const approxW = 200
    const { xPx, yPx, boxW, boxH } = hover
    const left = Math.min(Math.max(6, xPx + offsetX), Math.max(6, boxW - approxW - 6))
    // Cerca del cursor; si arriba no hay sitio, el tip va debajo
    const preferAbove = yPx > 40
    const top = preferAbove
      ? Math.min(Math.max(4, yPx), boxH - 2)
      : Math.min(yPx + gap, boxH - 8)
    const transform: CSSProperties['transform'] = preferAbove
      ? `translate(0, calc(-100% - ${gap}px))`
      : 'translate(0, 0)'
    return { left, top, transform }
  }, [hover])

  if (!hasPoints) {
    return (
      <div
        className={[
          'flex h-36 w-full min-h-0 items-center justify-center text-base text-neutral-800 [font-family:var(--font-serif)]',
          className ?? '',
        ].join(' ')}
      >
        Añade un bruto anual
      </div>
    )
  }

  return (
    <div
      className={['relative h-36 w-full min-h-0 touch-none select-none overflow-visible', className ?? ''].join(' ')}
      onPointerEnter={(e) => onMove(e.clientX, e.clientY, e.currentTarget)}
      onPointerMove={(e) => onMove(e.clientX, e.clientY, e.currentTarget)}
      onPointerLeave={() => setHover(null)}
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.fillVar} stopOpacity={0.28} />
            <stop offset="100%" stopColor={colors.fillVar} stopOpacity={0.04} />
          </linearGradient>
        </defs>
        {areaD ? <path d={areaD} fill={`url(#${gradId})`} /> : null}
        {zeroY !== null ? (
          <line
            x1={0}
            y1={zeroY}
            x2={VIEW.w}
            y2={zeroY}
            stroke="var(--color-neutral-400, rgb(148 146 142))"
            strokeWidth={0.25}
            strokeOpacity={0.7}
            vectorEffect="non-scaling-stroke"
            strokeDasharray="1.2 0.8"
          />
        ) : null}
        {lineD ? (
          <path
            d={lineD}
            fill="none"
            stroke={colors.lineVar}
            strokeWidth={0.55}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ) : null}
        {hp ? (
          <circle
            cx={hp.x}
            cy={hp.y}
            r={0.75}
            fill="var(--color-surface, rgb(255 255 255))"
            stroke={colors.lineVar}
            strokeWidth={0.32}
            vectorEffect="non-scaling-stroke"
            className="pointer-events-none"
          />
        ) : null}
      </svg>
      {hp && hover && tooltipStyle ? (
        <div
          className={[
            'pointer-events-none absolute z-10 w-max min-w-0 max-w-[16rem] rounded-xl px-3 py-2.5 text-left shadow-sm backdrop-blur-md [font-family:var(--font-serif)]',
            tipBg,
          ].join(' ')}
          style={tooltipStyle}
        >
          <p className="m-0 text-base text-neutral-800">{hp.year}</p>
          <p className="m-0 mt-0.5 text-2xl font-semibold leading-none tracking-[-0.03em] text-neutral-900">
            {formatY(hp.net)}
          </p>
          {tooltipSubtitle ? (
            <p className="m-0 mt-1.5 text-sm leading-snug text-neutral-600">{tooltipSubtitle}</p>
          ) : null}
          {showDeltaInTooltip &&
          firstPoint &&
          pctVsFirst !== null &&
          Number.isFinite(pctVsFirst) &&
          (deltaMode === 'percentagePoints' || firstPoint.net !== 0) ? (
            <p className="m-0 mt-1.5 text-sm leading-snug text-neutral-600">
              <span className="text-neutral-500">Acum. vs {firstPoint.year}</span>{' '}
              <span className="font-medium text-neutral-800">
                {deltaMode === 'percentagePoints' ? (
                  <>
                    {pctVsFirst > 0 ? '+' : ''}
                    {formatEurNumber(pctVsFirst, 1)} p. p.
                  </>
                ) : (
                  <>
                    {pctVsFirst > 0 ? '+' : ''}
                    {formatPct(pctVsFirst, 1)}
                  </>
                )}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
