/** Años fiscales soportados por el modelo */
export type TaxYear = 2012 | 2013 | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026

export const TAX_YEARS: readonly TaxYear[] = [
  2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026,
] as const

export function isTaxYear(y: number): y is TaxYear {
  return y >= 2012 && y <= 2026 && Number.isInteger(y)
}

/** Año fiscal “vigente” en la calculadora: año natural, acotado a `TAX_YEARS`. */
export function getCalculatorTaxYear(d = new Date()): TaxYear {
  const y = d.getFullYear()
  if (y < 2012) return 2012
  if (y > 2026) return 2026
  return y as TaxYear
}

/** Tramo IRPF: límite superior de la base liquidable y tipo marginal */
export type IrpfBracket = readonly [limit: number, rate: number]

export interface Art20Meta {
  uInf: number | 'Transitorio'
  rMax: number | 'Transitorio'
  uSup: number | 'Transitorio'
  rMin: number | 'Transitorio'
}

/** Tipos de cotización: [empleador, trabajador] */
export type SsPair = readonly [employer: number, employee: number]

export interface YearTaxParams {
  year: TaxYear
  baseMax: number
  ssTipos: Readonly<Record<string, SsPair>>
  mei: SsPair
  /** Tasas de solidaridad por tramo de exceso sobre base máxima; solo se usa el segundo valor de cada tupla */
  solidaridad: ReadonlyArray<readonly [factor: number, rate: number]>
  irpfMinimo: number
  minimoExento: number
  gastosFijos: number
  art20Meta: Art20Meta
  tramosIrpf: readonly IrpfBracket[]
  reduccionTrabajo: (rendimientoPrevioSinFijos: number) => number
  deduccionSmi: (bruto: number) => number
}

export interface BracketQuotaDetail {
  index: number
  ratePercent: number
  amount: number
}

export interface PayrollBreakdown {
  year: TaxYear
  salarioBruto: number
  baseCotizacion: number
  excesoBase: number
  tipoEmpresa: number
  tipoTrabajador: number
  cotEmpresa: number
  cotTrabajador: number
  costeLaboral: number
  rendimientoPrevio: number
  gastosFijos: number
  reduccionTrabajo: number
  rendimientoNeto: number
  baseImponible: number
  /** Mín. personal y familiar (LIRPF) deducido de la base imponible general (corte art. 61). */
  reduccionMinimosLirpf: number
  /** Base sometida a tramos (tras mín. LIRPF). */
  baseSujetaTramos: number
  /** Por tramo (IRPF estatal). */
  cuotasPorTramo: BracketQuotaDetail[]
  /** Por tramo (IRPF autonómico, aprox.). */
  cuotasPorTramoAutonomica: BracketQuotaDetail[]
  /** Cuota estatal. */
  cuotaIntegraEstatal: number
  /** Cuota autonómica aprox. */
  cuotaIntegraAutonomica: number
  /** Suma (estatal + autonómica) antes de SMI. */
  cuotaIntegra: number
  /** Cuota teórica antes de ded. SMI (soma estatal + autonómica; si solo estatal, auton. = 0). */
  cuotaTeorica: number
  deduccionSmi: number
  cuotaTrasSmi: number
  limiteRetencion43: number
  irpfFinal: number
  salarioNeto: number
}

export interface InflationComparisonRow {
  yearCompared: TaxYear
  salarioEquivalente2026: number
  multiplicadorIpc: number
  ipcAcumuladoPercent: number
  salarioBrutoNominal: number
  costeLaboralEur2026: number
  ssEmpEur2026: number
  ssTraEur2026: number
  irpfEur2026: number
  netoRealEnSuAnoEur2026: number
  netoReal2026: number
  variacionPoderAdquisitivoMensual: number
  perdidaGananciaAnualPoderAdq: number
}
