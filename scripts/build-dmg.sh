#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

export NODE_BINARY="${NODE_BINARY:-$(command -v node)}"

echo "▶ Compilando Citas-macOS (Release) con xcodebuild..."
xcodebuild \
  -workspace macos/Citas.xcworkspace \
  -scheme Citas-macOS \
  -configuration Release \
  -derivedDataPath macos/build_release \
  CODE_SIGN_IDENTITY="-" \
  CODE_SIGNING_REQUIRED=NO \
  CODE_SIGNING_ALLOWED=NO \
  build

APP_PATH="macos/build_release/Build/Products/Release/Citas.app"
if [ ! -d "$APP_PATH" ]; then
  echo "❌ No se encontró $APP_PATH"
  exit 1
fi

STAGE_DIR="dist/dmg_stage"
DMG_PATH="dist/Citas-1.0.0.dmg"

rm -rf "$STAGE_DIR" "$DMG_PATH"
mkdir -p "$STAGE_DIR"

cp -R "$APP_PATH" "$STAGE_DIR/Citas.app"
ln -s /Applications "$STAGE_DIR/Applications"

echo "▶ Creando $DMG_PATH con hdiutil..."
hdiutil create \
  -volname "Citas" \
  -srcfolder "$STAGE_DIR" \
  -ov \
  -format UDZO \
  "$DMG_PATH"

rm -rf "$STAGE_DIR"
echo "✅ DMG generado en: $DMG_PATH"
