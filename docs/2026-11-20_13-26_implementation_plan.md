# Plan de Implementación: Botones de Copiado y Selección de Texto

## Objetivos
1. **Texto seleccionable en general**:
   - Configurar `selectable={true}` en todos los textos de la tarjeta: cita, autor, país, año y etiquetas.
   - Permitir selección de texto nativa en macOS y copia con `Cmd+C` o menú contextual.
2. **Botón a un costado de la cita**:
   - Botón discreto al costado de la cita para copiar exclusivamente el texto de la cita al portapapeles.
   - Feedback visual con icono de confirmación `✓`.
3. **Botón a un costado del autor y demás datos**:
   - Botón discreto al costado del autor para copiar autor, año, país y etiquetas formateadas.
   - Feedback visual con icono de confirmación `✓`.
4. **Botón global para copiar todo**:
   - Botón en los controles de cabecera (`[ 📋 ]`) para copiar la cita completa con su autor y metadatos.
   - Notificación visual / badge temporal de confirmación.
5. **Verificación y Compilación**:
   - TypeScript `tsc --noEmit` y suite de tests unitarios.
   - Compilación Release y generación del nuevo DMG con formato `Citas-1.0.[YYYY].[MM].[DD].[HHMM].dmg`.
   - Registro de walkthrough en `docs/`.
