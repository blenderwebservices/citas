# Plan de Implementación: Aplicación Móvil de Citas Célebres

## 1. Resumen del Proyecto
Construir la aplicación móvil **Citas Célebres** en **React Native (Expo + TypeScript)** siguiendo `docs/especificacion.md`. La interfaz gira en torno a una ventana flotante arrastrable con marco biselado 3D tradicional, motor de citas con metadatos históricos condicionales, controles integrados en el marco, panel de ajustes con tema claro/oscuro en tiempo real y filtros persistentes por categoría y autor.

## 2. Arquitectura y Stack
- **Framework**: Expo (React Native + TypeScript).
- **Gestos y Animaciones**: `react-native-gesture-handler` + `react-native-reanimated` (`Gesture.Pan()` con clamping a los límites seguros de `useWindowDimensions()` y `useSafeAreaInsets()`).
- **Estado y Persistencia**: `zustand` con middleware `persist` respaldado por `@react-native-async-storage/async-storage`.
- **Tipografía e Iconos**: `@expo-google-fonts/playfair-display` (Serif para citas), `@expo-google-fonts/inter` (Sans-Serif para metadatos/controles), `@expo/vector-icons` (Ionicons).
- **Datos**: Catálogo estructurado en `src/data/quotes.json` siguiendo el esquema (`id`, `text`, `author`, `year?`, `country?`, `tags`).

## 3. Estructura de Archivos Propuesta
- `App.tsx`: Proveedores (`GestureHandlerRootView`, `SafeAreaProvider`), carga de fuentes y renderizado de la pantalla principal.
- `src/types/quote.ts`: Tipos TypeScript para `Quote`, `ThemeMode` y filtros.
- `src/data/quotes.json`: Catálogo de ~25+ citas célebres variadas (incluyendo casos con/sin `year` y `country` para validar el renderizado condicional).
- `src/theme/themes.ts`: Paletas para Modo Claro y Modo Oscuro, incluyendo los colores de biselado asimétrico (`bevelLight`, `bevelDark`, `innerBevelLight`, `innerBevelDark`).
- `src/store/useQuotesStore.ts`: Store Zustand persistido (tema, categorías seleccionadas, autor seleccionado, cita actual, visibilidad de ventana y panel de ajustes, acciones de navegación y filtrado).
- `src/utils/quoteFilter.ts`: Lógica pura y testeable de filtrado por categorías/autor, selección de siguiente cita sin repetición inmediata y extracción de categorías/autores únicos.
- `src/components/BeveledWindow.tsx`: Ventana flotante arrastrable con marco biselado 3D, barra de controles (`Siguiente`, `Ajustes`, `Cerrar`), motor de visualización de cita y estado vacío.
- `src/components/SettingsPanel.tsx`: Panel de ajustes (toggle tema claro/oscuro, chips/checkboxes de categorías, búsqueda y selección de autor).
- `src/components/RestoreWindowButton.tsx`: Botón flotante para volver a invocar la ventana cuando se cierra.
- `src/utils/__tests__/quoteFilter.test.ts`: Pruebas unitarias para la lógica de filtrado, límites y navegación.

## 4. Verificación
- Ejecución de `npx tsc --noEmit` para validar tipos TypeScript.
- Ejecución de pruebas unitarias sobre el filtrado de citas, estados vacíos y cálculo de límites de pantalla.
- Verificación de bundle Expo (`npx expo export --platform web`) para confirmar que la compilación de Metro/Babel/Reanimated funciona sin errores.
