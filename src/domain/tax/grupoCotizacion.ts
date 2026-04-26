/**
 * Grupo de cotización Régimen General (TGSS) — accidentes de trabajo y enfermedades
 * profesionales: tipo de cotización (empleador). El tipo trabajador de contingencias
 * comunes, desempleo, FP, etc. se mantiene; solo varía el A.T. e P. del empleador.
 * Valores aprox. por grupo (R.G. general). No afecta a la cot. trabajador con el modelo
 * habitual de convenio (trab. 0% A.T. e P.).
 */
export const GRUPO_COTIZACION: {
  n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
  label: string
  /** A.T. e P. empleador (tanto por uno) */
  atEpEmpleador: number
}[] = [
  { n: 1, label: 'Ingenieros y licenciados', atEpEmpleador: 0.015 },
  { n: 2, label: 'Ingenieros técnicos, peritos y ayudantes titulados', atEpEmpleador: 0.015 },
  { n: 3, label: 'Jefes administrativos y de taller', atEpEmpleador: 0.015 },
  { n: 4, label: 'Ayudantes no titulados', atEpEmpleador: 0.0155 },
  { n: 5, label: 'Oficiales administrativos', atEpEmpleador: 0.0165 },
  { n: 6, label: 'Subalternos', atEpEmpleador: 0.0185 },
  { n: 7, label: 'Auxiliares administrativos', atEpEmpleador: 0.02 },
  { n: 8, label: 'Oficiales de 1.ª y 2.ª', atEpEmpleador: 0.022 },
  { n: 9, label: 'Oficiales de 3.ª y especialistas', atEpEmpleador: 0.0255 },
  { n: 10, label: 'Peones', atEpEmpleador: 0.0285 },
  { n: 11, label: 'Menores 18 años (cualquiera la categor.)', atEpEmpleador: 0.0315 },
]

export function getAtepEmpleadorRgl(grupo: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11): number {
  return GRUPO_COTIZACION[grupo - 1]!.atEpEmpleador
}

export function parseGrupoCotizacion(n: number): 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 {
  const g = Math.floor(n)
  if (g < 1) return 1
  if (g > 11) return 11
  return g as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11
}
