# Plan de Implementación: Integración de Ícono de la Aplicación

**Fecha y Hora**: 2026-11-20 14:14

---

## 1. Objetivo
Integrar `docs/icono-app-citas.jpeg` como el ícono oficial de la aplicación en las plataformas del proyecto:
- **macOS**: `AppIcon.appiconset` en `macos/Citas-macOS/Assets.xcassets/`, generación de `AppIcon.icns` y configuración en el paquete compilado `.app` y `.dmg`.
- **iOS**: `AppIcon.appiconset` en `ios/Citas/Images.xcassets/`.
- **Android**: Recursos `ic_launcher.png` y `ic_launcher_round.png` en `android/app/src/main/res/mipmap-*`.

---

## 2. Generación de Recursos

1. **Recorte y normalización**:
   - Recortar `docs/icono-app-citas.jpeg` (2752x1536) en una imagen cuadrada centrada (1536x1536 PNG) utilizando `sips`.
   - Generar el master de 1024x1024.

2. **macOS**:
   - Generar conjunto de íconos para `AppIcon.appiconset`:
     - 16x16 (`16x16@1x`, `16x16@2x` -> 32x32)
     - 32x32 (`32x32@1x`, `32x32@2x` -> 64x64)
     - 128x128 (`128x128@1x`, `128x128@2x` -> 256x256)
     - 256x256 (`256x256@1x`, `256x256@2x` -> 512x512)
     - 512x512 (`512x512@1x`, `512x512@2x` -> 1024x1024)
   - Actualizar `Contents.json` en `macos/Citas-macOS/Assets.xcassets/AppIcon.appiconset/`.
   - Generar `AppIcon.icns` con `iconutil` y actualizar `scripts/build-dmg.sh` para incluir `.VolumeIcon.icns` en el DMG.

3. **iOS**:
   - Generar resoluciones para `ios/Citas/Images.xcassets/AppIcon.appiconset/`:
     - 20pt (@2x, @3x -> 40x40, 60x60)
     - 29pt (@2x, @3x -> 58x58, 87x87)
     - 40pt (@2x, @3x -> 80x80, 120x120)
     - 60pt (@2x, @3x -> 120x120, 180x180)
     - Marketing 1024x1024
   - Actualizar `Contents.json`.

4. **Android**:
   - Generar variantes para `android/app/src/main/res/`:
     - `mipmap-mdpi`: 48x48
     - `mipmap-hdpi`: 72x72
     - `mipmap-xhdpi`: 96x96
     - `mipmap-xxhdpi`: 144x144
     - `mipmap-xxxhdpi`: 192x192

---

## 3. Verificación
1. Compilar Citas-macOS con `xcodebuild` / `npm run mac:dmg`.
2. Verificar que el `.app` generado contenga `AppIcon` en su `Info.plist` y `Resources`.
3. Verificar que el DMG se cree correctamente con el formato `Citas-1.0.YYYY.MM.DD.HHMM.dmg`.
4. Elaborar reporte de entrega (`docs/YYYY-MM-DD_HH-mm_walkthrough.md`).
