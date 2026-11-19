# Plan de Implementación: Corrección del Panel de Ajustes en macOS

## Diagnóstico
El botón de ajustes `[ ⚙ ]` no desplegaba la ventana de ajustes debido a que `SettingsPanel.tsx` utilizaba el componente `<Modal>` de React Native.
En `react-native-macos`, el componente `<Modal>` depende de la presentación nativa de `NSViewController` (`RCTModalHostViewManager.m`), el cual falla silenciosamente o no se presenta en ventanas de macOS transparentes y borderless (`NSWindowStyleMaskFullSizeContentView` sin marcos estándar de modal sheet).

## Solución
1. Reemplazar `<Modal>` en `SettingsPanel.tsx` por un overlay condicional puro en React Native (`if (!visible) return null;`) con posicionamiento absoluto (`StyleSheet.absoluteFillObject`) y capa superior (`zIndex: 99999`).
2. Asegurar que el overlay capture eventos de clic en el fondo para cerrar los ajustes y detenga la propagación de eventos (`e.stopPropagation()`) al interactuar dentro del panel.
3. Verificar tipos TypeScript y ejecutar suite de pruebas.
4. Compilar y regenerar `dist/Citas-1.0.0.dmg`.
5. Registrar reporte de walkthrough en `docs/`.
