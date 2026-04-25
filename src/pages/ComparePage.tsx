import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { computeInflationComparisonRow, isTaxYear, type TaxYear, TAX_YEARS } from '../domain/tax'
import { Disclaimer } from '../components/Disclaimer'
import { EurAmountInput } from '../components/EurAmountInput'
import { formatEur, parseEurInputToNumber } from '../lib/format'

export function ComparePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const yearHist = useMemo((): TaxYear => {
    const y = Number(searchParams.get('y'))
    return isTaxYear(y) ? y : 2012
  }, [searchParams])

  const gross2026Str = searchParams.get('g') ?? '50000'
  const grossParsed = parseEurInputToNumber(gross2026Str)
  const grossNum = grossParsed !== null && grossParsed >= 0 ? grossParsed : 0

  const row = useMemo(() => {
    if (grossNum <= 0) return null
    return computeInflationComparisonRow(yearHist, Math.round(grossNum * 100) / 100)
  }, [yearHist, grossNum])

  const setYearHist = (y: TaxYear) => {
    const next = new URLSearchParams(searchParams)
    next.set('y', String(y))
    setSearchParams(next, { replace: true })
  }

  const setGrossStr = (s: string) => {
    const next = new URLSearchParams(searchParams)
    if (s.trim() === '') next.delete('g')
    else next.set('g', s)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mt-0 text-2xl font-semibold text-neutral-900">Comparar (IPC a 2026)</h1>
        <p className="text-base text-neutral-600">
          Fija un bruto en euros de 2026 y un año histórico. Se calcula el bruto nominal que sería
          equivalente por IPC y el neto reescalado vs el neto si cobrases ese mismo bruto en 2026.
        </p>
      </div>

      <Disclaimer />

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="gh" className="block text-base font-medium text-neutral-700">
            Salario bruto equivalente en 2026 (€)
          </label>
          <EurAmountInput
            id="gh"
            className="mt-1 w-full rounded-lg bg-neutral-100 px-3 py-2 text-base placeholder:text-neutral-700"
            value={gross2026Str}
            onValueChange={setGrossStr}
            placeholder="Ej. 50.000,00 €"
          />
        </div>
        <div>
          <label htmlFor="yh" className="block text-base font-medium text-neutral-700">
            Año a comparar
          </label>
          <select
            id="yh"
            className="mt-1 w-full rounded-lg bg-neutral-100 px-3 py-2 text-base"
            value={yearHist}
            onChange={(e) => setYearHist(Number(e.target.value) as TaxYear)}
          >
            {TAX_YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </section>

      {row ? (
        <section className="space-y-3">
          <h2 className="mt-0 text-base font-semibold text-neutral-900">Resultado</h2>
          <dl className="m-0 grid gap-2 text-base sm:grid-cols-2">
            <div>
              <dt className="text-neutral-600">IPC acumulado hasta 2026</dt>
              <dd className="m-0 font-medium">{row.ipcAcumuladoPercent} %</dd>
            </div>
            <div>
              <dt className="text-neutral-600">Bruto nominal en {yearHist}</dt>
              <dd className="m-0 font-medium">{formatEur(row.salarioBrutoNominal)}</dd>
            </div>
            <div>
              <dt className="text-neutral-600">Neto histórico (€ 2026)</dt>
              <dd className="m-0 font-medium">{formatEur(row.netoRealEnSuAnoEur2026)}</dd>
            </div>
            <div>
              <dt className="text-neutral-600">Neto con mismo bruto nominal en 2026</dt>
              <dd className="m-0 font-medium">{formatEur(row.netoReal2026)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-neutral-600">Diferencia anual de poder adquisitivo (aprox.)</dt>
              <dd className="m-0 text-lg font-semibold text-neutral-900">
                {formatEur(row.perdidaGananciaAnualPoderAdq)}{' '}
                <span className="text-base font-normal text-neutral-600">
                  ({formatEur(row.variacionPoderAdquisitivoMensual)} / mes)
                </span>
              </dd>
            </div>
          </dl>
        </section>
      ) : (
        <p className="text-base text-neutral-600">Introduce un importe bruto válido.</p>
      )}

      <p className="text-base">
        <Link to="/calcular" className="text-[var(--color-accent)] no-underline hover:underline">
          ← Volver al calculador
        </Link>
      </p>
    </div>
  )
}
