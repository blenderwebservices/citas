# Plan de Implementación: Corrección del Botón de Cierre ('X') de la App

**Fecha y Hora**: 2026-11-20 13:55

---

## 1. Problema Identificado
Al pulsar el botón '✕' (cerrar) en la barra de título de la ventana de citas:
1. La aplicación no se cierra (`NSApp` permanece activo en macOS).
2. En `App.tsx`, el evento `onClose` únicamente alteraba el estado `isWindowVisible` a `false`.
3. Esto desmontaba la ventana de citas y montaba un contenedor transparente con `RestoreWindowButton`, dejando la ventana nativa de macOS abierta en modo invisible interceptando eventos del cursor o dejando la interfaz en un estado donde los botones no responden.
4. El usuario requiere que el botón '✕' efectivamente **cierre la aplicación** (exit/terminate).

---

## 2. Solución Propuesta

### A. Módulo Nativo macOS (`NativeWindowControl`)
- En `macos/Citas-macOS/AppDelegate.mm`, implementar un módulo nativo exportado a React Native mediante `RCTBridgeModule`:
  - Módulo: `NativeWindowControl`
  - Método: `closeApp`
  - Acción: Invocar `[NSApp terminate:nil]` en el hilo principal (`dispatch_get_main_queue()`).

### B. Servicio en JavaScript / TypeScript
- Crear un helper utilitario en `src/utils/windowControl.ts`:
  - `closeApp()`: Invoca `NativeModules.NativeWindowControl?.closeApp()`.
  - Como fallback seguro para desarrollo o plataformas sin el módulo nativo, invoca `BackHandler.exitApp()`.

### C. Actualización de `App.tsx` y `BeveledWindow.tsx`
- En `App.tsx`: Actualizar el prop `onClose` de `BeveledWindow` para que llame a `closeApp()`.
- En `BeveledWindow.tsx`:
  - Asegurar que el botón '✕' active `onClose` de forma directa sin quedar bloqueado por capturas del `PanResponder`.

---

## 3. Plan de Verificación

1. **Tipos TypeScript**: Ejecutar `npx tsc --noEmit`.
2. **Pruebas Unitarias**: Ejecutar la suite de pruebas automatizadas existentes con `tsx --test`.
3. **Compilación Nativa macOS y DMG**:
   - Ejecutar `npm run mac:dmg` para compilar la versión Release con Xcode 16 y generar el `.dmg` versionado con timestamp.
4. **Validación**:
   - Generación del walkthrough en `docs/2026-11-20_13-55_walkthrough.md`.
