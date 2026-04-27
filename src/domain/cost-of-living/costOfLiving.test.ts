import { describe, expect, it } from 'vitest'
import { TAX_YEARS } from '../tax/types'
import {
  ANCLA_EPF_2012_ANUAL_EUR,
  ANCLA_VIVIENDA_2012_EUR_M2,
  costeMensual,
  factorIpcSubgrupoDesde2012,
  factorIpvDesde2012,
  IPC_SUBGROUP_DEC,
  IPV_DEC,
  VIVIENDA_TIPO_M2,
  viviendaPropiedad,
} from '.'
import type { CostOfLivingCategory } from '.'
import type { IpcSubgroupCode } from './series'

describe('series IPC subgrupo', () => {
  const codes: IpcSubgroupCode[] = ['01', '04_1', '04_5', '07_2_2']
  it.each(codes)('cubre todos los años desde 2013 hasta 2026 (%s)', (code) => {
    for (let y = 2013; y <= 2026; y++) {
      expect(IPC_SUBGROUP_DEC[code][y]).toBeTypeOf('number')
    }
  })

  it.each(codes)('factor desde 2012 a 2012 = 1 (%s)', (code) => {
    expect(factorIpcSubgrupoDesde2012(code, 2012)).toBe(1)
  })

  it.each(codes)('factor estrictamente positivo y monótono encadenado (%s)', (code) => {
    let prev = 1
    for (const year of TAX_YEARS) {
      const f = factorIpcSubgrupoDesde2012(code, year)
      expect(f).toBeGreaterThan(0)
      if (year === 2012) {
        expect(f).toBe(1)
      }
      const yoyJump = Math.abs(f - prev) / prev
      expect(yoyJump).toBeLessThan(0.5)
      prev = f
    }
  })
})

describe('IPV INE', () => {
  it('cubre todos los años desde 2013 hasta 2026', () => {
    for (let y = 2013; y <= 2026; y++) {
      expect(IPV_DEC[y]).toBeTypeOf('number')
    }
  })

  it('factor desde 2012 a 2012 = 1', () => {
    expect(factorIpvDesde2012(2012)).toBe(1)
  })

  it('subida acumulada en 2024 supera el 50% (consistente con datos públicos)', () => {
    const f = factorIpvDesde2012(2024)
    expect(f).toBeGreaterThan(1.5)
  })
})

describe('costeMensual', () => {
  const cats: CostOfLivingCategory[] = ['cesta', 'alquiler', 'energia', 'carburantes']

  it.each(cats)('reproduce el ancla EPF 2012 dividida entre 12 (%s)', (cat) => {
    const r = costeMensual(2012, cat)
    const anchorMap: Record<CostOfLivingCategory, number> = {
      cesta: ANCLA_EPF_2012_ANUAL_EUR.alimentacion,
      alquiler: ANCLA_EPF_2012_ANUAL_EUR.alquilerHogarEnAlquiler,
      energia: ANCLA_EPF_2012_ANUAL_EUR.energiaHogar,
      carburantes: ANCLA_EPF_2012_ANUAL_EUR.carburantes,
    }
    expect(r.amountMonthlyEur).toBe(Math.round(anchorMap[cat] / 12))
  })

  it.each(cats)('proporciona metadatos de fuente con anchorYear 2012 (%s)', (cat) => {
    const r = costeMensual(2024, cat)
    expect(r.source.anchorYear).toBe(2012)
    expect(r.source.ineDataset).toMatch(/Encuesta de Presupuestos Familiares/i)
    expect(r.source.ipcSubgroup).toMatch(/INE IPC/i)
    expect(r.amountMonthlyEur).toBeGreaterThan(0)
  })

  it.each(cats)('cobertura completa 2012-2026 (%s)', (cat) => {
    for (const year of TAX_YEARS) {
      const r = costeMensual(year, cat)
      expect(r.amountMonthlyEur).toBeGreaterThan(0)
    }
  })
})

describe('viviendaPropiedad', () => {
  it('reproduce el ancla 2012 (€/m² Mitma) en 2012', () => {
    const r = viviendaPropiedad(2012)
    expect(r.pricePerSquareMeterEur).toBe(Math.round(ANCLA_VIVIENDA_2012_EUR_M2))
    expect(r.totalEurForTypicalSize).toBe(Math.round(ANCLA_VIVIENDA_2012_EUR_M2 * VIVIENDA_TIPO_M2))
    expect(r.squareMetersTypical).toBe(80)
  })

  it('total para 80 m² es siempre 80× el €/m² (redondeo coherente)', () => {
    for (const year of TAX_YEARS) {
      const r = viviendaPropiedad(year)
      expect(Math.abs(r.totalEurForTypicalSize - r.pricePerSquareMeterEur * 80)).toBeLessThan(80)
    }
  })

  it('cita el IPV del INE y el ancla Mitma', () => {
    const r = viviendaPropiedad(2024)
    expect(r.source.ineDataset).toMatch(/IPV/i)
    expect(r.source.anchorReference).toMatch(/Mitma/i)
    expect(r.source.anchorEurPerM2_2012).toBe(ANCLA_VIVIENDA_2012_EUR_M2)
  })
})
