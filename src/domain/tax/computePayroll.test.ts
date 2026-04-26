import { describe, expect, it } from 'vitest'
import { computePayrollBreakdown, computeBracketQuotas, computeNominaAgregada, round2 } from './computePayroll'
import { defaultTaxpayerProfile } from './taxpayerProfile'
import { getYearParameters } from './parameters'
import { computeInflationComparisonRow } from './compare'
import { inflationFactorTo2026 } from './inflation'

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
  it('same year 2026 yields ~0 purchasing power delta', () => {
    const row = computeInflationComparisonRow(2026, 50000)
    expect(row.perdidaGananciaAnualPoderAdq).toBeCloseTo(0, 0)
  })

  it('for 2026, neto en EUR2026 coincide con nómina agregada sin deflactor', () => {
    const g = 42000
    const row = computeInflationComparisonRow(2026, g)
    expect(row.netoRealEnSuAnoEur2026).toBe(computeNominaAgregada(g, 2026).salarioNeto)
  })

  it('año histórico: neto reexpresado = redondeo(neto nominal bruto_ajustado × factor IPC a 2026)', () => {
    const g2026 = 50000
    const y = 2012
    const inf = inflationFactorTo2026(y)
    const brutoNom = g2026 / inf
    const expected = round2(computeNominaAgregada(brutoNom, y).salarioNeto * inf)
    expect(computeInflationComparisonRow(y, g2026).netoRealEnSuAnoEur2026).toBe(expected)
  })
})

