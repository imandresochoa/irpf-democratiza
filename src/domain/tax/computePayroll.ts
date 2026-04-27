import type { BracketQuotaDetail, PayrollBreakdown, TaxYear, YearTaxParams } from './types'
import {
  getPesoEscalaAutonomicaAproximada,
  tramosAutonomicosAproximados,
} from './comunidadAutonoma'
import { getAtepEmpleadorRgl } from './grupoCotizacion'
import { getYearParameters } from './parameters'
import { defaultTaxpayerProfile, getReduccionMinimosLirpfBaseImponible, type TaxpayerProfile } from './taxpayerProfile'

export interface ComputePayrollOptions {
  /**
   * Escala monetaria aplicada al bloque IRPF (umbrales y cuantías fijas).
   * 1 = normativa vigente sin ajuste; >1 simula deflactación de la tarifa.
   */
  irpfMonetaryScaleFactor?: number
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100
}

/** Reparte la base liquidable en cuotas por tramos IRPF */
export function computeBracketQuotas(
  baseLiq: number,
  tramos: YearTaxParams['tramosIrpf'],
): { details: BracketQuotaDetail[]; cuotaTotal: number } {
  const details: BracketQuotaDetail[] = tramos.map(([, tipo], i) => ({
    index: i + 1,
    ratePercent: Math.round(tipo * 1000) / 10,
    amount: 0,
  }))

  if (baseLiq <= 0) {
    return { details, cuotaTotal: 0 }
  }

  let cuotaTotal = 0
  let limAnt = 0

  for (let i = 0; i < tramos.length; i++) {
    const [lim, tipo] = tramos[i]!
    if (baseLiq > lim) {
      const cuota = (lim - limAnt) * tipo
      details[i]!.amount = cuota
      cuotaTotal += cuota
      limAnt = lim
    } else {
      const cuota = (baseLiq - limAnt) * tipo
      details[i]!.amount = cuota
      cuotaTotal += cuota
      break
    }
  }

  return { details, cuotaTotal }
}

function applySolidarity(
  p: YearTaxParams,
  excesoBase: number,
  baseCotizacion: number,
  cotEmpresa: number,
  cotTrabajador: number,
): { cotEmpresa: number; cotTrabajador: number } {
  if (!p.solidaridad.length || excesoBase <= 0) {
    return { cotEmpresa, cotTrabajador }
  }
  const tramo1Limite = baseCotizacion * 0.1
  const tramo2Limite = baseCotizacion * 0.5
  const exceso1 = Math.min(excesoBase, tramo1Limite)
  const exceso2 = Math.min(Math.max(0, excesoBase - tramo1Limite), tramo2Limite - tramo1Limite)
  const exceso3 = Math.max(0, excesoBase - tramo2Limite)
  const rates = p.solidaridad
  const cuotaSolTotal =
    exceso1 * rates[0]![1] + exceso2 * rates[1]![1] + exceso3 * rates[2]![1]
  return {
    cotEmpresa: cotEmpresa + cuotaSolTotal * (5 / 6),
    cotTrabajador: cotTrabajador + cuotaSolTotal * (1 / 6),
  }
}

/**
 * Desglose completo alineado con la lógica del script Python (procesar_ano);
 * mín. personal y familiar (LIRPF, escala estatal) sobre `profile`.
 */
export function computePayrollBreakdown(
  salarioBruto: number,
  year: TaxYear,
  profile: TaxpayerProfile = defaultTaxpayerProfile,
  opts: ComputePayrollOptions = {},
): PayrollBreakdown {
  const p = getYearParameters(year)
  const kRaw = opts.irpfMonetaryScaleFactor ?? 1
  const k = Number.isFinite(kRaw) && kRaw > 0 ? kRaw : 1
  const baseCotizacion = Math.min(salarioBruto, p.baseMax)
  const excesoBase = Math.max(0, salarioBruto - p.baseMax)

  const atepE = getAtepEmpleadorRgl(profile.grupoCotizacion)
  const ssTiposConAtep = { ...p.ssTipos, atep: [atepE, 0] as [number, number] }
  const tipoEmpresa =
    Object.values(ssTiposConAtep).reduce((s, x) => s + x[0], 0) + p.mei[0]
  const tipoTrabajador =
    Object.values(ssTiposConAtep).reduce((s, x) => s + x[1], 0) + p.mei[1]

  let cotEmpresa = baseCotizacion * tipoEmpresa
  let cotTrabajador = baseCotizacion * tipoTrabajador
  ;({ cotEmpresa, cotTrabajador } = applySolidarity(p, excesoBase, baseCotizacion, cotEmpresa, cotTrabajador))

  const costeLaboral = salarioBruto + cotEmpresa
  const rendimientoPrevio = salarioBruto - cotTrabajador
  const redTrabajo = k === 1 ? p.reduccionTrabajo(rendimientoPrevio) : k * p.reduccionTrabajo(rendimientoPrevio / k)
  const gastosFijos = p.gastosFijos * k
  const rendimientoNeto = Math.max(0, rendimientoPrevio - gastosFijos)
  const baseImponible = Math.max(0, rendimientoNeto - redTrabajo)

  const reduccionMinimosLirpf =
    k === 1
      ? getReduccionMinimosLirpfBaseImponible(year, profile, baseImponible).reduccion
      : k * getReduccionMinimosLirpfBaseImponible(year, profile, baseImponible / k).reduccion
  const baseSujetaTramos = Math.max(0, baseImponible - reduccionMinimosLirpf)
  const tramosIrpfEscalados: YearTaxParams['tramosIrpf'] =
    k === 1
      ? p.tramosIrpf
      : (p.tramosIrpf.map(([lim, tipo]) => [lim * k, tipo] as const) as YearTaxParams['tramosIrpf'])

  const { details: cuotasEstRaw, cuotaTotal: cuotaIntegraEstatal } = computeBracketQuotas(
    baseSujetaTramos,
    tramosIrpfEscalados,
  )
  const pesoAut = getPesoEscalaAutonomicaAproximada(profile.comunidadAutonoma, year)
  const trAut = tramosAutonomicosAproximados(tramosIrpfEscalados, pesoAut)
  const { details: cuotasAutRaw, cuotaTotal: cuotaIntegraAutonomica } = computeBracketQuotas(
    baseSujetaTramos,
    trAut,
  )
  const cuotaIntegra = cuotaIntegraEstatal + cuotaIntegraAutonomica
  const cuotaTeorica = Math.max(0, cuotaIntegra)
  const dedSmi = k === 1 ? p.deduccionSmi(salarioBruto) : k * p.deduccionSmi(salarioBruto / k)
  const cuotaTrasSmi = Math.max(0, cuotaTeorica - dedSmi)
  const limiteRetencion = Math.max(0, (salarioBruto - p.minimoExento * k) * 0.43)
  const irpfFinal = Math.min(cuotaTrasSmi, limiteRetencion)
  const salarioNeto = salarioBruto - cotTrabajador - irpfFinal

  const cuotasPorTramo = cuotasEstRaw.map((d) => ({
    ...d,
    amount: round2(d.amount),
  }))
  const cuotasPorTramoAutonomica = cuotasAutRaw.map((d) => ({
    ...d,
    amount: round2(d.amount),
  }))

  return {
    year,
    salarioBruto,
    baseCotizacion,
    excesoBase,
    tipoEmpresa,
    tipoTrabajador,
    cotEmpresa: round2(cotEmpresa),
    cotTrabajador: round2(cotTrabajador),
    costeLaboral: round2(costeLaboral),
    rendimientoPrevio: round2(rendimientoPrevio),
    gastosFijos: round2(gastosFijos),
    reduccionTrabajo: round2(redTrabajo),
    rendimientoNeto: round2(rendimientoNeto),
    baseImponible: round2(baseImponible),
    reduccionMinimosLirpf: round2(reduccionMinimosLirpf),
    baseSujetaTramos: round2(baseSujetaTramos),
    cuotasPorTramo,
    cuotasPorTramoAutonomica,
    cuotaIntegraEstatal: round2(cuotaIntegraEstatal),
    cuotaIntegraAutonomica: round2(cuotaIntegraAutonomica),
    cuotaIntegra: round2(cuotaIntegra),
    cuotaTeorica: round2(cuotaTeorica),
    deduccionSmi: round2(dedSmi),
    cuotaTrasSmi: round2(cuotaTrasSmi),
    limiteRetencion43: round2(limiteRetencion),
    irpfFinal: round2(irpfFinal),
    salarioNeto: round2(salarioNeto),
  }
}

/** Versión agregada para comparativas (mismos números que calcular_nomina_agregada) */
export function computeNominaAgregada(
  bruto: number,
  year: TaxYear,
  profile: TaxpayerProfile = defaultTaxpayerProfile,
  opts: ComputePayrollOptions = {},
): {
  costeLaboral: number
  cotEmpresa: number
  cotTrabajador: number
  irpfFinal: number
  salarioNeto: number
} {
  const b = computePayrollBreakdown(bruto, year, profile, opts)
  return {
    costeLaboral: b.costeLaboral,
    cotEmpresa: b.cotEmpresa,
    cotTrabajador: b.cotTrabajador,
    irpfFinal: b.irpfFinal,
    salarioNeto: b.salarioNeto,
  }
}
