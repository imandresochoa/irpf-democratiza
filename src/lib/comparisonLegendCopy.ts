import type { TaxYear } from '../domain/tax'
import { formatEur } from './format'

/** Caja: misma apariencia que la leyenda al hover (mismo tono base que `bg-neutral-100` de la calculadora/tablas). */
export const kComparisonTooltipShellClass =
  'pointer-events-none fixed z-50 w-max min-w-0 max-w-[20rem] rounded-xl border border-neutral-200/50 px-3 py-2.5 text-left text-sm shadow-sm backdrop-blur-md [font-family:var(--font-serif)] bg-[color-mix(in_srgb,var(--color-neutral-100)_88%,var(--color-surface))]'

/**
 * Frase principal (poder adquisitivo o IRPF) para un delta en € respecto a `refYear` (p. ej. 2012).
 */
export function comparisonLegendMainCopy(
  kind: 'poder' | 'irpf',
  year: TaxYear,
  refYear: TaxYear,
  deltaEur: number,
): string {
  const y = String(refYear)
  if (Math.abs(deltaEur) < 0.5) {
    if (kind === 'poder') {
      return `En ${year}, con el mismo bruto, el poder adquisitivo anual (€ comparables) es el mismo que en ${y}.`
    }
    return `En ${year}, el IRPF anual retenido (€ comparables) es el mismo que en ${y}.`
  }
  const abs = formatEur(Math.abs(deltaEur), 0)
  if (kind === 'poder') {
    if (deltaEur < 0) {
      return `En ${year} has perdido ${abs} de poder adquisitivo al año con respecto a ${y}.`
    }
    return `En ${year} has ganado ${abs} de poder adquisitivo al año con respecto a ${y}.`
  }
  if (deltaEur > 0) {
    return `En ${year} pagas ${abs} más al año de IRPF con respecto a ${y} (€ comparables).`
  }
  return `En ${year} pagas ${abs} menos al año de IRPF con respecto a ${y} (€ comparables).`
}
