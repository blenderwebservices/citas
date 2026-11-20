# Plan de Implementación: Integración de docs/icono-app-citas.png como Ícono de la App macOS

**Fecha y Hora**: 2026-11-20 16:47

---

## 1. Objetivo
Establecer `docs/icono-app-citas.png` como el ícono oficial de la aplicación para macOS:
- Extraer el símbolo central del ícono con sus esquinas transparentes y resolución 1024x1024.
- Generar el catálogo completo de íconos en `macos/Citas-macOS/Assets.xcassets/AppIcon.appiconset/`.
- Generar el archivo nativo `macos/Citas-macOS/AppIcon.icns`.
- Actualizar `scripts/generate-icons.sh` para usar `docs/icono-app-citas.png`.
- Recompilar la aplicación macOS en Release y generar el nuevo `.dmg` versionado.

---

## 2. Pasos de Ejecución

1. **Extracción y normalización**:
   - Usar el extractor Swift / CoreGraphics para recortar con precisión el cuadro de 356x356 de `docs/icono-app-citas.png` hacia un master de 1024x1024 PNG con transparencia alfa completa.
2. **Generación del conjunto de íconos macOS**:
   - Tamaños: 16x16, 32x32, 128x128, 256x256, 512x512 (@1x y @2x).
   - Generar `AppIcon.icns` mediante `iconutil`.
   - Copiar a `dist/AppIcon.icns` y `macos/Citas-macOS/AppIcon.icns`.
3. **Verificación y Calidad**:
   - Ejecutar `npm run mac:dmg` para compilar con Xcode 16 y crear el DMG versionado.
   - Verificar la presencia de `AppIcon.icns` en `Citas.app/Contents/Resources/`.
4. **Entrega y Documentación**:
   - Generar `docs/2026-11-20_16-47_walkthrough.md`.
