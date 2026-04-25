# Referencia de cálculo

- **`auditoria_integral_nominas_irpf.py`**: coloca aquí el script Python canónico (auditoría nóminas + IRPF + inflación 2012–2026). Es la **fuente de verdad** que debe seguir el motor TypeScript en `src/domain/tax/`.
- Resumen y mapa a los módulos TS: `docs/CALCULOS_FUENTE_DE_VERDAD.md`.

No borres el `.py` de referencia al refactorizar: actualízalo cuando cambie la lógica normativa o el IPC.
