# Simulador de nómina e IRPF

Aplicación web (React, TypeScript, Vite) para explicar el paso del salario bruto al neto en España entre **2012 y 2026**: cotizaciones a la Seguridad Social, reducción por trabajo, escala del IRPF, deducción vinculada al SMI (en los años del modelo) y tope de retención. Incluye una comparativa de **poder adquisitivo** reescalando nóminas históricas con IPC diciembre–diciembre hasta 2026.

## Requisitos

- Node.js 20+

## Comandos

```bash
npm install
npm run dev
npm run build
npm run preview
npm run test:run
npm run lint
```

## Rutas

- `/` — Landing y avisos
- `/manual` — Manual breve por capítulos (`/manual/orden`, etc.)
- `/calcular` — Asistente por pasos; query opcional `?y=AÑO&g=BRUTO_ANUAL`
- `/comparar` — Comparativa IPC; query `?y=AÑO&g=BRUTO_EN_2026`
- `/normativa` — Línea de tiempo de hitos del modelo

## Auditar los cálculos

- La lógica vive en [`src/domain/tax/`](src/domain/tax/) y está cubierta por pruebas en [`src/domain/tax/computePayroll.test.ts`](src/domain/tax/computePayroll.test.ts).
- Para contrastar con el Excel/Python original, fija casos `(año, bruto)` y comprueba `computePayrollBreakdown` (neto, IRPF, cotizaciones) con la misma precisión decimal (redondeo a 2 decimales en salidas).

## Aviso

Herramienta con **supuestos simplificados** (sin situación familiar completa ni todas las deducciones autonómicas). No sustituye asesoramiento fiscal o laboral.
