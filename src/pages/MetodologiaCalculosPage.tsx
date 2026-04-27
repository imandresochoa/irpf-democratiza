const prose =
  'max-w-3xl text-base leading-relaxed text-neutral-700 [font-family:var(--font-serif)] sm:text-lg'
const h2 = 'mt-10 mb-3 text-xl font-semibold text-neutral-900 [font-family:var(--font-serif)] sm:text-2xl'
const h3 = 'mt-6 mb-2 text-lg font-semibold text-neutral-900 [font-family:var(--font-serif)]'
const formula =
  'mt-2 inline-block rounded-md border border-neutral-200/80 bg-white/70 px-3 py-2 text-sm font-medium text-neutral-900 [font-family:var(--font-sans)] sm:text-base'
const example = 'mt-2 m-0 max-w-3xl text-sm text-neutral-600 [font-family:var(--font-sans)] sm:text-base'

export function MetodologiaCalculosPage() {
  return (
    <article className="pb-16">
      <h1 className="m-0 text-3xl font-semibold leading-tight tracking-[-0.02em] text-neutral-900 [font-family:var(--font-serif)] sm:text-4xl">
        Cómo se calcula
      </h1>
      <p className={`mt-4 m-0 ${prose}`}>
        En esta página tienes las fórmulas que usamos en los gráficos y resúmenes, explicadas en pocas
        líneas. Todas las cifras de la app salen de aplicar estas fórmulas a tu salario bruto y al IPC de
        cada año.
      </p>

      <h2 className={h2}>Conceptos</h2>
      <ul className={`mt-2 list-disc space-y-2 pl-6 ${prose}`}>
        <li>
          <strong className="font-semibold text-neutral-900">Bruto</strong>: lo que cuesta tu nómina antes
          de impuestos y cotizaciones.
        </li>
        <li>
          <strong className="font-semibold text-neutral-900">Neto</strong>: lo que te queda después de
          descontar IRPF y la cotización del trabajador a la Seguridad Social.
        </li>
        <li>
          <strong className="font-semibold text-neutral-900">IRPF</strong>: el impuesto sobre la renta que
          se te retiene cada año.
        </li>
        <li>
          <strong className="font-semibold text-neutral-900">IPC acumulado</strong>: cuánto han subido los
          precios desde un año hasta otro.
        </li>
        <li>
          <strong className="font-semibold text-neutral-900">Euros constantes</strong>: importes
          comparables entre años, ajustados por inflación.
        </li>
      </ul>

      <h2 className={h2}>De bruto y neto</h2>

      <h3 className={h3}>Neto del año</h3>
      <p className={`m-0 ${prose}`}>
        Tu neto de un año es lo que te queda del bruto después de impuestos y cotizaciones de ese año.
      </p>
      <div className={formula}>Neto = Bruto − IRPF − Cotización trabajador</div>
      <p className={example}>Ejemplo: bruto 30.000 €, IRPF 4.200 €, cotización 1.800 € → neto 24.000 €.</p>

      <h3 className={h3}>Tipo efectivo de IRPF</h3>
      <p className={`m-0 ${prose}`}>
        Es el porcentaje real de tu bruto que se va en IRPF.
      </p>
      <div className={formula}>% IRPF = (IRPF / Bruto) × 100</div>
      <p className={example}>Ejemplo: 4.200 € / 30.000 € × 100 = 14,0 %.</p>

      <h2 className={h2}>De inflación</h2>

      <h3 className={h3}>IPC acumulado desde 2012</h3>
      <p className={`m-0 ${prose}`}>
        Encadenamos las variaciones anuales del IPC para saber cuánto han subido los precios entre 2012 y
        otro año.
      </p>
      <div className={formula}>
        IPC acumulado<sub>2012→t</sub> = (1 + IPC<sub>2013</sub>) × (1 + IPC<sub>2014</sub>) × … × (1 + IPC
        <sub>t</sub>)
      </div>
      <p className={example}>
        Ejemplo: si los precios han subido un 25 % entre 2012 y hoy, el factor acumulado es 1,25.
      </p>

      <h3 className={h3}>Euros del año t a euros de 2012</h3>
      <p className={`m-0 ${prose}`}>
        Para comparar importes entre años, los expresamos en euros de 2012 dividiendo por el IPC
        acumulado.
      </p>
      <div className={formula}>Importe en euros de 2012 = Importe del año t / IPC acumulado<sub>2012→t</sub></div>
      <p className={example}>Ejemplo: 25.000 € de hoy / 1,25 = 20.000 € de 2012.</p>

      <h2 className={h2}>De los gráficos</h2>

      <h3 className={h3}>Línea de IPC</h3>
      <p className={`m-0 ${prose}`}>
        Cuánto han subido los precios desde 2012 hasta cada año, en porcentaje.
      </p>
      <div className={formula}>IPC del gráfico = (IPC acumulado<sub>2012→t</sub> − 1) × 100</div>

      <h3 className={h3}>Línea de poder adquisitivo (neto real)</h3>
      <p className={`m-0 ${prose}`}>
        Mide cómo evoluciona tu poder adquisitivo si tu bruto es el mismo en todos los años. Comparamos
        el neto de cada año con el neto de 2012, ambos expresados en euros de 2012.
      </p>
      <div className={formula}>
        % vs 2012 = (Neto<sub>t</sub> en € de 2012 / Neto<sub>2012</sub> en € de 2012 − 1) × 100
      </div>

      <h3 className={h3}>Línea de IRPF</h3>
      <p className={`m-0 ${prose}`}>
        Mide qué porcentaje de tu bruto se va en IRPF cada año.
      </p>
      <div className={formula}>% IRPF<sub>t</sub> = (IRPF<sub>t</sub> / Bruto) × 100</div>

      <h2 className={h2}>De los datos de arriba del gráfico</h2>

      <h3 className={h3}>Neto del año seleccionado</h3>
      <p className={`m-0 ${prose}`}>
        Es el neto que tendrías ese año aplicando la norma fiscal de ese año, sin ajustar por inflación.
      </p>
      <div className={formula}>Neto<sub>t</sub> = Bruto − IRPF<sub>t</sub> − Cotización<sub>t</sub></div>

      <h3 className={h3}>Variación del poder adquisitivo</h3>
      <p className={`m-0 ${prose}`}>
        Diferencia, en euros de 2012, entre el neto de tu año seleccionado y el neto que habrías tenido
        en 2012 con el mismo bruto.
      </p>
      <div className={formula}>
        ΔPoder = Neto<sub>t</sub> en € de 2012 − Neto<sub>2012</sub> en € de 2012
      </div>

      <h2 className={h2}>Si el IRPF se ajustara a la inflación</h2>
      <p className={`m-0 ${prose}`}>
        Cuando activas “Deflactar IRPF”, calculamos cuánto sería tu neto si los tramos y mínimos del IRPF
        se hubieran subido al ritmo del IPC desde 2012, y comparamos con la situación real.
      </p>
      <div className={formula}>
        Mejora anual = Neto con IRPF deflactado − Neto con IRPF actual
      </div>

      <h2 className={h2}>Coste de vida del año seleccionado</h2>
      <p className={`m-0 ${prose}`}>
        En la sección “Nómina año a año”, junto al recibo del año, mostramos cinco partidas habituales
        del hogar y qué porcentaje supondrían sobre tu neto si tuvieras ese mismo bruto en ese
        ejercicio. Cada partida tiene un punto de partida en euros de 2012 (encuesta oficial del INE)
        que proyectamos a cada año aplicando el IPC del subgrupo correspondiente.
      </p>

      <h3 className={h3}>Cesta, alquiler, luz y gas, combustible</h3>
      <p className={`m-0 ${prose}`}>
        Mismo método para las cuatro: tomamos el gasto medio anual del hogar en 2012 según la Encuesta
        de Presupuestos Familiares y lo movemos cada año con el IPC oficial del subgrupo concreto.
      </p>
      <div className={formula}>
        Importe<sub>t</sub> = Gasto<sub>2012</sub> × Factor IPC subgrupo<sub>2012→t</sub>
      </div>
      <p className={`m-0 ${prose}`}>
        El factor IPC del subgrupo es el producto encadenado de las variaciones anuales diciembre a
        diciembre que publica el INE para cada cesta:
      </p>
      <ul className={`mt-2 list-disc space-y-2 pl-6 ${prose}`}>
        <li>
          <strong className="font-semibold text-neutral-900">Cesta de la compra familiar</strong>:
          subgrupo 01,
          “Alimentos y bebidas no alcohólicas”.
        </li>
        <li>
          <strong className="font-semibold text-neutral-900">Alquiler mensual</strong>: subgrupo 04.1,
          “Alquileres reales por la vivienda”.
        </li>
        <li>
          <strong className="font-semibold text-neutral-900">Luz y gas en casa</strong>: subgrupo 04.5,
          “Electricidad, gas y otros combustibles”.
        </li>
        <li>
          <strong className="font-semibold text-neutral-900">Combustible</strong>: subclase 07.2.2,
          “Carburantes y lubricantes para vehículos personales”.
        </li>
      </ul>
      <p className={example}>
        Para mostrar el peso sobre tu neto usamos tu neto del año dividido entre 12: porcentaje sobre
        el neto mensual.
      </p>
      <div className={formula}>% sobre tu neto = (Importe<sub>t</sub> / (Neto<sub>t</sub> / 12)) × 100</div>

      <h3 className={h3}>Vivienda en propiedad (€/m² y total 80 m²)</h3>
      <p className={`m-0 ${prose}`}>
        Partimos del precio medio del metro cuadrado de la vivienda libre publicado para 2012 y lo
        movemos cada año con el Índice de Precios de Vivienda (IPV) del INE.
      </p>
      <div className={formula}>
        €/m²<sub>t</sub> = €/m²<sub>2012</sub> × Factor IPV<sub>2012→t</sub>
      </div>
      <div className={formula}>Total piso 80 m²<sub>t</sub> = €/m²<sub>t</sub> × 80</div>
      <p className={`m-0 ${prose}`}>
        El indicador “años de neto” es cuántos años de tu salario neto del año necesitarías para pagar
        ese piso, sin contar impuestos ni intereses:
      </p>
      <div className={formula}>Años de neto = Total piso<sub>t</sub> / Neto<sub>t</sub></div>

      <h3 className={h3}>Fuentes</h3>
      <ul className={`mt-2 list-disc space-y-2 pl-6 ${prose}`}>
        <li>
          INE — Índice de Precios de Consumo (IPC), índices nacionales por subgrupo y subclase ECOICOP.
        </li>
        <li>
          INE — Encuesta de Presupuestos Familiares 2012, gasto medio anual por hogar como ancla.
        </li>
        <li>INE — Índice de Precios de Vivienda (IPV), base 2015.</li>
        <li>
          Ministerio de Transportes y Movilidad — “Estadística de precios de vivienda libre”, 4T 2012,
          como referencia inicial en €/m².
        </li>
      </ul>
    </article>
  )
}
