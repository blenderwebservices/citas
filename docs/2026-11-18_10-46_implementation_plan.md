# Plan de Implementación: Corrección de error y generación de DMG para macOS

## Diagnóstico del Error
Al ejecutar `npm run mac:dmg` (`bash scripts/build-dmg.sh`), `xcodebuild` falló con el siguiente error:
```
error: Unable to open base configuration reference file '/Users/franc/Herd/citas/macos/Pods/Target Support Files/Pods-Citas-macOS/Pods-Citas-macOS.release.xcconfig'. (in target 'Citas-macOS' from project 'Citas')
```
**Causa**: La carpeta `macos/Pods` no existe porque las dependencias nativas de CocoaPods no han sido instaladas para el entorno macOS.

## Objetivos
1. Instalar las dependencias de CocoaPods para macOS ejecutando `pod install --project-directory=macos`.
2. Mejorar `scripts/build-dmg.sh` para que verifique si `macos/Pods` existe y, de ser necesario, instale automáticamente las dependencias de CocoaPods antes de compilar.
3. Compilar el proyecto en Release y generar el `.dmg` en `dist/Citas-1.0.0.dmg`.
4. Verificar la creación correcta del `.app` y `.dmg`.
5. Registrar el walkthrough final en `docs/`.

## Pasos de Ejecución
- **Paso 1**: Actualizar `scripts/build-dmg.sh` para autoverificar/instalar CocoaPods si falta `macos/Pods`.
- **Paso 2**: Ejecutar `pod install --project-directory=macos` (o dejar que el script lo ejecute).
- **Paso 3**: Ejecutar `npm run mac:dmg` y validar la salida de `xcodebuild` y `hdiutil`.
- **Paso 4**: Confirmar la integridad de `dist/Citas-1.0.0.dmg`.
- **Paso 5**: Generar reporte de walkthrough en `docs/`.
