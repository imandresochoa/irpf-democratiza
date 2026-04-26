import { useCallback, useMemo, useState, type CSSProperties } from 'react'
import type { TaxYear } from '../domain/tax'
import { formatPct } from '../lib/format'
import type { NetEvolutionPoint } from './NetEvolutionChart'

const VIEW = { w: 100, h: 44 }
const TOP_PAD = 0.08
const BOTTOM_PAD = 0.92

const barVariantStyles = {
  lavender: {
    fill: 'var(--color-chart-lavender-fill, rgb(150 130 180))',
    stroke: 'var(--color-chart-lavender-line, rgb(90 70 120))',
    tipBg: 'bg-[color-mix(in_srgb,var(--color-brand-lavender-soft)_45%,var(--color-surface))]',
  },
  mint: {
    fill: 'var(--color-chart-mint-fill, rgb(95 160 150))',
    stroke: 'var(--color-chart-mint-line, rgb(50 95 90))',
    tipBg: 'bg-[color-mix(in_srgb,var(--color-brand-mint-soft)_50%,var(--color-surface))]',
  },
} as const

function valueToY(
  v: number,
  minV: number,
  maxV: number,
): number {
  const range = maxV - minV
  if (range <= 0) return (TOP_PAD + BOTTOM_PAD) * 0.5 * VIEW.h
  const t = (v - minV) / range
  return BOTTOM_PAD * VIEW.h - t * (BOTTOM_PAD - TOP_PAD) * VIEW.h
}

type CompareBarChartProps = {
  points: NetEvolutionPoint[] | null
  className?: string
  variant: 'lavender' | 'mint'
  formatY?: (n: number) => string
  tooltipSubtitle?: string
  /** Muestra variación % respecto al primer año (solo sentido con serie homogénea, p. ej. IRPF en €). */
  showDeltaVsFirst?: boolean
}

/**
 * Barras verticales por ejercicio; interactiva (hover + tooltip) con colores alineados a la home.
 */
export function CompareBarChart({
  points,
  className,
  variant,
  formatY = (n) => String(n),
  tooltipSubtitle,
  showDeltaVsFirst = false,
}: CompareBarChartProps) {
  const colors = barVariantStyles[variant]
  const [hover, setHover] = useState<{
    index: number
    xPx: number
    yPx: number
    boxW: number
    boxH: number
  } | null>(null)

  const { layout, zeroY } = useMemo(() => {
    if (!points || points.length === 0) {
      return { layout: [] as { x: number; w: number; y0: number; y1: number; year: TaxYear; v: number }[], zeroY: null as number | null }
    }
    const vals = points.map((p) => p.net)
    const rawMin = Math.min(...vals)
    const rawMax = Math.max(...vals)
    const spread = rawMax - rawMin
    const pad = spread > 0 ? spread * 0.12 : Math.max(1, Math.abs(rawMin) * 0.1, Math.abs(rawMax) * 0.1)
    let minV0 = rawMin
    let maxV0 = rawMax
    if (rawMin < 0 && rawMax > 0) {
      minV0 = rawMin - pad
      maxV0 = rawMax + pad
    } else if (rawMin >= 0) {
      minV0 = 0
      maxV0 = rawMax + pad
    } else {
      minV0 = rawMin - pad
      maxV0 = 0
    }
    if (minV0 === maxV0) {
      minV0 -= 1
      maxV0 += 1
    }
    const zY =
      minV0 < 0 && maxV0 > 0
        ? valueToY(0, minV0, maxV0)
        : null
    const n = points.length
    const slot = VIEW.w / n
    const barW = slot * 0.62
    const layout = points.map((p, i) => {
      const cx = (i + 0.5) * slot
      const x = cx - barW / 2
      const yPos = valueToY(p.net, minV0, maxV0)
      const yBase = zY !== null ? zY : valueToY(0, minV0, maxV0)
      const y0 = Math.min(yBase, yPos)
      const y1 = Math.max(yBase, yPos)
      return { x, w: barW, y0, y1, year: p.year, v: p.net }
    })
    return { layout, zeroY: zY }
  }, [points])

  const onMove = useCallback(
    (clientX: number, currentTarget: HTMLDivElement) => {
      if (!points || points.length < 1) return
      const r = currentTarget.getBoundingClientRect()
      const xPx = clientX - r.left
      const t = r.width > 0 ? xPx / r.width : 0
      const n = points.length
      const idx = Math.max(0, Math.min(n - 1, Math.floor(t * n)))
      setHover({ index: idx, xPx, yPx: 0, boxW: r.width, boxH: r.height })
    },
    [points],
  )

  const hp =
    points && hover && layout[hover.index] ? { ...layout[hover.index], i: hover.index } : null
  const firstVal = points && points.length > 0 ? points[0]!.net : null

  const deltaPct =
    hp && firstVal !== null && firstVal !== 0 && showDeltaVsFirst
      ? ((hp.v - firstVal) / firstVal) * 100
      : null

  const tooltipStyle = useMemo((): CSSProperties | null => {
    if (!hover) return null
    const { xPx, boxW, boxH } = hover
    const approxW = 200
    const left = Math.min(Math.max(6, xPx + 6), Math.max(6, boxW - approxW - 6))
    const top = Math.max(4, 8)
    return { left, top, transform: 'translate(0, 0)' }
  }, [hover])

  if (!points || points.length === 0) {
    return (
      <div
        className={[
          'flex h-44 w-full min-h-0 items-center justify-center text-base text-neutral-800 [font-family:var(--font-serif)]',
          className ?? '',
        ].join(' ')}
      >
        Añade un bruto anual
      </div>
    )
  }

  return (
    <div
      className={['relative h-44 w-full min-h-0 touch-none select-none overflow-visible', className ?? ''].join(
        ' ',
      )}
      onPointerEnter={(e) => onMove(e.clientX, e.currentTarget)}
      onPointerMove={(e) => onMove(e.clientX, e.currentTarget)}
      onPointerLeave={() => setHover(null)}
    >
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        {zeroY !== null ? (
          <line
            x1={0}
            y1={zeroY}
            x2={VIEW.w}
            y2={zeroY}
            stroke="var(--color-neutral-400, rgb(148 146 142))"
            strokeWidth={0.25}
            strokeOpacity={0.75}
            vectorEffect="non-scaling-stroke"
            strokeDasharray="1.2 0.8"
          />
        ) : null}
        {layout.map((b, i) => (
          <rect
            key={b.year}
            x={b.x}
            y={b.y0}
            width={b.w}
            height={Math.max(0.2, b.y1 - b.y0)}
            fill={colors.fill}
            fillOpacity={hover === null || hover.index === i ? 0.92 : 0.38}
            stroke={colors.stroke}
            strokeWidth={0.2}
            vectorEffect="non-scaling-stroke"
            rx={0.35}
            ry={0.35}
            className="transition-[fill-opacity] duration-150"
          />
        ))}
      </svg>
      {hp && hover && tooltipStyle ? (
        <div
          className={[
            'pointer-events-none absolute z-10 w-max min-w-0 max-w-[16rem] rounded-xl px-3 py-2.5 text-left text-xs shadow-sm backdrop-blur-sm [font-family:var(--font-serif)] sm:text-sm',
            colors.tipBg,
          ].join(' ')}
          style={tooltipStyle}
        >
          <p className="m-0 text-base text-neutral-800">{hp.year}</p>
          <p className="m-0 mt-0.5 text-xl font-semibold leading-tight tracking-[-0.03em] text-neutral-900 sm:text-2xl">
            {formatY(hp.v)}
          </p>
          {tooltipSubtitle ? (
            <p className="m-0 mt-1.5 text-xs leading-snug text-neutral-600 sm:text-sm">{tooltipSubtitle}</p>
          ) : null}
          {showDeltaVsFirst && deltaPct !== null && Number.isFinite(deltaPct) && points[0] ? (
            <p className="m-0 mt-1.5 text-xs leading-snug text-neutral-600 sm:text-sm">
              <span className="text-neutral-500">vs {points[0].year}</span>{' '}
              <span className="font-medium text-neutral-800">
                {deltaPct > 0 ? '+' : ''}
                {formatPct(deltaPct, 1)}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
