#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PNG_IMAGE="$ROOT_DIR/docs/icono-app-citas.png"
JPEG_IMAGE="$ROOT_DIR/docs/icono-app-citas.jpeg"

TEMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "▶ Recortando y normalizando imagen fuente..."
if [ -f "$PNG_IMAGE" ]; then
  echo "  Usando $PNG_IMAGE como fuente principal..."
  swift - "$PNG_IMAGE" "$TEMP_DIR/master_1024.png" << 'SWIFT_EOF'
import AppKit

let args = CommandLine.arguments
guard args.count >= 3 else { exit(1) }
let inputPath = args[1]
let outputPath = args[2]

let url = URL(fileURLWithPath: inputPath)
guard let data = try? Data(contentsOf: url),
      let rep = NSBitmapImageRep(data: data),
      let cgImage = rep.cgImage else {
    print("Error al cargar la imagen PNG")
    exit(1)
}

// Bounding box del icono dentro de icono-app-citas.png: x=219, y=384, w=356, h=356
let cropRect = CGRect(x: 219, y: 384, width: 356, height: 356)
guard let cropped = cgImage.cropping(to: cropRect) else {
    print("Error al recortar el icono")
    exit(1)
}

let targetRep = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: 1024,
    pixelsHigh: 1024,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
)!

NSGraphicsContext.saveGraphicsState()
let ctx = NSGraphicsContext(bitmapImageRep: targetRep)
NSGraphicsContext.current = ctx
ctx?.cgContext.interpolationQuality = .high
ctx?.cgContext.draw(cropped, in: CGRect(x: 0, y: 0, width: 1024, height: 1024))
NSGraphicsContext.restoreGraphicsState()

if let pngData = targetRep.representation(using: .png, properties: [:]) {
    try? pngData.write(to: URL(fileURLWithPath: outputPath))
}
SWIFT_EOF
elif [ -f "$JPEG_IMAGE" ]; then
  echo "  Usando $JPEG_IMAGE como fuente de respaldo..."
  sips -s format png --cropToHeightWidth 1536 1536 "$JPEG_IMAGE" --out "$TEMP_DIR/base_1536.png" > /dev/null
  sips -z 1024 1024 "$TEMP_DIR/base_1536.png" --out "$TEMP_DIR/master_1024.png" > /dev/null
else
  echo "❌ No se encontró icono-app-citas.png ni icono-app-citas.jpeg en docs/"
  exit 1
fi

echo "▶ Generando iconos para macOS (AppIcon.appiconset)..."
MACOS_ICONSET_DIR="$ROOT_DIR/macos/Citas-macOS/Assets.xcassets/AppIcon.appiconset"
mkdir -p "$MACOS_ICONSET_DIR"

ICONSET_BUILD="$TEMP_DIR/Citas.iconset"
mkdir -p "$ICONSET_BUILD"

declare -a MACOS_SIZES=(
  "16:icon_16x16.png"
  "32:icon_16x16@2x.png"
  "32:icon_32x32.png"
  "64:icon_32x32@2x.png"
  "128:icon_128x128.png"
  "256:icon_128x128@2x.png"
  "256:icon_256x256.png"
  "512:icon_256x256@2x.png"
  "512:icon_512x512.png"
  "1024:icon_512x512@2x.png"
)

for item in "${MACOS_SIZES[@]}"; do
  size="${item%%:*}"
  filename="${item##*:}"
  sips -z "$size" "$size" "$TEMP_DIR/master_1024.png" --out "$MACOS_ICONSET_DIR/$filename" > /dev/null
  cp "$MACOS_ICONSET_DIR/$filename" "$ICONSET_BUILD/$filename"
done

# Crear Contents.json de macOS
cat << 'EOF' > "$MACOS_ICONSET_DIR/Contents.json"
{
  "images" : [
    {
      "filename" : "icon_16x16.png",
      "idiom" : "mac",
      "scale" : "1x",
      "size" : "16x16"
    },
    {
      "filename" : "icon_16x16@2x.png",
      "idiom" : "mac",
      "scale" : "2x",
      "size" : "16x16"
    },
    {
      "filename" : "icon_32x32.png",
      "idiom" : "mac",
      "scale" : "1x",
      "size" : "32x32"
    },
    {
      "filename" : "icon_32x32@2x.png",
      "idiom" : "mac",
      "scale" : "2x",
      "size" : "32x32"
    },
    {
      "filename" : "icon_128x128.png",
      "idiom" : "mac",
      "scale" : "1x",
      "size" : "128x128"
    },
    {
      "filename" : "icon_128x128@2x.png",
      "idiom" : "mac",
      "scale" : "2x",
      "size" : "128x128"
    },
    {
      "filename" : "icon_256x256.png",
      "idiom" : "mac",
      "scale" : "1x",
      "size" : "256x256"
    },
    {
      "filename" : "icon_256x256@2x.png",
      "idiom" : "mac",
      "scale" : "2x",
      "size" : "256x256"
    },
    {
      "filename" : "icon_512x512.png",
      "idiom" : "mac",
      "scale" : "1x",
      "size" : "512x512"
    },
    {
      "filename" : "icon_512x512@2x.png",
      "idiom" : "mac",
      "scale" : "2x",
      "size" : "512x512"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF

echo "▶ Generando archivo AppIcon.icns para macOS y DMG..."
iconutil -c icns "$ICONSET_BUILD" -o "$ROOT_DIR/macos/Citas-macOS/AppIcon.icns"
cp "$ROOT_DIR/macos/Citas-macOS/AppIcon.icns" "$ROOT_DIR/dist/AppIcon.icns" 2>/dev/null || true

echo "▶ Generando iconos para iOS (Images.xcassets)..."
IOS_ICONSET_DIR="$ROOT_DIR/ios/Citas/Images.xcassets/AppIcon.appiconset"
if [ -d "$ROOT_DIR/ios/Citas" ]; then
  mkdir -p "$IOS_ICONSET_DIR"
  sips -z 40 40 "$TEMP_DIR/master_1024.png" --out "$IOS_ICONSET_DIR/icon_20@2x.png" > /dev/null
  sips -z 60 60 "$TEMP_DIR/master_1024.png" --out "$IOS_ICONSET_DIR/icon_20@3x.png" > /dev/null
  sips -z 58 58 "$TEMP_DIR/master_1024.png" --out "$IOS_ICONSET_DIR/icon_29@2x.png" > /dev/null
  sips -z 87 87 "$TEMP_DIR/master_1024.png" --out "$IOS_ICONSET_DIR/icon_29@3x.png" > /dev/null
  sips -z 80 80 "$TEMP_DIR/master_1024.png" --out "$IOS_ICONSET_DIR/icon_40@2x.png" > /dev/null
  sips -z 120 120 "$TEMP_DIR/master_1024.png" --out "$IOS_ICONSET_DIR/icon_40@3x.png" > /dev/null
  sips -z 120 120 "$TEMP_DIR/master_1024.png" --out "$IOS_ICONSET_DIR/icon_60@2x.png" > /dev/null
  sips -z 180 180 "$TEMP_DIR/master_1024.png" --out "$IOS_ICONSET_DIR/icon_60@3x.png" > /dev/null
  sips -z 1024 1024 "$TEMP_DIR/master_1024.png" --out "$IOS_ICONSET_DIR/icon_1024.png" > /dev/null

  cat << 'EOF' > "$IOS_ICONSET_DIR/Contents.json"
{
  "images" : [
    {
      "filename" : "icon_20@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "20x20"
    },
    {
      "filename" : "icon_20@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "20x20"
    },
    {
      "filename" : "icon_29@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "29x29"
    },
    {
      "filename" : "icon_29@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "29x29"
    },
    {
      "filename" : "icon_40@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "40x40"
    },
    {
      "filename" : "icon_40@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "40x40"
    },
    {
      "filename" : "icon_60@2x.png",
      "idiom" : "iphone",
      "scale" : "2x",
      "size" : "60x60"
    },
    {
      "filename" : "icon_60@3x.png",
      "idiom" : "iphone",
      "scale" : "3x",
      "size" : "60x60"
    },
    {
      "filename" : "icon_1024.png",
      "idiom" : "ios-marketing",
      "scale" : "1x",
      "size" : "1024x1024"
    }
  ],
  "info" : {
    "author" : "xcode",
    "version" : 1
  }
}
EOF
fi

echo "▶ Generando iconos para Android (res/mipmap-*)..."
ANDROID_RES_DIR="$ROOT_DIR/android/app/src/main/res"
if [ -d "$ANDROID_RES_DIR" ]; then
  declare -a ANDROID_SIZES=(
    "48:mipmap-mdpi"
    "72:mipmap-hdpi"
    "96:mipmap-xhdpi"
    "144:mipmap-xxhdpi"
    "192:mipmap-xxxhdpi"
  )

  for item in "${ANDROID_SIZES[@]}"; do
    size="${item%%:*}"
    folder="${item##*:}"
    target_dir="$ANDROID_RES_DIR/$folder"
    mkdir -p "$target_dir"
    sips -z "$size" "$size" "$TEMP_DIR/master_1024.png" --out "$target_dir/ic_launcher.png" > /dev/null
    cp "$target_dir/ic_launcher.png" "$target_dir/ic_launcher_round.png"
  done
fi

echo "✅ Iconos generados con éxito para macOS, iOS y Android."
