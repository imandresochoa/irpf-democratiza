import { createContext, useContext, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { getCalculatorTaxYear, type TaxYear } from '../domain/tax'

type QuickGrossContextValue = {
  quickGrossInput: string
  setQuickGrossInput: (v: string) => void
  quickCalcYear: TaxYear
  calculatorSectionRef: RefObject<HTMLDivElement | null>
}

const QuickGrossContext = createContext<QuickGrossContextValue | null>(null)

export function QuickGrossProvider({ children }: { children: ReactNode }) {
  const [quickGrossInput, setQuickGrossInput] = useState('15574,85')
  const calculatorSectionRef = useRef<HTMLDivElement | null>(null)
  const quickCalcYear = useMemo(() => getCalculatorTaxYear(), [])

  const value = useMemo<QuickGrossContextValue>(
    () => ({
      quickGrossInput,
      setQuickGrossInput,
      quickCalcYear,
      calculatorSectionRef,
    }),
    [quickGrossInput, quickCalcYear],
  )

  return <QuickGrossContext.Provider value={value}>{children}</QuickGrossContext.Provider>
}

export function useQuickGross() {
  const ctx = useContext(QuickGrossContext)
  if (ctx == null) {
    throw new Error('useQuickGross must be used within QuickGrossProvider')
  }
  return ctx
}
