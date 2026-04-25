import type { TaxYear } from './types'
import { TAX_YEARS } from './types'
import { getYearParameters } from './parameters'

export interface ControlGeneralRow {
  año: TaxYear
  baseMaxAnual: number
  ssEmpleadorPct: number
  ssEmpleadoPct: number
  meiEmpleadorPct: number
  meiEmpleadoPct: number
  gastosFijosArt19: number
  minContribuyente: number
  minExentoRetencion: number
  art20UmbralInf: string | number
  art20RedMaxima: string | number
  art20UmbralSup: string | number
  art20RedMinima: string | number
}

export interface ControlTramoRow {
  año: TaxYear
  nTramo: number
  hastaBase: number | string
  tipoPct: number
}

export function buildControlGeneralRows(): ControlGeneralRow[] {
  return TAX_YEARS.map((anio) => {
    const p = getYearParameters(anio)
    const tipoEmp = Object.values(p.ssTipos).reduce((s, x) => s + x[0], 0)
    const tipoTra = Object.values(p.ssTipos).reduce((s, x) => s + x[1], 0)
    const m = p.art20Meta
    return {
      año: anio,
      baseMaxAnual: p.baseMax,
      ssEmpleadorPct: Math.round(tipoEmp * 10000) / 100,
      ssEmpleadoPct: Math.round(tipoTra * 10000) / 100,
      meiEmpleadorPct: Math.round(p.mei[0] * 100000) / 1000,
      meiEmpleadoPct: Math.round(p.mei[1] * 100000) / 1000,
      gastosFijosArt19: p.gastosFijos,
      minContribuyente: p.irpfMinimo,
      minExentoRetencion: p.minimoExento,
      art20UmbralInf: m.uInf,
      art20RedMaxima: m.rMax,
      art20UmbralSup: m.uSup,
      art20RedMinima: m.rMin,
    }
  })
}

export function buildControlTramosRows(): ControlTramoRow[] {
  const rows: ControlTramoRow[] = []
  for (const anio of TAX_YEARS) {
    const p = getYearParameters(anio)
    p.tramosIrpf.forEach(([lim, tip], i) => {
      rows.push({
        año: anio,
        nTramo: i + 1,
        hastaBase: Number.isFinite(lim) ? lim : 'En adelante',
        tipoPct: Math.round(tip * 10000) / 100,
      })
    })
  }
  return rows
}
