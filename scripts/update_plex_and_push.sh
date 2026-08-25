#!/usr/bin/env bash
# ============================================================================
# Tout-en-un : à lancer après avoir ajouté des films/séries Marvel sur kDrive.
#
#   1. Rafraîchit le cache rclone (voit les nouveaux fichiers kDrive)
#   2. Demande à Plex de rescanner ses bibliothèques Films + Séries
#   3. Relie les nouveaux titres aux fiches du site (scripts/sync_plex_library.py)
#   4. Commit + push sur GitHub si quelque chose a changé
#
# Usage : ./scripts/update_plex_and_push.sh
# Nécessite : le token Plex dans ~/.plex_token (voir README.md si absent)
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

TOKEN_FILE="$HOME/.plex_token"
if [ ! -f "$TOKEN_FILE" ]; then
  echo "Erreur : $TOKEN_FILE introuvable."
  echo "Récupère ton token Plex (web Plex -> un film -> ... -> Obtenir des infos"
  echo "-> Afficher XML -> copie la valeur après X-Plex-Token= dans l'URL),"
  echo "puis : echo 'TON_TOKEN' > ~/.plex_token && chmod 600 ~/.plex_token"
  exit 1
fi
TOKEN=$(cat "$TOKEN_FILE")

echo "==> 1/4  Rafraîchissement du cache rclone (kDrive)..."
curl -s -X POST http://localhost:5572/vfs/refresh > /dev/null
echo "    fait."

echo "==> 2/4  Scan des bibliothèques Plex (Films + Séries)..."
curl -s "http://192.168.86.24:32400/library/sections/2/refresh?X-Plex-Token=${TOKEN}" > /dev/null
curl -s "http://192.168.86.24:32400/library/sections/3/refresh?X-Plex-Token=${TOKEN}" > /dev/null
echo "    lancé (Plex scanne en tâche de fond, ça peut prendre 10-30s pour de gros ajouts)."
echo "    Patiente un peu avant de continuer si tu viens d'ajouter beaucoup de fichiers."
read -p "    Appuie sur Entrée quand tu penses que le scan est fini... " _

echo "==> 3/4  Mise à jour de js/plex.js..."
python3 scripts/sync_plex_library.py --apply

echo "==> 4/4  Commit + push si besoin..."
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "Mise a jour automatique de la bibliotheque Plex (sync_plex_library.py)"
  git push origin main
  echo "    poussé sur GitHub."
else
  echo "    rien de nouveau, aucun commit."
fi

echo ""
echo "Terminé."
