# Cálculos: fuente de verdad y port a TypeScript

## Autoridad

El script Python de **auditoría integral de nóminas e inflación (2012–2026)**, aportado por el autor del proyecto, es la **especificación canónica** de:

- Parámetros por ejercicio (cotización, tramos IRPF, mínimos, reducciones, etc.)
- Lógica de nómina agregada / retención (`procesar_ano` o equivalente)
- Comparativas con **IPC diciembre–diciembre** y reexpresión a **euros 2026**

Ese script debe existir en el repositorio como archivo Python versionado. Colócalo o mantenlo en:

- `reference/auditoria_integral_nominas_irpf.py`

Si aún no está el fichero completo, copia ahí el script original; no dejes solo un stub vacío a largo plazo.

## Equivalencia en la app (producción)

| Concepto (Python) | Código TypeScript |
|-------------------|-------------------|
| `obtener_parametros` / tablas anuales | `src/domain/tax/parameters.ts` → `getYearParameters` |
| Cálculo de nómina / IRPF (desglose) | `src/domain/tax/computePayroll.ts` → `computePayrollBreakdown`, `computeNominaAgregada` |
| IPC acumulado a 2026 | `src/domain/tax/inflation.ts` → `inflationFactorTo2026` (misma cadena 1+IPC) |
| Comparativa a euros 2026 | `src/domain/tax/compare.ts` → `computeInflationComparisonRow` |
| Gráfica “Evolución del neto” (home) | Misma fila que “Comparar”: `netoRealEnSuAnoEur2026` por año |

Cualquier ajuste normativo o de redondeo debe **replicarse primero** en el script de referencia (o al menos documentarse) y luego en TypeScript, para no divergir.
