import { describe, expect, it } from 'vitest'
import { computePayrollBreakdown, computeBracketQuotas, computeNominaAgregada, round2 } from './computePayroll'
import { defaultTaxpayerProfile } from './taxpayerProfile'
import { getYearParameters } from './parameters'
import {
  brutoNominalAeur2012Comparables,
  computeInflationComparisonRow,
  netoReexpresadoAeurAñoElegido,
} from './compare'
import {
  getAccumulatedInflation,
  inflationFactorTo2026,
  precios2012HastaAnio,
  reexpressNominalEurAeurConstante,
} from './inflation'

describe('computeBracketQuotas', () => {
  it('returns zero for non-positive base', () => {
    const p = getYearParameters(2020)
    const { details, cuotaTotal } = computeBracketQuotas(0, p.tramosIrpf)
    expect(cuotaTotal).toBe(0)
    expect(details.every((d) => d.amount === 0)).toBe(true)
  })
})

describe('computePayrollBreakdown', () => {
  it('handles zero gross', () => {
    const b = computePayrollBreakdown(0, 2020)
    expect(b.salarioNeto).toBe(0)
    expect(b.irpfFinal).toBe(0)
    expect(b.cotTrabajador).toBe(0)
  })

  it('respects SS base cap', () => {
    const b = computePayrollBreakdown(70000, 2012)
    const p = getYearParameters(2012)
    expect(b.baseCotizacion).toBe(p.baseMax)
    expect(b.excesoBase).toBe(70000 - p.baseMax)
  })

  it('applies solidarity surcharges when gross exceeds base max (2026)', () => {
    const below = computePayrollBreakdown(61214.4, 2026)
    const above = computePayrollBreakdown(120000, 2026)
    expect(above.excesoBase).toBeGreaterThan(0)
    expect(above.cotTrabajador).toBeGreaterThan(below.cotTrabajador)
    expect(above.cotEmpresa).toBeGreaterThan(below.cotEmpresa)
  })

  it('deducción SMI solo en 2025-2026 del modelo', () => {
    const b2024 = computePayrollBreakdown(17000, 2024)
    const b2025 = computePayrollBreakdown(17000, 2025)
    expect(b2024.deduccionSmi).toBe(0)
    expect(b2025.deduccionSmi).toBeGreaterThan(0)
  })

  it('2018 uses transitional art.20 blend', () => {
    const b = computePayrollBreakdown(10000, 2018)
    expect(b.reduccionTrabajo).toBeGreaterThan(0)
    expect(b.baseImponible).toBeGreaterThan(0)
  })

  it('nomina agregada matches breakdown neto and IRPF', () => {
    const gross = 42319
    const year = 2023
    const full = computePayrollBreakdown(gross, year)
    const agg = computeNominaAgregada(gross, year)
    expect(agg.salarioNeto).toBe(full.salarioNeto)
    expect(agg.irpfFinal).toBe(full.irpfFinal)
  })

  it('perfil con hijos aplica mayor reducción de mínimos y menor IRPF que sin hijos', () => {
    const gross = 45_000
    const year = 2024
    const sin = computePayrollBreakdown(gross, year, defaultTaxpayerProfile)
    const con = computePayrollBreakdown(gross, year, {
      ...defaultTaxpayerProfile,
      hijosMenores25: 2,
      hijosMenores3: 0,
    })
    expect(con.reduccionMinimosLirpf).toBeGreaterThan(sin.reduccionMinimosLirpf)
    expect(con.irpfFinal).toBeLessThan(sin.irpfFinal)
  })
})

describe('inflation', () => {
  it('2012 to 2026 factor matches chained IPC', () => {
    const f = inflationFactorTo2026(2012)
    expect(f).toBeGreaterThan(1.2)
    expect(f).toBeLessThan(1.35)
  })
})

describe('computeInflationComparisonRow', () => {
  it('misma norma 2012: variación de poder adquisitivo nula con el mismo bruto fijo (€ 2012)', () => {
    const row = computeInflationComparisonRow(2012, 50000)
    expect(row.perdidaGananciaAnualPoderAdq).toBe(0)
  })

  it('en 2012, neto reexpresado en € 2012 coincide con nómina agregada', () => {
    const g = 42000
    const row = computeInflationComparisonRow(2012, g)
    expect(row.netoReexpresadoEur2012).toBe(computeNominaAgregada(g, 2012).salarioNeto)
  })

  it('año posterior: neto reexpresado a € 2012 = redondeo(neto nominal / factor precios 2012→año)', () => {
    const y = 2016 as const
    const f12y = getAccumulatedInflation(2012, y)
    const g2012 = 40000
    const brutoNom = g2012 * f12y
    const expected = round2(computeNominaAgregada(brutoNom, y).salarioNeto / f12y)
    expect(computeInflationComparisonRow(y, g2012).netoReexpresadoEur2012).toBe(expected)
  })

  it('mismo bruto 2026 nominal, fila 2012: coincide con fórmula vía 2026→2012 (equivalente a euros 2012 fijos)', () => {
    const gNominal2026 = 50000
    const f1226 = precios2012HastaAnio(2026)
    const g2012 = gNominal2026 / f1226
    const row = computeInflationComparisonRow(2026, g2012)
    const f = getAccumulatedInflation(2012, 2026)
    const expected = round2(computeNominaAgregada(gNominal2026, 2026).salarioNeto / f)
    expect(row.netoReexpresadoEur2012).toBe(expected)
  })
})

describe('reexpressNominalEurAeurConstante', () => {
  it('mismo año: no altera el importe', () => {
    expect(reexpressNominalEurAeurConstante(25_000, 2026, 2026)).toBe(25_000)
  })
})

describe('netoReexpresadoAeurAñoElegido (Evolución del neto vs calculadora)', () => {
  it('el punto del año de la calculadora coincide con el neto de la calculadora (mismo bruto nominal)', () => {
    const gross = 50_000
    const y = 2026 as const
    const b2012 = brutoNominalAeur2012Comparables(gross, y)
    const row = computeInflationComparisonRow(y, b2012)
    expect(netoReexpresadoAeurAñoElegido(row, y)).toBe(computePayrollBreakdown(gross, y).salarioNeto)
  })
})

