import type { ComunidadAutonomaId } from './comunidadAutonoma'
import type { TaxYear } from './types'

/**
 * Situación familiar aprox. (criterios mín. familiar LIRPF; simplificado).
 * - C: unidad familiar estándar (sin mín. por cónyuge no perceptores).
 * - B: mín. por cónyuge cuyo conjunto de rentas &lt; 1.500 €/año (LIRPF).
 * - A: con hijos a cargo; los mín. por hijos se aplican vía nº de descendientes.
 */
export type SituacionFamiliarLirpf = 'A' | 'B' | 'C'

/** Discapacidad del contribuyente (LIRPF art. 59) */
export type NivelDiscapacidadLirpf = 'ninguna' | 'd33' | 'd33Mov' | 'd65+'

/**
 * Perfil del contribuyente para mínimos personales y familiares (escala estatal).
 * Incluye CCAA aprox. y grupo A.T. e P. No modela: tributación conjunta
 * plena ni tablas oficiales de retención AEAT.
 */
export interface TaxpayerProfile {
  /** Comunidad (IRPF autonómico aprox. por peso sobre la escala estatal). */
  comunidadAutonoma: ComunidadAutonomaId
  /** Grupo R.G. 1–11: solo altera A.T. e P. empleador (no la cot. trabajador con este esquema). */
  grupoCotizacion: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
  /** Situación (afecta mín. por cónyuge). */
  situacion: SituacionFamiliarLirpf
  /** Nº descendientes &lt; 25 con derecho a mín. (típ. renta &lt; 8.000 €; aquí vía requisito). */
  hijosMenores25: number
  /** Cumplen requisito de renta del descendiente (LIRPF). */
  hijosCumplenRequisito: boolean
  /** De esos, cuántos tienen &lt; 3 años (incremento fijo LIRPF). */
  hijosMenores3: number
  /** Mayores 65-74 a cargo (LIRPF: ascendientes). */
  ascendientes65a74: number
  /** Mayores ≥ 75 a cargo (LIRPF: ascendientes). */
  ascendientes75Omas: number
  /**
   * Cuenta a efectos mín. por mayores a cargo con disc. 33-65% (simpl.).
   * Se suma al mín. por mayores y extras de disc. del manual AEAT.
   */
  ascendentesConDiscapacidad33: number
  ascendentesConDiscapacidadMov: number
  ascendentesConDiscapacidad65: number
  /** Desc. con min. 33% / 33% mov. / 65% (cada nº añade 3.000/3.000/9.000). */
  descendientesDisc33: number
  descendientesDiscMov: number
  descendientesDisc65: number
  edad: number
  nPagas: 12 | 14
  discapacidad: NivelDiscapacidadLirpf
}

export const defaultTaxpayerProfile: TaxpayerProfile = {
  comunidadAutonoma: 'soloEscalaEstatal',
  grupoCotizacion: 1,
  situacion: 'C',
  hijosMenores25: 0,
  hijosCumplenRequisito: true,
  hijosMenores3: 0,
  ascendientes65a74: 0,
  ascendientes75Omas: 0,
  ascendentesConDiscapacidad33: 0,
  ascendentesConDiscapacidadMov: 0,
  ascendentesConDiscapacidad65: 0,
  descendientesDisc33: 0,
  descendientesDiscMov: 0,
  descendientesDisc65: 0,
  edad: 30,
  nPagas: 12,
  discapacidad: 'ninguna',
}

/**
 * Cuantía mínimo del contribuyente (€/año), escala estatal LIRPF (aprox. por periodo).
 */
export function getMinimoContribuyenteEur(year: TaxYear): number {
  if (year <= 2014) return 5_151
  if (year <= 2020) return 5_550
  return 5_700
}

/** Cuantía mín. por 1.º, 2.º, 3.º, 4.º+ descendiente (desde 2015, homogeneizado 2012-2014 con misma pauta). */
function mínimosDescendientePorOrden(orden: 0 | 1 | 2 | 3, year: TaxYear): number {
  if (year <= 2014) {
    const v = [1_500, 1_800, 2_000, 2_200] as const
    return v[Math.min(orden, 3)]
  }
  return [2_400, 2_700, 4_000, 4_500][Math.min(orden, 3)]
}

/** +2.800 €/año menores de 3 años (LIRPF, cuantía habitual en el periodo). */
function incrementoHijoMenor3Eur(): number {
  return 2_800
}

/**
 * Suma mín. personal, familiar, discap. (LIRPF estatal) reducible de la base imponible general,
 * sin superar el art. 61 (corte por base imponible en esta implementación).
 */
export function getReduccionMinimosLirpfBaseImponible(
  year: TaxYear,
  profileRaw: TaxpayerProfile,
  baseImponible: number,
): { reduccion: number; detalle: { concepto: string; euros: number }[] } {
  const p = profileRaw
  const d: { concepto: string; euros: number }[] = []
  if (baseImponible <= 0) {
    return { reduccion: 0, detalle: d }
  }

  let s = 0

  // Mínimo del contribuyente
  const minCont = getMinimoContribuyenteEur(year)
  s += minCont
  d.push({ concepto: 'Mínimo del contribuyente', euros: minCont })
  if (p.edad >= 75) {
    s += 1_150 + 1_400
    d.push({ concepto: 'Mín. por edad (≥ 75 años, inc. 65+)', euros: 1_150 + 1_400 })
  } else if (p.edad >= 65) {
    s += 1_150
    d.push({ concepto: 'Mín. por edad (65-74 años)', euros: 1_150 })
  }

  if (p.discapacidad === 'd33') {
    s += 3_000
    d.push({ concepto: 'Mín. por disc. contrib. (33% a 65%)', euros: 3_000 })
  } else if (p.discapacidad === 'd33Mov') {
    s += 6_000
    d.push({ concepto: 'Mín. por disc. contrib. (33-65% con mov. / ayuda)', euros: 6_000 })
  } else if (p.discapacidad === 'd65+') {
    s += 12_000
    d.push({ concepto: 'Mín. por disc. contrib. (≥ 65% + sup.)', euros: 12_000 })
  }

  if (p.situacion === 'B') {
    s += 3_400
    d.push({ concepto: 'Mín. por cónyuge (requisito art. 59)', euros: 3_400 })
  }

  // Descendientes
  const h25 = Math.max(0, Math.min(20, Math.floor(p.hijosMenores25)))
  const h3 = Math.max(0, Math.min(h25, Math.floor(p.hijosMenores3)))
  if (h25 > 0 && p.hijosCumplenRequisito) {
    for (let i = 0; i < h25; i++) {
      const orden = Math.min(i, 3) as 0 | 1 | 2 | 3
      const m = mínimosDescendientePorOrden(orden, year)
      s += m
      d.push({ concepto: `Mín. por descendiente ${i + 1}º`, euros: m })
    }
    const inc = incrementoHijoMenor3Eur()
    const extra3 = h3 * inc
    s += extra3
    if (extra3 > 0) {
      d.push({ concepto: 'Incremento por hijos < 3 años (×' + h3 + ')', euros: extra3 })
    }
  }
  s += 3_000 * p.descendientesDisc33
  s += 3_000 * p.descendientesDiscMov
  s += 9_000 * p.descendientesDisc65
  if (p.descendientesDisc33) {
    d.push({ concepto: 'Mín. adic. disc. 33% descend. (×' + p.descendientesDisc33 + ')', euros: 3_000 * p.descendientesDisc33 })
  }
  if (p.descendientesDiscMov) {
    d.push({ concepto: 'Mín. adic. disc. mov. descend. (×' + p.descendientesDiscMov + ')', euros: 3_000 * p.descendientesDiscMov })
  }
  if (p.descendientesDisc65) {
    d.push({ concepto: 'Mín. adic. disc. ≥ 65% descend. (×' + p.descendientesDisc65 + ')', euros: 9_000 * p.descendientesDisc65 })
  }

  // Mayores a cargo
  const a6574 = Math.max(0, Math.min(4, p.ascendientes65a74))
  const a75 = Math.max(0, Math.min(4, p.ascendientes75Omas))
  s += 1_150 * a6574
  s += 2_550 * a75
  if (a6574) d.push({ concepto: 'Mín. mayores 65-74 a cargo (×' + a6574 + ')', euros: 1_150 * a6574 })
  if (a75) d.push({ concepto: 'Mín. mayores ≥ 75 a cargo (×' + a75 + ')', euros: 2_550 * a75 })
  s += 3_000 * p.ascendentesConDiscapacidad33
  s += 3_000 * p.ascendentesConDiscapacidadMov
  s += 9_000 * p.ascendentesConDiscapacidad65
  if (p.ascendentesConDiscapacidad33) {
    d.push({ concepto: 'Mín. adic. disc. mayores 33%', euros: 3_000 * p.ascendentesConDiscapacidad33 })
  }
  if (p.ascendentesConDiscapacidadMov) {
    d.push({ concepto: 'Mín. adic. disc. mayores mov.', euros: 3_000 * p.ascendentesConDiscapacidadMov })
  }
  if (p.ascendentesConDiscapacidad65) {
    d.push({ concepto: 'Mín. adic. disc. mayores ≥ 65%', euros: 9_000 * p.ascendentesConDiscapacidad65 })
  }

  const reduccion = Math.min(baseImponible, s)
  return { reduccion, detalle: d }
}
