const CURRENCY_STRIP = /[\s\u00A0€]/g

/** Fuerza separador de miles aun en cifras de 4 dígitos (p. ej. 2.000, no 2000). */
const groupingEs = { useGrouping: 'always' } as const satisfies Record<string, unknown>

export function formatEur(n: number, fractionDigits = 2): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    ...groupingEs,
  } as unknown as Intl.NumberFormatOptions).format(n)
}

/** Número en español (puntos miles, coma decimal), sin símbolo de moneda. */
export function formatEurNumber(n: number, fractionDigits = 2): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    ...groupingEs,
  } as unknown as Intl.NumberFormatOptions).format(n)
}

/** Misma forma que `formatEurNumber` pero sin separador de miles (mejor al editar). */
export function formatEurNumberNoGrouping(n: number, fractionDigits = 2): string {
  return new Intl.NumberFormat('es-ES', {
    useGrouping: false,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  } as unknown as Intl.NumberFormatOptions).format(n)
}

/**
 * Interpreta cadenas como "15574,85", "15.574,85" o "15.574,85 €" (y variantes mientras se edita).
 * Devuelve null si no hay un número finito o la cadena está vacía.
 */
export function parseEurInputToNumber(s: string): number | null {
  const t = s.trim().replace(CURRENCY_STRIP, '')
  if (t === '') return null
  if (t.includes(',')) {
    const lastComma = t.lastIndexOf(',')
    const intPart = t.slice(0, lastComma).replace(/\./g, '')
    const decPart = t.slice(lastComma + 1)
    if (!/^\d+$/.test(intPart) || !/^\d+$/.test(decPart)) return null
    return Number(`${intPart}.${decPart}`)
  }
  if (!t.includes('.')) {
    const n = Number(t)
    return Number.isFinite(n) ? n : null
  }
  const parts = t.split('.')
  if (parts.length > 2) {
    const n = Number(t.replace(/\./g, ''))
    return Number.isFinite(n) ? n : null
  }
  const [a, b] = parts
  if (b && b.length === 3 && /^\d+$/.test(a) && /^\d+$/.test(b)) {
    return Number(a + b)
  }
  if (b && b.length <= 2 && a !== undefined) {
    return Number(`${a}.${b}`)
  }
  const n = Number(t)
  return Number.isFinite(n) ? n : null
}

export function formatPct(n: number, fractionDigits = 2): string {
  return `${new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    ...groupingEs,
  } as unknown as Intl.NumberFormatOptions).format(n)} %`
}
