#!/bin/bash

# Script pour générer les icônes PWA depuis une image source
# Usage: ./generate-icons.sh chemin/vers/ton-image.png

if [ $# -eq 0 ]; then
    echo "❌ Erreur: Aucune image fournie"
    echo "Usage: ./generate-icons.sh chemin/vers/ton-image.png"
    exit 1
fi

SOURCE_IMAGE="$1"

if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "❌ Erreur: Fichier '$SOURCE_IMAGE' introuvable"
    exit 1
fi

echo "🎨 Génération des icônes PWA depuis: $SOURCE_IMAGE"
echo ""

# Créer le dossier public s'il n'existe pas
mkdir -p public

# Générer web-app-manifest-192x192.png
echo "📱 Génération de web-app-manifest-192x192.png (192x192)..."
sips -z 192 192 "$SOURCE_IMAGE" --out public/web-app-manifest-192x192.png

# Générer web-app-manifest-512x512.png
echo "📱 Génération de web-app-manifest-512x512.png (512x512)..."
sips -z 512 512 "$SOURCE_IMAGE" --out public/web-app-manifest-512x512.png

# Générer apple-icon.png (180x180 recommandé pour iOS)
echo "🍎 Génération de apple-icon.png (180x180)..."
sips -z 180 180 "$SOURCE_IMAGE" --out public/apple-icon.png

echo ""
echo "✅ Icônes générées avec succès dans public/:"
ls -lh public/web-app-manifest-*.png public/apple-icon.png

echo ""
echo "🎉 Terminé ! Tu peux maintenant tester l'app en PWA."
