import type { TaxYear } from '../tax/types'
import {
  ANCLA_EPF_2012_ANUAL_EUR,
  ANCLA_VIVIENDA_2012_EUR_M2,
  factorIpcSubgrupoDesde2012,
  factorIpvDesde2012,
  IPC_SUBGROUP_LABELS,
  VIVIENDA_TIPO_M2,
} from './series'

export type CostOfLivingCategory = 'cesta' | 'alquiler' | 'energia' | 'carburantes'

export interface MonthlyCostBreakdown {
  category: CostOfLivingCategory
  /** Etiqueta humana ya en español. */
  label: string
  /** Importe estimado mensual del año, en euros nominales (redondeo a 1 €). */
  amountMonthlyEur: number
  /** Subgrupo COICOP que aplica el factor IPC sobre el ancla EPF 2012. */
  source: { ineDataset: string; ipcSubgroup: string; anchorYear: 2012 }
}

export interface HousingCost {
  /** Precio nominal del año por metro cuadrado (€/m²) según el IPV anclado a 2012. */
  pricePerSquareMeterEur: number
  /** Coste total estimado de una vivienda tipo de 80 m². */
  totalEurForTypicalSize: number
  squareMetersTypical: typeof VIVIENDA_TIPO_M2
  source: {
    ineDataset: string
    anchorEurPerM2_2012: number
    anchorReference: string
  }
}

const CATEGORY_LABEL: Readonly<Record<CostOfLivingCategory, string>> = {
  cesta: 'Cesta de la compra familiar',
  alquiler: 'Alquiler mensual',
  energia: 'Luz y gas en casa',
  carburantes: 'Combustible',
}

/**
 * Cesta mensual nominal estimada para `year` proyectando el ancla EPF 2012 con el IPC del
 * subgrupo COICOP correspondiente. El resultado se redondea al euro entero más cercano para
 * evitar precisión espuria que la metodología no garantiza.
 */
export function costeMensual(year: TaxYear, category: CostOfLivingCategory): MonthlyCostBreakdown {
  const ineDatasetEPF = 'INE — Encuesta de Presupuestos Familiares 2012 (tabla 24900)'
  switch (category) {
    case 'cesta': {
      const factor = factorIpcSubgrupoDesde2012('01', year)
      const monthly = (ANCLA_EPF_2012_ANUAL_EUR.alimentacion * factor) / 12
      return {
        category,
        label: CATEGORY_LABEL[category],
        amountMonthlyEur: Math.round(monthly),
        source: {
          ineDataset: ineDatasetEPF,
          ipcSubgroup: `INE IPC ${IPC_SUBGROUP_LABELS['01']} (subgrupo 01)`,
          anchorYear: 2012,
        },
      }
    }
    case 'alquiler': {
      const factor = factorIpcSubgrupoDesde2012('04_1', year)
      const monthly = (ANCLA_EPF_2012_ANUAL_EUR.alquilerHogarEnAlquiler * factor) / 12
      return {
        category,
        label: CATEGORY_LABEL[category],
        amountMonthlyEur: Math.round(monthly),
        source: {
          ineDataset: ineDatasetEPF,
          ipcSubgroup: `INE IPC ${IPC_SUBGROUP_LABELS['04_1']} (subgrupo 04.1)`,
          anchorYear: 2012,
        },
      }
    }
    case 'energia': {
      const factor = factorIpcSubgrupoDesde2012('04_5', year)
      const monthly = (ANCLA_EPF_2012_ANUAL_EUR.energiaHogar * factor) / 12
      return {
        category,
        label: CATEGORY_LABEL[category],
        amountMonthlyEur: Math.round(monthly),
        source: {
          ineDataset: ineDatasetEPF,
          ipcSubgroup: `INE IPC ${IPC_SUBGROUP_LABELS['04_5']} (subgrupo 04.5)`,
          anchorYear: 2012,
        },
      }
    }
    case 'carburantes': {
      const factor = factorIpcSubgrupoDesde2012('07_2_2', year)
      const monthly = (ANCLA_EPF_2012_ANUAL_EUR.carburantes * factor) / 12
      return {
        category,
        label: CATEGORY_LABEL[category],
        amountMonthlyEur: Math.round(monthly),
        source: {
          ineDataset: ineDatasetEPF,
          ipcSubgroup: `INE IPC ${IPC_SUBGROUP_LABELS['07_2_2']} (subgrupo 07.2.2)`,
          anchorYear: 2012,
        },
      }
    }
  }
}

/**
 * Estimación del precio de la vivienda libre por m² (y total para una vivienda tipo de
 * 80 m²) en `year`, anclando el dato del 4T 2012 publicado por Mitma a la serie IPV del INE.
 * Devuelve euros nominales redondeados al euro entero.
 */
export function viviendaPropiedad(year: TaxYear): HousingCost {
  const factor = factorIpvDesde2012(year)
  const eurM2 = ANCLA_VIVIENDA_2012_EUR_M2 * factor
  return {
    pricePerSquareMeterEur: Math.round(eurM2),
    totalEurForTypicalSize: Math.round(eurM2 * VIVIENDA_TIPO_M2),
    squareMetersTypical: VIVIENDA_TIPO_M2,
    source: {
      ineDataset: 'INE — Índice de Precios de Vivienda (IPV), base 2015',
      anchorEurPerM2_2012: ANCLA_VIVIENDA_2012_EUR_M2,
      anchorReference: 'Mitma — Estadística de precios de vivienda libre, 4T 2012',
    },
  }
}

export {
  ANCLA_EPF_2012_ANUAL_EUR,
  ANCLA_VIVIENDA_2012_EUR_M2,
  factorIpcSubgrupoDesde2012,
  factorIpvDesde2012,
  IPC_SUBGROUP_DEC,
  IPC_SUBGROUP_LABELS,
  IPV_DEC,
  VIVIENDA_TIPO_M2,
} from './series'
export type { IpcSubgroupCode } from './series'
