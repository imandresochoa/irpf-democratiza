import type { InflationComparisonRow, TaxYear } from './types'
import { TAX_YEARS } from './types'
import { inflationFactorTo2026 } from './inflation'
import { computeNominaAgregada } from './computePayroll'
import { round2 } from './computePayroll'

/** Año de norma de referencia para `perdidaGananciaAnualPoderAdq` y `netoReal2026` en la comparativa IPC. */
export const INFLATION_COMPARISON_REF_YEAR: TaxYear = 2026

const REF_YEAR = INFLATION_COMPARISON_REF_YEAR

/**
 * Una fila de comparativa: salario nominal del año histórico reexpresado en euros de 2026
 * vs el neto que daría el mismo bruto nominal en 2026.
 */
export function computeInflationComparisonRow(
  yearCompared: TaxYear,
  salarioEquivalente2026: number,
): InflationComparisonRow {
  const inf = inflationFactorTo2026(yearCompared)
  const brutoNom = salarioEquivalente2026 / inf
  const nomHist = computeNominaAgregada(brutoNom, yearCompared)

  const cLabAj = round2(nomHist.costeLaboral * inf)
  const cEmpAj = round2(nomHist.cotEmpresa * inf)
  const cTraAj = round2(nomHist.cotTrabajador * inf)
  const irpfAj = round2(nomHist.irpfFinal * inf)
  const netoAj = round2(nomHist.salarioNeto * inf)

  const ref = computeNominaAgregada(salarioEquivalente2026, REF_YEAR)
  const neto2026Real = ref.salarioNeto
  const dif = netoAj - neto2026Real

  return {
    yearCompared,
    salarioEquivalente2026,
    multiplicadorIpc: Math.round(inf * 10000) / 10000,
    ipcAcumuladoPercent: Math.round((inf - 1) * 10000) / 100,
    salarioBrutoNominal: round2(brutoNom),
    costeLaboralEur2026: cLabAj,
    ssEmpEur2026: cEmpAj,
    ssTraEur2026: cTraAj,
    irpfEur2026: irpfAj,
    netoRealEnSuAnoEur2026: netoAj,
    netoReal2026: round2(neto2026Real),
    variacionPoderAdquisitivoMensual: round2(dif / 12),
    perdidaGananciaAnualPoderAdq: round2(dif),
  }
}

export interface CompareGridOptions {
  grossMin2026?: number
  grossMax2026?: number
  step?: number
}

/** Genera filas bajo demanda (mismo espíritu que generar_comparativa_inflacion) */
export function computeInflationComparisonForYear(
  yearCompared: TaxYear,
  opts: CompareGridOptions = {},
): InflationComparisonRow[] {
  const grossMin = opts.grossMin2026 ?? 15000
  const grossMax = opts.grossMax2026 ?? 100000
  const step = opts.step ?? 1000
  const rows: InflationComparisonRow[] = []
  for (let g = grossMin; g <= grossMax; g += step) {
    rows.push(computeInflationComparisonRow(yearCompared, g))
  }
  return rows
}

/** Tabla completa año × salarios (solo usar con rangos acotados en UI) */
export function computeFullComparisonGrid(opts: CompareGridOptions = {}): InflationComparisonRow[] {
  const all: InflationComparisonRow[] = []
  for (const y of TAX_YEARS) {
    all.push(...computeInflationComparisonForYear(y, opts))
  }
  return all
}
