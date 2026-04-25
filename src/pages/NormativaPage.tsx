export function NormativaPage() {
  const events = [
    { year: 2012, text: 'Modelo inicia en 2012: escalas con más tramos altos, mínimos y art. 20 previos a la reforma posterior.' },
    { year: 2015, text: 'Nueva escala IRPF estatal (menos tramos). Cambio relevante en tipos y umbrales.' },
    { year: 2016, text: 'Ajuste de escala 2016–2020: tipos y límites de tramos distintos de 2015.' },
    { year: 2018, text: 'Año transitorio en reducción art. 20 (promedio de reglas pre y post reforma).' },
    { year: 2019, text: 'Nuevos parámetros art. 20 y escala alineada con periodo 2019–2020.' },
    { year: 2021, text: 'Escala con tramo adicional a tipo elevado por encima de 300.000 € (desde 2021 en el modelo).' },
    { year: 2023, text: 'MEI en cotizaciones; ajustes de mínimos exentos y parámetros art. 20.' },
    { year: 2025, text: 'Solidaridad y MEI actualizados; deducción vinculada al SMI en el modelo (2025).' },
    { year: 2026, text: 'Parámetros proyectados/configurados en el modelo para MEI, solidaridad y deducción SMI.' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mt-0 text-2xl font-semibold text-neutral-900">Línea de tiempo</h1>
        <p className="text-sm text-neutral-600">
          Hitos simplificados que explican por qué cambian bases, tramos y cotizaciones en el simulador.
          No es una relación exhaustiva de la normativa.
        </p>
      </div>

      <ol className="m-0 space-y-0 border-l border-neutral-200 pl-6">
        {events.map((e) => (
          <li key={e.year} className="relative pb-8 pl-2 last:pb-0">
            <span
              className="absolute -left-[25px] top-1.5 h-3 w-3 rounded-full border-2 border-[var(--color-accent)] bg-white"
              aria-hidden
            />
            <p className="m-0 text-sm font-semibold text-neutral-900">{e.year}</p>
            <p className="mt-1 mb-0 text-sm leading-relaxed text-neutral-700">{e.text}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
