import type { InflationComparisonRow, TaxYear } from './types'
import { TAX_YEARS } from './types'
import { precios2012HastaAnio, reexpressNominalEurAeurConstante } from './inflation'
import { computeNominaAgregada } from './computePayroll'
import { round2 } from './computePayroll'

/** Norma fija y moneda de la comparativa IPC (euros 2012: mismo poder adquisitivo nominal). */
export const INFLATION_COMPARISON_REF_YEAR: TaxYear = 2012

const REF_YEAR = INFLATION_COMPARISON_REF_YEAR

/**
 * Convierte un bruto nominal de un ejercicio a la magnitud fija de € constantes 2012
 * usada en toda la comparativa (misma cesta, distinta norma por año).
 */
export function brutoNominalAeur2012Comparables(brutoNominal: number, anio: TaxYear): number {
  const f = precios2012HastaAnio(anio)
  return brutoNominal / f
}

/**
 * Fila: salario nominal en el año reexpresado a € 2012 vs neto bajo la norma de 2012
 * con el mismo `salarioBrutoEur2012`.
 */
export function computeInflationComparisonRow(
  yearCompared: TaxYear,
  salarioBrutoEur2012: number,
): InflationComparisonRow {
  const f12y = precios2012HastaAnio(yearCompared)
  const brutoNom = salarioBrutoEur2012 * f12y
  const nomHist = computeNominaAgregada(brutoNom, yearCompared)

  const cLabAj = round2(nomHist.costeLaboral / f12y)
  const cEmpAj = round2(nomHist.cotEmpresa / f12y)
  const cTraAj = round2(nomHist.cotTrabajador / f12y)
  const irpfAj = round2(nomHist.irpfFinal / f12y)
  const netoAj = round2(nomHist.salarioNeto / f12y)

  const ref = computeNominaAgregada(salarioBrutoEur2012, REF_YEAR)
  const netoRef = ref.salarioNeto
  const dif = netoAj - netoRef

  return {
    yearCompared,
    salarioBrutoEur2012,
    multiplicadorIpc: Math.round(f12y * 10000) / 10000,
    ipcAcumuladoPercent: Math.round((f12y - 1) * 10000) / 100,
    salarioBrutoNominal: round2(brutoNom),
    costeLaboralEur2012: cLabAj,
    ssEmpEur2012: cEmpAj,
    ssTraEur2012: cTraAj,
    irpfEur2012: irpfAj,
    netoReexpresadoEur2012: netoAj,
    netoReferenciaNorma2012: round2(netoRef),
    variacionPoderAdquisitivoMensual: round2(dif / 12),
    perdidaGananciaAnualPoderAdq: round2(dif),
  }
}

export interface CompareGridOptions {
  /** Límites en € 2012 comparables. */
  grossMinEur2012?: number
  grossMaxEur2012?: number
  step?: number
}

export function computeInflationComparisonForYear(
  yearCompared: TaxYear,
  opts: CompareGridOptions = {},
): InflationComparisonRow[] {
  const grossMin = opts.grossMinEur2012 ?? 15000
  const grossMax = opts.grossMaxEur2012 ?? 100000
  const step = opts.step ?? 1000
  const rows: InflationComparisonRow[] = []
  for (let g = grossMin; g <= grossMax; g += step) {
    rows.push(computeInflationComparisonRow(yearCompared, g))
  }
  return rows
}

export function computeFullComparisonGrid(opts: CompareGridOptions = {}): InflationComparisonRow[] {
  const all: InflationComparisonRow[] = []
  for (const y of TAX_YEARS) {
    all.push(...computeInflationComparisonForYear(y, opts))
  }
  return all
}

/**
 * Neto nominal bajo `row.yearCompared`, reexpresado a € constantes del año de referencia
 * (p. ej. el año de la calculadora). Así el punto del último ejercicio coincide con el neto
 * de `computePayrollBreakdown` del mismo bruto y año, coherente con `docs/CALCULOS_FUENTE_DE_VERDAD.md`
 * ( serie “Evolución del neto” = misma cesta de moneda que el dato fijado arriba).
 */
export function netoReexpresadoAeurAñoElegido(
  row: InflationComparisonRow,
  anioConstante: TaxYear
): number {
  const nom = computeNominaAgregada(row.salarioBrutoNominal, row.yearCompared).salarioNeto
  return reexpressNominalEurAeurConstante(nom, row.yearCompared, anioConstante)
}
