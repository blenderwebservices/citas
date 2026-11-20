# Plan de Implementación: Resolución de Divergencia y Sincronización Git

**Fecha y Hora**: 2026-11-20 14:03

---

## 1. Diagnóstico de la Divergencia
- La rama local `main` (`713adf5`) contiene:
  - Cierre nativo de app vía `NativeWindowControl` (`[NSApp terminate:nil]`).
  - Botones de copiado al portapapeles y textos seleccionables en `BeveledWindow.tsx`.
  - Integración en línea de `SettingsContent` en el widget flotante.
  - Generación de DMG con formato timestamp `Citas-1.0.YYYY.MM.DD.HHMM.dmg`.
- La rama remota `origin/main` (`4a0bd8e`, `a2c1724`) contiene:
  - Serializador y parseador de citas en JSON/CSV (`src/utils/quoteSerializer.ts` y tests).
  - Soporte de modo de tema 'system' además de 'light' y 'dark'.
  - `self.window.movableByWindowBackground = NO` en `AppDelegate.mm`.

---

## 2. Pasos de Ejecución

1. **Fusionar ramas (`git merge origin/main`)**:
   - Integrar los commits remotos en la rama local.
2. **Resolución de Conflictos (si los hay)**:
   - Preservar las novedades locales (cierre nativo, copiado, vista integrada de ajustes, scripts de build).
   - Incorporar las novedades remotas (`quoteSerializer.ts`, modo de tema sistema, `movableByWindowBackground = NO`).
3. **Verificación y Calidad**:
   - Comprobación estricta de tipos: `npx tsc --noEmit`.
   - Ejecución de pruebas unitarias incluyendo el nuevo serializador: `npx --yes tsx --test src/utils/__tests__/quoteFilter.test.ts src/utils/__tests__/quoteSerializer.test.ts src/services/__tests__/quotesApi.test.ts`.
   - Compilación Release macOS y generación de nuevo DMG: `npm run mac:dmg`.
4. **Sincronización con el Remoto (`git push origin main`)**:
   - Publicar el commit resultante en `origin/main`.
5. **Documentación**:
   - Generar `docs/2026-11-20_14-03_walkthrough.md`.
