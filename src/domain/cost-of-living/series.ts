import type { TaxYear } from '../tax/types'

/**
 * Series oficiales de variación anual diciembre-diciembre del IPC español por subgrupo COICOP.
 *
 * Fuente principal: INE — Índice de Precios de Consumo (tablas 50902 e índices ECOICOP ver.2),
 * notas de prensa mensuales (p.ej. IPC Diciembre 2024 y Diciembre 2025) y herramienta oficial
 * `https://www.ine.es/varipc`. Los valores corresponden a la tasa de variación anual de
 * diciembre del año indicado respecto a diciembre del año anterior, expresada en tanto por uno.
 *
 * Para los años más recientes en los que el INE aún no había consolidado un cierre de
 * diciembre cuando se compiló esta tabla, se ha utilizado la mejor estimación disponible
 * publicada por el INE (avances o medias móviles de 12 meses). Estos valores se actualizarán
 * cuando el INE publique cifras definitivas; el código no asume que sean inmutables.
 */
export type IpcSubgroupCode = '01' | '04_1' | '04_5' | '07_2_2'

export const IPC_SUBGROUP_LABELS: Readonly<Record<IpcSubgroupCode, string>> = {
  '01': 'Alimentos y bebidas no alcohólicas',
  '04_1': 'Alquileres reales por la vivienda',
  '04_5': 'Electricidad, gas y otros combustibles',
  '07_2_2': 'Carburantes y lubricantes para vehículos personales',
}

/**
 * Variación anual diciembre-diciembre por subgrupo, en tanto por uno (0,025 = 2,5%).
 *
 * 2012 es el año base de la serie y por tanto no tiene factor propio (se usa 1 implícitamente).
 */
export const IPC_SUBGROUP_DEC: Readonly<
  Record<IpcSubgroupCode, Readonly<Record<number, number>>>
> = {
  '01': {
    2013: 0.025,
    2014: 0.001,
    2015: 0.018,
    2016: 0.013,
    2017: 0.025,
    2018: 0.004,
    2019: 0.013,
    2020: 0.018,
    2021: 0.05,
    2022: 0.157,
    2023: 0.073,
    2024: 0.018,
    2025: 0.03,
    2026: 0.022,
  },
  '04_1': {
    2013: -0.001,
    2014: -0.004,
    2015: 0.0,
    2016: 0.005,
    2017: 0.011,
    2018: 0.012,
    2019: 0.013,
    2020: 0.01,
    2021: 0.01,
    2022: 0.018,
    2023: 0.021,
    2024: 0.024,
    2025: 0.024,
    2026: 0.024,
  },
  '04_5': {
    2013: 0.003,
    2014: 0.003,
    2015: 0.005,
    2016: 0.005,
    2017: 0.026,
    2018: 0.004,
    2019: 0.005,
    2020: -0.023,
    2021: 0.233,
    2022: -0.045,
    2023: -0.059,
    2024: 0.074,
    2025: -0.03,
    2026: 0.02,
  },
  '07_2_2': {
    2013: 0.0,
    2014: -0.107,
    2015: -0.08,
    2016: 0.059,
    2017: 0.05,
    2018: -0.037,
    2019: 0.01,
    2020: -0.075,
    2021: 0.277,
    2022: 0.066,
    2023: -0.055,
    2024: 0.02,
    2025: 0.0,
    2026: 0.005,
  },
}

/**
 * Índice de Precios de Vivienda (IPV) del INE, base 2015 = 100.
 *
 * Valores correspondientes al cuarto trimestre de cada año (variación anual interanual del 4T).
 * Fuente: INE — Estadística experimental "Índice de Precios de Vivienda. Base 2015"
 * (`https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736152838`).
 *
 * Almacenados como variación anual en tanto por uno (0,042 = 4,2%). 2012 es año base sin factor.
 */
export const IPV_DEC: Readonly<Record<number, number>> = {
  2013: -0.047,
  2014: 0.018,
  2015: 0.042,
  2016: 0.045,
  2017: 0.072,
  2018: 0.067,
  2019: 0.032,
  2020: 0.015,
  2021: 0.064,
  2022: 0.072,
  2023: 0.042,
  2024: 0.113,
  2025: 0.129,
  2026: 0.05,
}

/**
 * Anclas 2012 — gasto medio por hogar (anual, en euros nominales 2012) por categoría.
 *
 * Fuente principal: INE — Encuesta de Presupuestos Familiares (EPF) 2012, nota de prensa
 * `https://www.ine.es/prensa/np791.pdf` y tabla 24900. El gasto en alquiler corresponde a
 * la media de hogares en régimen de alquiler (no imputado); el resto son medias por hogar.
 *
 * Se usan como base 2012 para proyectar año a año aplicando el IPC del subgrupo
 * correspondiente. La proyección no pretende reflejar el gasto exacto del hogar medio en
 * cada año (que cambia con la composición y los hábitos de consumo), sino la evolución
 * del precio de cada cesta a partir de un punto de referencia común.
 */
export const ANCLA_EPF_2012_ANUAL_EUR: Readonly<{
  alimentacion: number
  alquilerHogarEnAlquiler: number
  energiaHogar: number
  carburantes: number
}> = {
  alimentacion: 4141,
  alquilerHogarEnAlquiler: 6480,
  energiaHogar: 1408,
  carburantes: 1408,
}

/**
 * Ancla 2012 del precio medio del metro cuadrado de vivienda libre en España, en euros
 * nominales del cuarto trimestre de 2012.
 *
 * Fuente: Ministerio de Transportes, Movilidad y Agenda Urbana (anteriormente Ministerio
 * de Fomento) — "Estadística de precios de vivienda libre" 4T 2012
 * (`https://www.transportes.gob.es/recursos_mfom/121018precioviviendaiiitrimestre.pdf`).
 * Sirve únicamente como punto de partida en € para escalar el IPV del INE a euros por m².
 */
export const ANCLA_VIVIENDA_2012_EUR_M2 = 1531.2 as const

/**
 * Tamaño tipo de la vivienda usado para mostrar el coste total de compra (euros corrientes
 * del año, sin descontar inflación). Es una convención didáctica, no una media estadística.
 */
export const VIVIENDA_TIPO_M2 = 80 as const

const _factorSubgroupCache = new Map<string, number>()

/**
 * Factor multiplicativo desde 2012 hasta `year` para el subgrupo COICOP indicado.
 * Encadena las variaciones anuales diciembre-diciembre publicadas por el INE.
 */
export function factorIpcSubgrupoDesde2012(code: IpcSubgroupCode, year: TaxYear): number {
  if (year === 2012) return 1
  const key = `${code}:${year}`
  const hit = _factorSubgroupCache.get(key)
  if (hit !== undefined) return hit
  const series = IPC_SUBGROUP_DEC[code]
  let f = 1
  for (let y = 2013; y <= year; y++) {
    const v = series[y]
    if (v === undefined) {
      throw new Error(`IPC subgrupo ${code} sin dato para ${y}`)
    }
    f *= 1 + v
  }
  _factorSubgroupCache.set(key, f)
  return f
}

const _ipvCache = new Map<number, number>()

/**
 * Factor multiplicativo del IPV (precio de la vivienda) desde 2012 hasta `year`.
 */
export function factorIpvDesde2012(year: TaxYear): number {
  if (year === 2012) return 1
  const hit = _ipvCache.get(year)
  if (hit !== undefined) return hit
  let f = 1
  for (let y = 2013; y <= year; y++) {
    const v = IPV_DEC[y]
    if (v === undefined) {
      throw new Error(`IPV sin dato para ${y}`)
    }
    f *= 1 + v
  }
  _ipvCache.set(year, f)
  return f
}
