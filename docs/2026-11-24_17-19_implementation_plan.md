# Plan de Implementación: Soporte para Windows y Compilación de .exe con GitHub Actions

Fecha: 2026-11-24 17:19

## 1. Contexto y Diagnóstico
- El usuario solicitó generar un archivo ejecutable `.exe` para Windows.
- La aplicación está desarrollada con React Native. La compilación de binarios para Windows requiere Microsoft Visual Studio, C++/WinRT, MSBuild y el Windows SDK, herramientas que solo pueden ejecutarse en un entorno Windows.
- Para proveer el `.exe` listo para descargar, se integra la plataforma `react-native-windows` al proyecto y se crea un flujo de compilación automatizado en **GitHub Actions** (`windows-2022`).

## 2. Objetivos y Acciones
1. **Instalación y Configuración Nativa de Windows**:
   - Se añadió `react-native-windows@0.79.4` coincidente con React Native 0.79.
   - Se ejecutó `npx react-native init-windows --template cpp-app` para generar la solución nativa `windows/Citas.sln`, archivos C++, manifiesto y assets.
   - Se ajustó `metro.config.js` para excluir artefactos de compilación de Windows de las búsquedas de Metro.
2. **Flujo de Automatización (`.github/workflows/build-windows.yml`)**:
   - Trigger manual (`workflow_dispatch`) y automático al hacer `push` a `main`.
   - Entorno Windows Server (`windows-2022`).
   - Generación del bundle JavaScript para Windows (`index.windows.bundle`).
   - Compilación nativa con `msbuild` en configuración Release x64.
   - Empaquetado en `.zip` con el `.exe` y subida como artefacto descargable en GitHub Actions.
3. **Control de Calidad**:
   - Verificación de tipos TypeScript (`tsc --noEmit`).
   - Suite completa de 12 pruebas unitarias.
4. **Sincronización y Despliegue**:
   - Commit y push a `origin/main` en GitHub para disparar el flujo de compilación.

## 3. Plan de Verificación
- Tipos TypeScript pasando limpiamente.
- Pruebas unitarias al 100%.
- Documentos de plan y walkthrough registrados en `docs/`.
- Repositorio sincronizado en `origin/main`.
