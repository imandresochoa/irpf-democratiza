import { useEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import type { CSSProperties } from 'react'
import { formatEur, formatEurNumber, formatEurNumberNoGrouping, parseEurInputToNumber } from '../lib/format'

function formatBlurredDisplay(s: string): string {
  const n = parseEurInputToNumber(s)
  if (n === null) return s
  return formatEur(n, 2)
}

export type EurAmountInputProps = {
  id?: string
  className?: string
  style?: CSSProperties
  value: string
  onValueChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  /** Décimales al editar o mostrar; por defecto 2 (céntimos). */
  fractionDigits?: number
  /**
   * Al enfocar, sin puntos de miles (solo edición con coma decimal). Sin foco, miles + €. Por defecto true.
   */
  noGroupingOnFocus?: boolean
}

/**
 * Sin foco: miles (puntos), coma decimales y €. Con foco: sin puntos de miles, sin € (texto puro de edición).
 * El `value` en el padre puede ser "35000", "15.574,85" o "15.574,85 €" — se normaliza al blur.
 */
export function EurAmountInput({
  id,
  className,
  style,
  value,
  onValueChange,
  placeholder,
  autoComplete = 'off',
  fractionDigits = 2,
  noGroupingOnFocus = true,
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
      style={style}
      value={show}
      autoComplete={autoComplete}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value
        setDraft(v)
        onValueChange(v)
      }}
      onFocus={() => {
        const n = parseEurInputToNumber(value)
        if (n !== null) {
          const fmt = noGroupingOnFocus ? formatEurNumberNoGrouping : formatEurNumber
          const next = fmt(n, fractionDigits)
          flushSync(() => {
            setFocused(true)
            setDraft(next)
          })
          onValueChange(next)
        } else {
          flushSync(() => {
            setFocused(true)
            setDraft(value)
          })
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
