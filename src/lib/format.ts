export function formatEur(n: number, fractionDigits = 2): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(n)
}

export function formatPct(n: number, fractionDigits = 2): string {
  return `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(n)} %`
}
