import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { formatEur, formatEurNumber, formatEurNumberNoGrouping, parseEurInputToNumber } from '../lib/format'

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
  /** Si es true, al enfocar no se muestran puntos de miles (solocoma decimal). */
  noGroupingOnFocus?: boolean
  /** Selecciona todo el texto al enfocar (sustituir de un golpe). */
  selectAllOnFocus?: boolean
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
  noGroupingOnFocus = false,
  selectAllOnFocus = false,
}: EurAmountInputProps) {
  const [focused, setFocused] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingSelectAllRef = useRef(false)

  useEffect(() => {
    if (!focused) {
      setDraft(value)
    }
  }, [value, focused])

  const show = focused ? draft : formatBlurredDisplay(value)

  useLayoutEffect(() => {
    if (!selectAllOnFocus || !pendingSelectAllRef.current || !focused) return
    inputRef.current?.select()
    pendingSelectAllRef.current = false
  }, [selectAllOnFocus, focused, show])

  return (
    <input
      ref={inputRef}
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
      onFocus={(e) => {
        setFocused(true)
        const n = parseEurInputToNumber(value)
        if (n !== null) {
          const fmt = noGroupingOnFocus ? formatEurNumberNoGrouping : formatEurNumber
          const next = fmt(n, fractionDigits)
          setDraft(next)
          onValueChange(next)
        } else {
          setDraft(value)
        }
        if (selectAllOnFocus) {
          pendingSelectAllRef.current = true
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
