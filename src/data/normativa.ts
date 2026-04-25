/**
 * Enlaces a fuentes oficiales (BOE, Seguridad Social, AEAT).
 * relevance: 3 = hito clave, 2 = relevante, 1 = apoyo o contexto (afecta al tamaño del nodo, no a la ruta)
 */
export type NormativaRelevance = 1 | 2 | 3

export interface NormativaItem {
  year: number
  relevance: NormativaRelevance
  /** Nombre de la norma (el año se muestra en el título al renderizar) */
  title: string
  href: string
  description: string
}

/** Orden cronológico; puede haber varias entradas por año */
export const NORMATIVA_TIMELINE: readonly NormativaItem[] = [
  {
    year: 2006,
    relevance: 3,
    title: 'Ley 35/2006 del IRPF (texto consolidado en BOE)',
    href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764',
    description:
      'Ley básica del impuesto. Las sucesivas reformas se incorporan al texto refundido: escalas, reducciones por trabajo, mínimos y retenciones en el marco de este cuerpo legal.',
  },
  {
    year: 2012,
    relevance: 2,
    title: 'R.D.-ley 12/2012, medidas tributarias y déficit público',
    href: 'https://www.boe.es/buscar/doc.php?id=BOE-A-2012-4441',
    description:
      'Diversas modificaciones fiscales; entre ellas, ajustes al IRPF y disposición de declaración tributaria especial (contexto de presión sobre el sistema en la crisis de 2012).',
  },
  {
    year: 2012,
    relevance: 3,
    title: 'R.D.-ley 20/2012, estabilidad presupuestaria y competitividad',
    href: 'https://www.boe.es/eli/es/rdl/2012/07/13/20/con',
    description:
      'Paquete de medidas en plena crisis que incidió en tributación, gasto y senda de consolidación; marco de referencia para el periodo 2012–2014 en el simulador.',
  },
  {
    year: 2014,
    relevance: 3,
    title: 'Ley 26/2014, reforma del IRPF y otras normas tributarias',
    href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2014-12327',
    description:
      'Reforma estructural: menos tramos de la escala estatal, nuevos mínimos y reordenación de reducciones y gastos deducibles. Aplicable en 2015 y años siguientes bajo su redacción.',
  },
  {
    year: 2015,
    relevance: 1,
    title: 'Agencia Tributaria — IRPF (normativa e información)',
    href: 'https://sede.agenciatributaria.gob.es/Sede/irpf.shtml',
    description:
      'Portal oficial de la AEAT: guías, calendario y novedades de normativa. Complementa la lectura de la LIRPF con criterios de aplicación y modelos.',
  },
  {
    year: 2015,
    relevance: 2,
    title: 'Seguridad Social — Cotización y recaudación (Régimen General)',
    href: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/CotizacionRecaudacionTrabajadores/1105',
    description:
      'Base reguladora de la cotización, base máxima y tipos de cotización. Encaje con el cálculo de cotizaciones usado en el simulador.',
  },
  {
    year: 2016,
    relevance: 1,
    title: 'Texto refundido de la LGSS (R.D.legislativo 8/2015, de 30 de octubre)',
    href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724',
    description:
      'Cuerpo legal de la Seguridad Social: contingencias, bases y cotización. Base para tipos, MEI, carga de solidaridad y complementos posteriores según se incorporen al texto.',
  },
  {
    year: 2018,
    relevance: 3,
    title: 'Ley 6/2018, PGE 2018 (régimen transitorio art. 20 LIRPF)',
    href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2018-9268',
    description:
      'Presupuestos de 2018: ajuste de la reducción por rentas del trabajo y disposición adicional que regula un régimen transitorio en el ejercicio 2018, reflejado en el simulador.',
  },
  {
    year: 2021,
    relevance: 2,
    title: 'Ley 21/2021, garantía del poder adquisitivo y sostenibilidad de pensiones',
    href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-21652',
    description:
      'Reforma estructural de pensiones: base para el Mecanismo de Equidad Intergeneracional (MEI) y la sustitución del factor de sostenibilidad; incide en la LGSS y en las cotizaciones a partir de 2023.',
  },
  {
    year: 2021,
    relevance: 2,
    title: 'Ley 22/2021, PGE 2022 (medidas fiscales y previsiones de cotización)',
    href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2021-21653',
    description:
      'Presupuestos del Estado para 2022: ajustes y bases en tributación y en cotización, IPREM y otras previsiones que acompañan a la aplicación del IRPF y la SS en el periodo 2021–2022.',
  },
  {
    year: 2023,
    relevance: 3,
    title: 'R.D.-ley 2/2023, MEI y carga solidaria (LGSS y pensiones)',
    href: 'https://www.boe.es/buscar/act.php?id=BOE-A-2023-6967',
    description:
      'Desarrolla y fija tramos de cotización de solidaridad y el Mecanismo de Equidad Intergeneracional a partir de 2023, con efecto directo en el paso de bruto a neto del modelo.',
  },
  {
    year: 2024,
    relevance: 1,
    title: 'Seguridad Social — Sede (información, servicios, novedades)',
    href: 'https://www.seg-social.es/wps/portal/wss/internet/Trabajadores/',
    description:
      'Portal de la Tesorería General de la Seguridad Social: circulares, tablas e información de cotización que complementa la LGSS y las normas de desarrollo anual.',
  },
]

/** Radio del nodo en el SVG (1 = menor, 3 = mayor relevancia) */
export function nodeRadiusPx(r: NormativaRelevance): number {
  const map: Record<NormativaRelevance, number> = { 1: 5, 2: 7, 3: 10 }
  return map[r]
}
