# Plan de Implementación: Botón Always-on-Top y Botón Temporizador de Rotación de Citas

Fecha: 2026-11-24 10:08

## 1. Descripción y Objetivos
El usuario solicita:
1. **Botón Always-on-Top**: Permite fijar la ventana de la app por encima de todas las demás ventanas en macOS (y almacenar la preferencia si aplica).
2. **Botón Timer (Auto-rotación)**:
   - Al pulsarlo, activa o desactiva la rotación periódica automática de citas.
   - La frecuencia se configura en el panel de Ajustes en **minutos** (ej. 1 min, 5 min, 10 min, 15 min, 30 min, 60 min, o un selector numérico personalizable con valor por defecto de 5 minutos).
   - Indicador visual claro en la barra de título cuando el temporizador está activo (ej. icono resaltado o con color de acento).

## 2. Componentes y Arquitectura

### A. Módulo Nativo de macOS (`NativeWindowControl`)
- En `macos/Citas-macOS/AppDelegate.mm`:
  - Agregar métodos a `NativeWindowControl`:
    - `setAlwaysOnTop:(BOOL)alwaysOnTop`: Configura `self.window.level = alwaysOnTop ? NSFloatingWindowLevel : NSNormalWindowLevel;`.
    - `isAlwaysOnTop:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject`: Retorna el estado actual del nivel de ventana (`level == NSFloatingWindowLevel`).
  - En `applicationDidFinishLaunching:`, opcionalmente aplicar el nivel si se desea por defecto o dejar que React Native lo configure.

### B. Utilidad TypeScript (`src/utils/windowControl.ts`)
- Exponer funciones:
  - `setAlwaysOnTop(enabled: boolean): void`
  - `isAlwaysOnTopSupported(): boolean`

### C. Estado en Zustand (`src/store/useQuotesStore.ts`)
- Nuevas propiedades de estado:
  - `isAlwaysOnTop: boolean` (default: `false` o `true` según preferencia; persistido en AsyncStorage)
  - `isTimerActive: boolean` (default: `false`)
  - `timerIntervalMinutes: number` (default: `5`, configurable en minutos en Ajustes; persistido en AsyncStorage)
- Nuevas acciones:
  - `setAlwaysOnTop: (enabled: boolean) => void`
  - `toggleAlwaysOnTop: () => void`
  - `toggleTimer: () => void`
  - `setTimerActive: (active: boolean) => void`
  - `setTimerIntervalMinutes: (minutes: number) => void`

### D. Efecto de Auto-rotación
- En `App.tsx` o `BeveledWindow.tsx`:
  - Hook `useEffect` que escucha `isTimerActive` y `timerIntervalMinutes`.
  - Cuando `isTimerActive` sea `true`, configura un `setInterval` que ejecuta `nextQuote()` cada `timerIntervalMinutes * 60 * 1000` ms.
  - Al desmontar o cambiar de configuración/desactivar, limpia el intervalo (`clearInterval`).

### E. Interfaz de Usuario
1. **Barra de título (`BeveledWindow.tsx`)**:
   - Agregar botón para **Always on Top**:
     - Símbolo: `📌` o `▲` / pin icon. Si está activo, resaltar con `theme.accent` o marco activo.
     - Tooltip / accessibilityLabel: `"Fijar ventana siempre al frente (Always on top)"`.
   - Agregar botón para **Timer**:
     - Símbolo: `⏱` o `⏳`. Si está activo, resaltar con `theme.accent` y mostrar tooltip como `"Temporizador activo (cada X min)"`.
2. **Panel de Ajustes (`SettingsPanel.tsx`)**:
   - Nueva sección: **"Temporizador de Citas"**:
     - Switch o control para activar/desactivar auto-rotación.
     - Selector de intervalo en minutos: presets rápidos (1 min, 5 min, 10 min, 15 min, 30 min, 60 min) o entrada numérica.
   - Nueva sección o toggle para **"Ventana siempre visible" (Always on Top)**.

## 3. Plan de Verificación
1. Validar tipos TypeScript con `npx tsc --noEmit`.
2. Ejecutar suite de pruebas unitarias (`tsx --test`).
3. Compilar el DMG para macOS con `npm run mac:dmg` y verificar que la compilación nativa con `NSFloatingWindowLevel` no tenga advertencias ni errores.
4. Generar el reporte Walkthrough en `docs/2026-11-24_10-08_walkthrough.md`.
