# Plan de Implementación: Ajustes Avanzados (Tema, API y JSON/CSV)

## 1. Objetivo
Ampliar el panel de ajustes (`src/components/SettingsPanel.tsx`) y el estado global (`src/store/useQuotesStore.ts`) para soportar:
1. **Tema**: Selector de 3 modos (`Claro`, `Oscuro`, `Sistema`) usando `useColorScheme()`.
2. **Fuente de citas**: Selector entre catálogo **Local** o **API externa** (URL configurable, con botón de sincronización y manejo de carga/error).
3. **Descarga y Carga de Citas (JSON / CSV)**:
   - Parsers y serializadores puros en `src/utils/quoteSerializer.ts` para **JSON** y **CSV** (con soporte de comillas escapadas, campos opcionales `year`/`country` y `tags`).
   - Importación desde texto pegado (JSON o CSV) o desde URL remota, con opción de agregar o reemplazar el catálogo local y restaurar el catálogo base.
   - Exportación/descarga en formato **JSON** o **CSV** mediante `Share.share` nativo y vista previa seleccionable.

## 2. Archivos a Crear / Modificar
- `src/types/quote.ts`: Agregar `ThemePreference = 'light' | 'dark' | 'system'` y `QuoteSource = 'local' | 'api'`.
- `src/utils/quoteSerializer.ts`: Funciones puras `quotesToJson`, `quotesToCsv`, `parseQuotesFromJson`, `parseQuotesFromCsv`, `parseApiQuotesPayload`.
- `src/store/useQuotesStore.ts`: Estado y acciones para `themePreference`, `quoteSource`, `apiEndpoint`, `apiQuotes`, `localQuotes`, `fetchApiQuotes`, `importQuotes`, `resetLocalQuotes`.
- `App.tsx`: Resolver `themePreference === 'system'` con `useColorScheme()`.
- `src/components/SettingsPanel.tsx`: UI para selector de tema (Claro/Oscuro/Sistema), selector de fuente (Local/API + URL + sincronizar), sección de Carga/Descarga JSON/CSV y filtros existentes.
- `src/utils/__tests__/quoteSerializer.test.ts`: Pruebas unitarias para serialización/parseo JSON, CSV y respuestas de API.

## 3. Verificación
- `npx tsc --noEmit` sin errores.
- Pruebas unitarias (`quoteFilter.test.ts` y `quoteSerializer.test.ts`) pasando al 100%.
- Recompilación de `npm run mac:dmg` para verificar que el `.dmg` nativo incluye los cambios.
