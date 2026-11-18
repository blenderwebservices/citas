# Plan de Implementación: Ajuste a la Esquina Superior Izquierda al Arranque

## Objetivos
1. **Posicionamiento en la esquina superior izquierda**:
   - Modificar `src/components/BeveledWindow.tsx` para que la posición inicial calculada en `pan` y `currentPosRef` no centre la tarjeta en la pantalla, sino que se coloque ajustada a la esquina superior izquierda (`bounds.minX, bounds.minY`, con un margen seguro mínimo de 8px para respetar el bisel y sombra).
   - En `macos/Citas-macos/AppDelegate.mm`, posicionar la ventana de macOS en la esquina superior izquierda del área visible de la pantalla principal (`NSScreen visibleFrame`), debajo de la barra de menús de macOS.
2. **Eliminar cualquier fondo o contenedor residual**:
   - Asegurar que `rootView.backgroundColor` en macOS sea `[NSColor clearColor]` invocando selector `setBackgroundColor:` sobre el `rootView` de React Native, además de `self.window.backgroundColor = [NSColor clearColor]` y `self.window.opaque = NO`.
3. **Verificación y Compilación**:
   - Verificar TypeScript con `npx tsc --noEmit`.
   - Ejecutar suite de pruebas con `tsx --test`.
   - Recompilar y generar el instalador en `dist/Citas-1.0.0.dmg` con `npm run mac:dmg`.
   - Generar reporte de walkthrough en `docs/`.
