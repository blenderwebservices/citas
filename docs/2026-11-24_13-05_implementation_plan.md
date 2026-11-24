# Plan de Implementación: Botones Tipo Toggle (Always on Top y Timer)

Fecha: 2026-11-24 13:05

## 1. Objetivo
Convertir visualmente los botones de **Always on Top** (`📌`) y **Timer** (`⏱`) en botones tipo toggle o "hundidos / presionados" cuando están activos:
- Si están activos (`isActive = true`), el botón debe mostrarse en estado "hundido" (inversión del biselado: borde superior/izquierdo oscuro, inferior/derecho claro) y con un fondo distintivo (el color de acento o una versión translúcida o fondo activo + texto/símbolo en contraste `accentText`).
- Opcionalmente mostrar un pequeño indicador de punto o badge de estado activo.
- Cuando están inactivos, mantienen el biselado estándar en relieve.

## 2. Modificaciones
1. **Componente `BevelButton` (`src/components/BeveledWindow.tsx`)**:
   - Prop opcional: `isActive?: boolean`.
   - Prop opcional: `activeBackgroundColor?: string`.
   - Prop opcional: `activeSymbolColor?: string`.
   - Lógica de bordes: si `isActive || pressed`, invierte los bordes a bisel hundido (`theme.buttonBorderDark` en top/left, `theme.buttonBorderLight` en bottom/right).
   - Fondo: si `isActive`, utiliza `theme.accent` (o fondo resaltado con acento).
   - Color del símbolo: si `isActive`, usa `theme.accentText` (o `theme.accent`).
2. **Uso en `BeveledWindow.tsx`**:
   - Pasar `isActive={isAlwaysOnTop}` al botón Always on Top.
   - Pasar `isActive={isTimerActive}` al botón Timer.
   - Pasar `accessibilityState={{ checked: isAlwaysOnTop }}` / `accessibilityRole="switch"` o `"checkbox"`.

## 3. Verificación
1. `npx tsc --noEmit` y suite de tests unitarios.
2. Compilación del nuevo DMG con `npm run mac:dmg`.
3. Guardar Walkthrough en `docs/2026-11-24_13-05_walkthrough.md`.
