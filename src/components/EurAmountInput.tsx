import { useEffect, useState } from 'react'
import { formatEur, formatEurNumber, parseEurInputToNumber } from '../lib/format'

function formatBlurredDisplay(s: string): string {
  const n = parseEurInputToNumber(s)
  if (n === null) return s
  return formatEur(n, 2)
}

export type EurAmountInputProps = {
  id?: string
  className?: string
  value: string
  onValueChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  /** Décimales al editar o mostrar; por defecto 2 (céntimos). */
  fractionDigits?: number
}

/**
 * Texto: en foco sin € (solo número es-ES); al perder el foco, miles, coma decimales y €.
 * El `value` en el padre puede ser "35000", "15.574,85" o "15.574,85 €" — se normaliza al blur.
 */
export function EurAmountInput({
  id,
  className,
  value,
  onValueChange,
  placeholder,
  autoComplete = 'off',
  fractionDigits = 2,
}: EurAmountInputProps) {
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    if (!focused) {
      setDraft(value)
    }
  }, [value, focused])

  const show = focused ? draft : formatBlurredDisplay(value)

  return (
    <input
      id={id}
      type="text"
      inputMode="decimal"
      className={className}
      value={show}
      autoComplete={autoComplete}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value
        setDraft(v)
        onValueChange(v)
      }}
      onFocus={() => {
        setFocused(true)
        const n = parseEurInputToNumber(value)
        if (n !== null) {
          const next = formatEurNumber(n, fractionDigits)
          setDraft(next)
          onValueChange(next)
        } else {
          setDraft(value)
        }
      }}
      onBlur={(e) => {
        setFocused(false)
        const n = parseEurInputToNumber(e.currentTarget.value)
        if (n === null) {
          onValueChange('')
        } else {
          onValueChange(formatEur(n, fractionDigits))
        }
      }}
    />
  )
}
