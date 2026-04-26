import type { TaxYear } from './types'

/** IPC variación anual diciembre a diciembre (desde 2013; 2012 es año base sin factor propio) */
export const IPC_ANUAL_DIC: Readonly<Record<number, number>> = {
  2013: 0.003,
  2014: -0.01,
  2015: 0.0,
  2016: 0.016,
  2017: 0.011,
  2018: 0.012,
  2019: 0.008,
  2020: -0.005,
  2021: 0.065,
  2022: 0.057,
  2023: 0.031,
  2024: 0.028,
  2025: 0.029,
  2026: 0.03,
}

/**
 * Factor acumulado de inflación desde anioBase hasta anioDestino (producto de 1+IPC).
 * Si base === destino, 1.
 */
export function getAccumulatedInflation(anioBase: number, anioDestino: number): number {
  if (anioBase === anioDestino) return 1.0
  let multiplicador = 1.0
  for (let anio = anioBase + 1; anio <= anioDestino; anio++) {
    const ipc = IPC_ANUAL_DIC[anio]
    if (ipc === undefined) {
      throw new Error(`IPC no definido para el año ${anio}`)
    }
    multiplicador *= 1 + ipc
  }
  return multiplicador
}

const _cacheTo2026: Partial<Record<TaxYear, number>> = {}

/** Factor IPC acumulado desde `year` hasta 2026 (cache perezosa) */
export function inflationFactorTo2026(year: TaxYear): number {
  if (_cacheTo2026[year] !== undefined) return _cacheTo2026[year]!
  const v = getAccumulatedInflation(year, 2026)
  _cacheTo2026[year] = v
  return v
}

const _cache2012aAnio: Partial<Record<TaxYear, number>> = {}

/**
 * Nivel de precios relativo: P_año / P_2012 (producto 1+IPC de 2013 al año). Para pasar
 * un importe nominal del año a € constantes 2012: `nominal / precios2012HastaAnio(año)`.
 */
export function precios2012HastaAnio(year: TaxYear): number {
  if (_cache2012aAnio[year] !== undefined) return _cache2012aAnio[year]!
  const v = getAccumulatedInflation(2012, year)
  _cache2012aAnio[year] = v
  return v
}

/**
 * Pasa un importe nominal (€ del `anioOrigen`) a € constantes de `anioConstante` (misma cesta, IPC
 * encadenado diciembre–diciembre). Alinea gráficos con el año de la calculadora, sin tocar el bruto
 * nominal de nómina.
 */
export function reexpressNominalEurAeurConstante(
  importeNominal: number,
  anioOrigen: TaxYear,
  anioConstante: TaxYear
): number {
  if (anioOrigen === anioConstante) {
    return Math.round(importeNominal * 100) / 100
  }
  if (anioOrigen < anioConstante) {
    return Math.round(importeNominal * getAccumulatedInflation(anioOrigen, anioConstante) * 100) / 100
  }
  return Math.round((importeNominal / getAccumulatedInflation(anioConstante, anioOrigen)) * 100) / 100
}
