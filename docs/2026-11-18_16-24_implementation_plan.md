# Plan de Implementación: Widget Flotante Transparente y Selector de APIs de Citas

## Objetivos
1. **Ocultar la ventana contenedora**:
   - Convertir la ventana de macOS en una ventana flotante transparente y sin bordes (`NSWindowStyleMaskTitled | NSWindowStyleMaskFullSizeContentView` con barra de título y botones nativos ocultos).
   - Hacer el fondo (`backdrop`) de React Native transparente (`backgroundColor: 'transparent'`), de manera que únicamente la tarjeta biselada flotante y su sombra 3D sean visibles sobre el escritorio.
   - Permitir arrastrar la ventana nativa suavemente (`movableByWindowBackground = YES`).
2. **Implementar arquitectura híbrida de APIs (Sugerencia 3) con selector**:
   - Crear un servicio de citas `src/services/quotesApi.ts` con soporte para múltiples proveedores:
     - `local`: Catálogo integrado offline (`quotes.json`).
     - `github-cdn`: Catálogo remoto dinámico en GitHub (Sugerencia 3, sincronizado vía CDN, 100% español).
     - `positive-api`: The Positive API (`positive-api.online/phrase/esp`).
     - `zenquotes`: ZenQuotes API (`zenquotes.io/api/random`).
   - Persistir la fuente seleccionada y las citas sincronizadas en `useQuotesStore` con `AsyncStorage`.
   - Incorporar en el panel de ajustes (`SettingsPanel.tsx`) la sección **"Fuente de Citas / API"** con opciones interactivas y retro-styled.
   - Fallback offline automático: Si una API externa falla o no hay conexión a internet, recurre transparentemente al catálogo local.
3. **Compilación y generación del DMG**:
   - Compilar con `npm run mac:dmg` y verificar `dist/Citas-1.0.0.dmg`.
   - Ejecutar suite de pruebas y verificación de tipos TypeScript.
   - Registrar walkthrough en `docs/`.
