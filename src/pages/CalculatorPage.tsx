import { useMemo, useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  computePayrollBreakdown,
  getYearParameters,
  isTaxYear,
  type TaxYear,
  TAX_YEARS,
} from '../domain/tax'
import { Disclaimer } from '../components/Disclaimer'
import { Collapsible } from '../components/Collapsible'
import { formatEur, formatPct } from '../lib/format'

function parseYear(s: string | null): TaxYear | null {
  if (!s) return null
  const n = Number(s)
  return isTaxYear(n) ? n : null
}

function parseGross(s: string | null): number | null {
  if (!s) return null
  const n = Number(s.replace(',', '.'))
  if (!Number.isFinite(n) || n < 0) return null
  return n
}

function readCalcInitialFromUrl(): { year: TaxYear; gross: string; step: number } {
  const params = new URLSearchParams(
    typeof globalThis.location !== 'undefined' ? globalThis.location.search : '',
  )
  const y = parseYear(params.get('y'))
  const g = parseGross(params.get('g'))
  return {
    year: y ?? 2026,
    gross: g !== null ? String(Math.round(g * 100) / 100) : '',
    step: g !== null ? 3 : 1,
  }
}

export function CalculatorPage() {
  const [, setSearchParams] = useSearchParams()
  const [step, setStep] = useState(() => readCalcInitialFromUrl().step)
  const [inputMode, setInputMode] = useState<'annual' | 'monthly'>('annual')
  const [grossInput, setGrossInput] = useState(() => readCalcInitialFromUrl().gross)
  const [year, setYear] = useState<TaxYear>(() => readCalcInitialFromUrl().year)

  const grossAnnual = useMemo(() => {
    const raw = Number(String(grossInput).replace(',', '.'))
    if (!Number.isFinite(raw) || raw < 0) return null
    return inputMode === 'monthly' ? raw * 12 : raw
  }, [grossInput, inputMode])

  useEffect(() => {
    if (step !== 3 || grossAnnual === null || grossAnnual <= 0) return
    const next = new URLSearchParams()
    next.set('y', String(year))
    next.set('g', String(Math.round(grossAnnual * 100) / 100))
    setSearchParams(next, { replace: true })
  }, [step, year, grossAnnual, setSearchParams])

  const breakdown = useMemo(() => {
    if (grossAnnual === null) return null
    return computePayrollBreakdown(Math.round(grossAnnual * 100) / 100, year)
  }, [grossAnnual, year])

  const params = useMemo(() => getYearParameters(year), [year])

  const canGoStep2 = grossAnnual !== null && grossAnnual > 0
  const canShowResult = canGoStep2 && step >= 3

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mt-0 text-2xl font-semibold text-neutral-900">Calcular</h1>
        <p className="text-base text-neutral-600">
          Tres pasos: importe, año fiscal, resultado.{' '}
          <Link to="/manual/orden" className="text-[var(--color-accent)] no-underline hover:underline">
            Ver orden del cálculo
          </Link>
          .
        </p>
      </div>

      <Disclaimer />

      <ol className="flex flex-wrap gap-2 text-base" aria-label="Progreso">
        {[
          { n: 1, label: 'Importe' },
          { n: 2, label: 'Año' },
          { n: 3, label: 'Resultado' },
        ].map((s) => (
          <li key={s.n}>
            <button
              type="button"
              className={[
                'rounded-full border px-3 py-1 font-medium',
                step === s.n
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                  : 'border-neutral-200 bg-white text-neutral-600',
              ].join(' ')}
              onClick={() => {
                if (s.n <= 2 || (s.n === 3 && canGoStep2)) setStep(s.n)
              }}
            >
              {s.n}. {s.label}
            </button>
          </li>
        ))}
      </ol>

      {step === 1 ? (
        <section className="space-y-4 rounded-xl border border-neutral-200 bg-[var(--color-surface-elevated)] p-6 shadow-sm">
          <fieldset className="m-0 space-y-3 border-0 p-0">
            <legend className="text-base font-semibold text-neutral-900">Importe</legend>
            <div className="flex flex-wrap gap-4">
              <label className="flex cursor-pointer items-center gap-2 text-base">
                <input
                  type="radio"
                  name="mode"
                  checked={inputMode === 'annual'}
                  onChange={() => setInputMode('annual')}
                />
                Bruto anual
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-base">
                <input
                  type="radio"
                  name="mode"
                  checked={inputMode === 'monthly'}
                  onChange={() => setInputMode('monthly')}
                />
                Bruto mensual (×12)
              </label>
            </div>
            <div>
              <label htmlFor="gross" className="block text-base font-medium text-neutral-700">
                {inputMode === 'annual' ? 'Salario bruto anual (€)' : 'Salario bruto mensual (€)'}
              </label>
              <input
                id="gross"
                type="text"
                inputMode="decimal"
                className="mt-1 w-full max-w-xs rounded-lg border border-neutral-300 px-3 py-2 text-base"
                value={grossInput}
                onChange={(e) => setGrossInput(e.target.value)}
                placeholder="Ej. 35000"
                autoComplete="off"
              />
              {grossAnnual !== null ? (
                <p className="mt-1 text-xs text-neutral-500">
                  Equivale a {formatEur(grossAnnual)} / año
                </p>
              ) : null}
            </div>
          </fieldset>
          <button
            type="button"
            className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-base font-medium text-white disabled:opacity-40"
            disabled={!canGoStep2}
            onClick={() => setStep(2)}
          >
            Continuar
          </button>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="space-y-4 rounded-xl border border-neutral-200 bg-[var(--color-surface-elevated)] p-6 shadow-sm">
          <h2 className="mt-0 text-base font-semibold text-neutral-900">Año fiscal</h2>
          <div>
            <label htmlFor="year" className="block text-base font-medium text-neutral-700">
              Año
            </label>
            <select
              id="year"
              className="mt-1 w-full max-w-xs rounded-lg border border-neutral-300 bg-white px-3 py-2 text-base"
              value={year}
              onChange={(e) => setYear(Number(e.target.value) as TaxYear)}
            >
              {TAX_YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-base font-medium text-neutral-800"
              onClick={() => setStep(1)}
            >
              Atrás
            </button>
            <button
              type="button"
              className="rounded-lg bg-[var(--color-accent)] px-4 py-2 text-base font-medium text-white"
              onClick={() => setStep(3)}
            >
              Ver resultado
            </button>
          </div>
        </section>
      ) : null}

      {step === 3 && canShowResult && breakdown ? (
        <section className="space-y-6">
          <div className="rounded-xl border border-neutral-200 bg-[var(--color-surface-elevated)] p-6 shadow-sm">
            <p className="m-0 text-base text-neutral-500">Salario neto anual estimado ({year})</p>
            <p className="mt-1 mb-0 text-3xl font-semibold tracking-tight text-neutral-900">
              {formatEur(breakdown.salarioNeto)}
            </p>
            <p className="mt-2 text-base text-neutral-600">
              ≈ {formatEur(breakdown.salarioNeto / 12)} / mes (12 pagas)
            </p>
            <p className="mt-3 text-xs text-neutral-500">
              Bruto considerado: {formatEur(breakdown.salarioBruto)} · IRPF retenido:{' '}
              {formatEur(breakdown.irpfFinal)} · Cot. trabajador: {formatEur(breakdown.cotTrabajador)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-base"
                onClick={() => setStep(2)}
              >
                Cambiar año
              </button>
              <button
                type="button"
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-base"
                onClick={() => setStep(1)}
              >
                Cambiar importe
              </button>
              <button
                type="button"
                className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-base"
                onClick={() => {
                  const t = [
                    `Año: ${year}`,
                    `Bruto anual: ${formatEur(breakdown.salarioBruto)}`,
                    `Neto anual (estim.): ${formatEur(breakdown.salarioNeto)}`,
                    `IRPF: ${formatEur(breakdown.irpfFinal)}`,
                    `Cot. trabajador: ${formatEur(breakdown.cotTrabajador)}`,
                  ].join('\n')
                  void navigator.clipboard.writeText(t)
                }}
              >
                Copiar resumen
              </button>
            </div>
          </div>

          <Collapsible title="Desglose por etapas" defaultOpen>
            <dl className="m-0 grid gap-2 sm:grid-cols-2">
              <DtDd label="Coste laboral (aprox.)" value={formatEur(breakdown.costeLaboral)} />
              <DtDd label="Cotización empresa" value={formatEur(breakdown.cotEmpresa)} />
              <DtDd label="Cotización trabajador" value={formatEur(breakdown.cotTrabajador)} />
              <DtDd label="Rendimiento previo" value={formatEur(breakdown.rendimientoPrevio)} />
              <DtDd label="Gastos fijos (art. 19)" value={formatEur(breakdown.gastosFijos)} />
              <DtDd label="Reducción art. 20" value={formatEur(breakdown.reduccionTrabajo)} />
              <DtDd label="Base imponible general" value={formatEur(breakdown.baseImponible)} />
              <DtDd label="Cuota íntegra" value={formatEur(breakdown.cuotaIntegra)} />
              <DtDd label="Cuota mínimo personal" value={formatEur(breakdown.cuotaMinimoPersonal)} />
              <DtDd label="Cuota teórica" value={formatEur(breakdown.cuotaTeorica)} />
              <DtDd label="Deducción SMI (modelo)" value={formatEur(breakdown.deduccionSmi)} />
              <DtDd label="Cuota tras deducción" value={formatEur(breakdown.cuotaTrasSmi)} />
              <DtDd label="Límite retención (43%)" value={formatEur(breakdown.limiteRetencion43)} />
              <DtDd label="IRPF final" value={formatEur(breakdown.irpfFinal)} />
            </dl>
          </Collapsible>

          <Collapsible title="Cuotas por tramo IRPF">
            <ul className="m-0 list-none space-y-1 p-0">
              {breakdown.cuotasPorTramo.map((t) => (
                <li key={t.index} className="flex justify-between gap-4 text-base">
                  <span>
                    Tramo {t.index} ({formatPct(t.ratePercent, 1)})
                  </span>
                  <span>{formatEur(t.amount)}</span>
                </li>
              ))}
            </ul>
          </Collapsible>

          <Collapsible title="Parámetros del año">
            <dl className="m-0 grid gap-2 text-base sm:grid-cols-2">
              <DtDd label="Base máx. cotización" value={formatEur(params.baseMax, 0)} />
              <DtDd
                label="SS empleador (sin MEI)"
                value={formatPct(
                  Object.values(params.ssTipos).reduce((s, x) => s + x[0], 0) * 100,
                )}
              />
              <DtDd
                label="SS trabajador (sin MEI)"
                value={formatPct(
                  Object.values(params.ssTipos).reduce((s, x) => s + x[1], 0) * 100,
                )}
              />
              <DtDd label="MEI empleador / trabajador" value={`${formatPct(params.mei[0] * 100, 3)} / ${formatPct(params.mei[1] * 100, 3)}`} />
              <DtDd label="Mínimo exento retención" value={formatEur(params.minimoExento, 0)} />
              <DtDd label="Mínimo contribuyente" value={formatEur(params.irpfMinimo, 0)} />
            </dl>
            <p className="mt-3 text-xs text-neutral-500">
              Art. 20 metadatos: umbral inf. {String(params.art20Meta.uInf)}, reducción máx.{' '}
              {String(params.art20Meta.rMax)}.
            </p>
          </Collapsible>

          <p className="text-base">
            <Link to={`/comparar?y=${year}&g=${Math.round((grossAnnual ?? 0) * 100) / 100}`} className="text-[var(--color-accent)] no-underline hover:underline">
              Comparar poder adquisitivo con otros años →
            </Link>
          </p>
        </section>
      ) : null}
    </div>
  )
}

function DtDd({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-neutral-500">{label}</dt>
      <dd className="m-0 font-medium text-neutral-900">{value}</dd>
    </>
  )
}
