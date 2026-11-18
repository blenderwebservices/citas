# Plan de Implementación: Migración a React Native puro + macOS (.dmg)

## 1. Objetivo
Eliminar **Expo** y **Electron** del proyecto y migrar a **React Native (`0.83.10`) + `react-native-macos` (`0.83.0`)** para compilar una aplicación nativa de macOS (`.app`) con Xcode y empaquetarla en un instalador `.dmg` mediante `hdiutil`.

## 2. Cambios de Arquitectura
- **Eliminación de Expo y Electron**:
  - Quitar `expo`, `expo-font`, `expo-status-bar`, `@expo/vector-icons`, `@expo-google-fonts/*`, `react-dom`, `react-native-web`, `electron`, `electron-builder`, `electron/main.cjs` y `dist-web/`.
- **Inicialización React Native macOS**:
  - Estructura estándar de React Native (`package.json`, `index.js`, `app.json`, `metro.config.js`, `babel.config.js`, `macos/`).
  - Dependencias: `react`, `react-native@0.83.10`, `react-native-macos@0.83.0`, `@react-native-async-storage/async-storage`, `zustand`.
- **Adaptación de UI a React Native macOS puro**:
  - Arrastre de la ventana flotante mediante `PanResponder` + `Animated.ValueXY` (con límites de pantalla usando `useWindowDimensions()`).
  - Tipografía Serif nativa (`Georgia`) para citas y Sans-Serif del sistema para metadatos y botones.
  - Iconografía mediante símbolos limpios nativos (sin dependencias de fuentes externas de Expo).

## 3. Compilación y Empaquetado `.dmg`
- Instalar dependencias nativas macOS con CocoaPods (`pod install` en `macos/`).
- Compilar el esquema Release en `macos/Citas.xcworkspace` con `xcodebuild` para generar `Citas.app` con el bundle JS embebido.
- Empaquetar `Citas.app` en `dist/Citas-1.0.0.dmg` con `hdiutil create`.

## 4. Verificación
- `npx tsc --noEmit` sin errores.
- `npx --yes tsx --test src/utils/__tests__/quoteFilter.test.ts` (6/6 pruebas).
- Compilación `xcodebuild` exitosa y generación verificada del `.dmg` en `dist/`.
