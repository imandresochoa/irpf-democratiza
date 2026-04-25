import type { Art20Meta, IrpfBracket, TaxYear, YearTaxParams } from './types'

function getArt20Meta(anio: TaxYear): Art20Meta {
  if (anio <= 2014) {
    return { uInf: 9180, rMax: 4080, uSup: 13260, rMin: 2652 }
  }
  if (anio >= 2015 && anio <= 2017) {
    return { uInf: 11250, rMax: 3700, uSup: 14450, rMin: 0 }
  }
  if (anio === 2018) {
    return { uInf: 'Transitorio', rMax: 'Transitorio', uSup: 'Transitorio', rMin: 'Transitorio' }
  }
  if (anio >= 2019 && anio <= 2022) {
    return { uInf: 13115, rMax: 5565, uSup: 16825, rMin: 0 }
  }
  if (anio === 2023) {
    return { uInf: 14047.5, rMax: 6498, uSup: 19747.5, rMin: 0 }
  }
  return { uInf: 14852, rMax: 7302, uSup: 19747.5, rMin: 0 }
}

function reduccionTrabajo(anio: TaxYear, rnPrevio: number): number {
  if (anio <= 2014) {
    if (rnPrevio <= 9180) return 4080.0
    if (rnPrevio <= 13260) return 4080.0 - 0.35 * (rnPrevio - 9180.0)
    return 2652.0
  }
  if (anio >= 2015 && anio <= 2017) {
    if (rnPrevio <= 11250) return 3700.0
    if (rnPrevio <= 14450) return 3700.0 - 1.15625 * (rnPrevio - 11250.0)
    return 0.0
  }
  if (anio === 2018) {
    const pre =
      rnPrevio <= 11250
        ? 3700.0
        : rnPrevio <= 14450
          ? 3700.0 - 1.15625 * (rnPrevio - 11250.0)
          : 0.0
    const post =
      rnPrevio <= 13115
        ? 5565.0
        : rnPrevio <= 16825
          ? Math.max(0.0, 5565.0 - 1.5 * (rnPrevio - 13115.0))
          : 0.0
    return pre / 2.0 + post / 2.0
  }
  if (anio >= 2019 && anio <= 2022) {
    if (rnPrevio <= 13115) return 5565.0
    if (rnPrevio <= 16825) return Math.max(0.0, 5565.0 - 1.5 * (rnPrevio - 13115.0))
    return 0.0
  }
  if (anio === 2023) {
    if (rnPrevio <= 14047.5) return 6498.0
    if (rnPrevio <= 19747.5) return Math.max(0.0, 6498.0 - 1.14 * (rnPrevio - 14047.5))
    return 0.0
  }
  if (anio >= 2024) {
    if (rnPrevio <= 14852) return 7302.0
    if (rnPrevio <= 17673.52) return 7302.0 - 1.75 * (rnPrevio - 14852.0)
    if (rnPrevio <= 19747.5) return 2364.34 - 1.14 * (rnPrevio - 17673.52)
    return 0.0
  }
  return 0.0
}

function deduccionSmi(anio: TaxYear, bruto: number): number {
  if (anio === 2026) {
    if (bruto <= 17094) return 590.89
    return Math.max(0.0, 590.89 - 0.2 * (bruto - 17094.0))
  }
  if (anio === 2025) {
    if (bruto <= 16576) return 340.0
    if (bruto <= 18276) return Math.max(0, 340.0 - 0.2 * (bruto - 16576.0))
  }
  return 0.0
}

const BASE_MAX: Readonly<Record<TaxYear, number>> = {
  2012: 39150.0,
  2013: 41108.4,
  2014: 43164.0,
  2015: 43272.0,
  2016: 43704.0,
  2017: 45014.4,
  2018: 45014.4,
  2019: 48841.2,
  2020: 48841.2,
  2021: 48841.2,
  2022: 49672.8,
  2023: 53946.0,
  2024: 56646.0,
  2025: 58914.0,
  2026: 61214.4,
}

const MINIMO_EXENTO: Readonly<Record<TaxYear, number>> = {
  2012: 11162,
  2013: 11162,
  2014: 11162,
  2015: 12000,
  2016: 12000,
  2017: 12000,
  2018: 12643,
  2019: 14000,
  2020: 14000,
  2021: 14000,
  2022: 14000,
  2023: 15000,
  2024: 15876,
  2025: 15876,
  2026: 15876,
}

function tramosIrpf(anio: TaxYear): readonly IrpfBracket[] {
  if (anio <= 2014) {
    return [
      [17707, 0.2475],
      [33007, 0.3],
      [53407, 0.4],
      [120000, 0.47],
      [175000, 0.49],
      [300000, 0.51],
      [Number.POSITIVE_INFINITY, 0.52],
    ]
  }
  if (anio === 2015) {
    return [
      [12450, 0.195],
      [20200, 0.245],
      [34000, 0.305],
      [60000, 0.38],
      [Number.POSITIVE_INFINITY, 0.46],
    ]
  }
  if (anio >= 2016 && anio <= 2020) {
    return [
      [12450, 0.19],
      [20200, 0.24],
      [35200, 0.3],
      [60000, 0.37],
      [Number.POSITIVE_INFINITY, 0.45],
    ]
  }
  return [
    [12450, 0.19],
    [20200, 0.24],
    [35200, 0.3],
    [60000, 0.37],
    [300000, 0.45],
    [Number.POSITIVE_INFINITY, 0.47],
  ]
}

const SS_TIPOS: YearTaxParams['ssTipos'] = {
  comunes: [0.236, 0.047],
  desempleo: [0.055, 0.0155],
  fogasa: [0.002, 0.0],
  fp: [0.006, 0.001],
  atep: [0.015, 0.0],
}

const _paramsCache = new Map<TaxYear, YearTaxParams>()

export function getYearParameters(year: TaxYear): YearTaxParams {
  const cached = _paramsCache.get(year)
  if (cached) return cached

  const irpfMinimo = year <= 2014 ? 5151 : 5550
  const gastosFijos = year <= 2014 ? 0 : 2000

  let mei: YearTaxParams['mei']
  if (year === 2023) mei = [0.005, 0.001]
  else if (year === 2024) mei = [0.0058, 0.0012]
  else if (year === 2025) mei = [0.0067, 0.0013]
  else if (year >= 2026) mei = [0.0075, 0.0015]
  else mei = [0.0, 0.0]

  let solidaridad: YearTaxParams['solidaridad']
  if (year === 2025) {
    solidaridad = [
      [1.1, 0.0092],
      [1.5, 0.01],
      [Number.POSITIVE_INFINITY, 0.0117],
    ]
  } else if (year >= 2026) {
    solidaridad = [
      [1.1, 0.0115],
      [1.5, 0.0125],
      [Number.POSITIVE_INFINITY, 0.0146],
    ]
  } else {
    solidaridad = []
  }

  const p: YearTaxParams = {
    year,
    baseMax: BASE_MAX[year],
    ssTipos: SS_TIPOS,
    mei,
    solidaridad,
    irpfMinimo,
    minimoExento: MINIMO_EXENTO[year],
    gastosFijos,
    art20Meta: getArt20Meta(year),
    tramosIrpf: tramosIrpf(year),
    reduccionTrabajo: (rn) => reduccionTrabajo(year, rn),
    deduccionSmi: (b) => deduccionSmi(year, b),
  }

  _paramsCache.set(year, p)
  return p
}
