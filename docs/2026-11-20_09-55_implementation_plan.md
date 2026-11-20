# Plan de Implementación: Formato de Versión del DMG con Timestamp

## Objetivo
Estandarizar el nombre de los paquetes DMG generados por el proyecto al formato:
`Citas-1.0.[año YYYY].[mes MM].[dia DD].[Hora HHMM].dmg` (ej. `Citas-1.0.2026.11.20.0955.dmg`).

## Tareas
1. **Actualizar `scripts/build-dmg.sh`**:
   - Generar dinámicamente la variable `TIMESTAMP=$(date +"%Y.%m.%d.%H%M")`.
   - Asignar `DMG_NAME="Citas-1.0.${TIMESTAMP}.dmg"`.
   - Asignar `DMG_PATH="dist/${DMG_NAME}"`.
2. **Registrar regla en `AGENTS.md`**:
   - Documentar la convención obligatoria para futuras sesiones y construcciones del DMG.
3. **Verificación**:
   - Validar sintaxis bash con `bash -n scripts/build-dmg.sh`.
   - Comprobar la generación de la cadena de timestamp.
   - Generar el walkthrough en `docs/`.
