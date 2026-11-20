# Plan de Implementación: Integración Visual del Panel de Ajustes en el Widget Flotante

## Diagnóstico
El botón `[ ⚙ ]` no producía un cambio visual apreciable debido a que los ajustes se renderizaban como un overlay separado en `App.tsx` fuera del contenedor de la tarjeta, en una ventana transparente de macOS donde las dimensiones y el zIndex del overlay no coincidían con la posición de la tarjeta (que fue fijada a la esquina superior izquierda).

## Solución Arquitectónica
Integrar la vista de ajustes (`SettingsContent`) directamente dentro del componente de la tarjeta flotante (`BeveledWindow.tsx`):
1. **Modo dual en `BeveledWindow`**:
   - **Modo Cita** (`isSettingsOpen === false`): Título *"Citas Célebres"*, botones `[ ↻ ] [ ⚙ ] [ ✕ ]` y el contenido de la cita con su autor y etiquetas.
   - **Modo Ajustes** (`isSettingsOpen === true`): Título *"⚙ Ajustes y Fuente"*, botones `[ ← Volver ] [ ✕ ]` y el contenido interactivo de configuración (Selector de APIs, sincronización, modo oscuro, categorías y autores) dentro del marco biselado interior con scroll.
2. **Dimensiones dinámicas**:
   - En modo cita: altura adaptativa de ~300-340px.
   - En modo ajustes: altura de ~460-480px para visualizar cómodamente todas las opciones de configuración y permitir scroll fluido.
3. **Respuesta visual inmediata**:
   - El usuario hace clic en `[ ⚙ ]` directamente en la tarjeta y la tarjeta misma se transforma al instante en la vista de configuración en su posición actual (esquina superior izquierda).
4. **Verificación y Compilación**:
   - `npx tsc --noEmit` y suite de tests unitarios.
   - Compilación Release y nuevo DMG con formato de versión timestamp: `Citas-1.0.[YYYY].[MM].[DD].[HHMM].dmg`.
   - Registro de walkthrough en `docs/`.
