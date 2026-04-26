import type { IrpfBracket, TaxYear, YearTaxParams } from './types'

/**
 * Aprox. escala autonómica: mismos tramos (topes) que el estatal, tipos marginales
 * proporcionales al estatal. No sustituye las tablas oficiales de la CCAA.
 * Foral/Convenio: orientativo.
 */
export type ComunidadAutonomaId =
  | 'soloEscalaEstatal'
  | 'andalucia'
  | 'aragon'
  | 'asturias'
  | 'baleares'
  | 'canarias'
  | 'cantabria'
  | 'clm'
  | 'cyl'
  | 'cataluña'
  | 'madrid'
  | 'valencia'
  | 'extremadura'
  | 'galicia'
  | 'murcia'
  | 'rioja'
  | 'ceuta'
  | 'melilla'
  | 'paisVasco'
  | 'navarra'

export const COMUNIDADES_AUTONOMAS: { id: ComunidadAutonomaId; label: string }[] = [
  { id: 'soloEscalaEstatal', label: 'Solo escala estatal (sin aprox. autonómica)' },
  { id: 'madrid', label: 'Comunidad de Madrid' },
  { id: 'cataluña', label: 'Cataluña' },
  { id: 'andalucia', label: 'Andalucía' },
  { id: 'valencia', label: 'Com. Valenciana' },
  { id: 'aragon', label: 'Aragón' },
  { id: 'asturias', label: 'Principado de Asturias' },
  { id: 'baleares', label: 'Illes Balears' },
  { id: 'canarias', label: 'Canarias' },
  { id: 'cantabria', label: 'Cantabria' },
  { id: 'clm', label: 'Castilla-La Mancha' },
  { id: 'cyl', label: 'Castilla y León' },
  { id: 'extremadura', label: 'Extremadura' },
  { id: 'galicia', label: 'Galicia' },
  { id: 'murcia', label: 'Región de Murcia' },
  { id: 'rioja', label: 'La Rioja' },
  { id: 'ceuta', label: 'Ceuta' },
  { id: 'melilla', label: 'Melilla' },
  { id: 'paisVasco', label: 'País Vasco (convenio, aprox.)' },
  { id: 'navarra', label: 'Navarra (foral, aprox.)' },
]

const PESO_CUOTA_AUT: Partial<Record<ComunidadAutonomaId, number>> = {
  soloEscalaEstatal: 0,
  madrid: 0.48,
  cataluña: 0.5,
  andalucia: 0.47,
  valencia: 0.48,
  aragon: 0.48,
  asturias: 0.48,
  baleares: 0.49,
  canarias: 0.45,
  cantabria: 0.48,
  clm: 0.47,
  cyl: 0.48,
  extremadura: 0.47,
  galicia: 0.48,
  murcia: 0.48,
  rioja: 0.48,
  ceuta: 0.45,
  melilla: 0.45,
  paisVasco: 0.36,
  navarra: 0.4,
}

export function getPesoEscalaAutonomicaAproximada(
  id: ComunidadAutonomaId,
  _year: TaxYear,
): number {
  if (id === 'soloEscalaEstatal') return 0
  return PESO_CUOTA_AUT[id] ?? 0.48
}

/** Mismos tramos (topes) que el estatal, tipos = estatal × peso. */
export function tramosAutonomicosAproximados(
  tramosEstat: YearTaxParams['tramosIrpf'],
  peso: number,
): IrpfBracket[] {
  if (peso <= 0) {
    return tramosEstat.map(([l]) => [l, 0] as [number, number]) as IrpfBracket[]
  }
  return tramosEstat.map(([l, t]) => [l, t * peso] as [number, number]) as IrpfBracket[]
}
