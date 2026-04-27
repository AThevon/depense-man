#!/bin/bash

# Génère toutes les icônes (favicon, PWA, iOS) depuis une image source.
# Pipeline :
#   1. Trim l'image au bounding box du contenu (élimine padding transparent).
#   2. Flatten sur fond noir #0a0a0b → carré opaque full-bleed.
#   3. Resize à toutes les tailles requises.
# Le résultat full-bleed permet à iOS d'appliquer son masque squircle proprement
# sans padding visible.
#
# Usage: ./generate-icons.sh chemin/vers/source.png

set -e

if [ $# -eq 0 ]; then
  echo "Usage: ./generate-icons.sh chemin/vers/source.png"
  exit 1
fi

SRC="$1"
if [ ! -f "$SRC" ]; then
  echo "Erreur: fichier introuvable: $SRC"
  exit 1
fi

if ! command -v magick >/dev/null 2>&1; then
  echo "Erreur: ImageMagick (magick) n'est pas installé."
  exit 1
fi

WORK=$(mktemp -t icon-fullbleed-XXXXXX.png)
trap 'rm -f "$WORK"' EXIT

echo "Préparation source full-bleed (1024x1024)..."
magick "$SRC" \
  -trim +repage \
  -background "#0a0a0b" -alpha remove -alpha off \
  -resize 1024x1024 \
  "$WORK"

mkdir -p public

echo "Génération app/apple-icon.png (180x180)..."
magick "$WORK" -resize 180x180 app/apple-icon.png
cp app/apple-icon.png public/apple-icon.png

echo "Génération app/icon.png (512x512)..."
magick "$WORK" -resize 512x512 app/icon.png

echo "Génération web-app-manifest-192x192.png..."
magick "$WORK" -resize 192x192 public/web-app-manifest-192x192.png

echo "Génération web-app-manifest-512x512.png..."
magick "$WORK" -resize 512x512 public/web-app-manifest-512x512.png

echo "Génération favicon.png (32x32)..."
magick "$WORK" -resize 32x32 public/favicon.png

echo "Génération favicon.ico (multi-size 16/32/48)..."
magick "$WORK" \
  \( -clone 0 -resize 16x16 \) \
  \( -clone 0 -resize 32x32 \) \
  \( -clone 0 -resize 48x48 \) \
  -delete 0 app/favicon.ico
cp app/favicon.ico public/favicon.ico

echo ""
echo "Terminé. Icônes générées :"
ls -lh app/icon.png app/apple-icon.png app/favicon.ico public/apple-icon.png public/favicon.ico public/favicon.png public/web-app-manifest-*.png
