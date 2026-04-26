import { useCallback, useId, useMemo, useState, type CSSProperties, type PointerEvent } from 'react'
import type { TaxYear } from '../domain/tax'
import { comparisonLegendMainCopy, kComparisonTooltipShellClass } from '../lib/comparisonLegendCopy'
import { formatEur } from '../lib/format'

type ComparisonHeadlineValueProps = {
  className: string
  /** Cifra mostrada (diferencia frente a 2012 en la métrica de la columna). */
  displayEur: number
  kind: 'poder' | 'irpf'
  year: TaxYear
  refYear: TaxYear
  /** Misma magnitud que el texto: delta respecto a 2012 (año de la calculadora). */
  delta: number
  /** Neto en la unidad de la leyenda inferior (p. ej. nominal o reexpresado al año de la calculadora). */
  netoDisplayEur: number
  /** Año que se muestra en la leyenda del neto (p. ej. año de la calculadora). */
  netoCaptionYear: TaxYear
  /** Texto entre paréntesis en la frase principal (pasa a `comparisonLegendMainCopy`). */
  legendAmountContext?: string
}

/**
 * Cifra del título (resumen comparativo) con leyenda al pasar el cursor.
 */
export function ComparisonHeadlineValue({
  className,
  displayEur,
  kind,
  year,
  refYear,
  delta,
  netoDisplayEur,
  netoCaptionYear,
  legendAmountContext,
}: ComparisonHeadlineValueProps) {
  const tipId = useId()
  const [pt, setPt] = useState<{ x: number; y: number } | null>(null)

  const onEnter = useCallback((e: PointerEvent) => {
    setPt({ x: e.clientX, y: e.clientY })
  }, [])
  const onMove = useCallback((e: PointerEvent) => {
    setPt((p) => (p ? { x: e.clientX, y: e.clientY } : null))
  }, [])
  const onLeave = useCallback(() => setPt(null), [])

  const tipStyle = useMemo((): CSSProperties | null => {
    if (!pt) return null
    const gap = 8
    const maxW = 256
    const x = Math.min(pt.x + gap, (typeof window !== 'undefined' ? window.innerWidth : 1200) - maxW - 8)
    const y = Math.min(
      pt.y + gap,
      (typeof window !== 'undefined' ? window.innerHeight : 800) - 120,
    )
    return { left: Math.max(8, x), top: Math.max(8, y) }
  }, [pt])

  return (
    <span className="relative inline min-w-0 [font-family:var(--font-sans)]">
      <span
        className={className + ' block cursor-default'}
        role="text"
        aria-describedby={pt != null ? tipId : undefined}
        onPointerEnter={onEnter}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
      >
        {formatEur(displayEur, 0)}
      </span>
      {pt != null && tipStyle ? (
        <div
          id={tipId}
          className={kComparisonTooltipShellClass}
          style={tipStyle}
          role="tooltip"
        >
          <p className="m-0 text-sm text-neutral-500">Ejercicio {year}</p>
          <p className="m-0 mt-1.5 text-sm font-medium leading-snug text-neutral-900">
            {comparisonLegendMainCopy(kind, year, refYear, delta, legendAmountContext)}
          </p>
          <p className="m-0 mt-2 border-t border-neutral-200/60 pt-2 text-sm leading-snug text-neutral-600">
            Neto (€ {netoCaptionYear}):{' '}
            <span className="font-medium text-neutral-800">{formatEur(netoDisplayEur, 0)}</span>
          </p>
        </div>
      ) : null}
    </span>
  )
}
