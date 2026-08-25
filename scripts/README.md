# Scripts — synchro Plex

Pour relier automatiquement les fiches du site aux films/séries réellement
disponibles sur ton serveur Plex, et afficher le bouton "Regarder sur Plex".

## Utilisation normale (à chaque ajout de contenu sur kDrive)

Une seule commande, depuis le dossier du site :

```bash
cd ~/marvel-site
./scripts/update_plex_and_push.sh
```

Ça fait tout : rafraîchit le cache kDrive, relance le scan Plex, relie les
nouveaux titres, commit et pousse sur GitHub. Si tu viens d'ajouter beaucoup
de fichiers, laisse quelques secondes/dizaines de secondes à Plex pour finir
son scan avant d'appuyer sur Entrée quand le script te le demande — sinon
relance simplement le script une seconde fois plus tard, ça ne casse rien.

## Prérequis : le token Plex (`~/.plex_token`)

Le script a besoin d'un fichier `~/.plex_token` contenant ton token d'accès
Plex (pas de risque à le garder en clair localement — ce fichier n'est
jamais copié dans le dépôt Git, donc jamais publié sur GitHub).

**S'il n'existe pas ou plus (nouvelle machine, token expiré/régénéré) :**

1. Ouvre `http://192.168.86.24:32400/web`
2. Clique sur n'importe quel film → menu `⋯` → **"Obtenir des infos"** →
   **"Afficher XML"** (en bas de la fenêtre)
3. Dans l'URL qui s'ouvre dans un nouvel onglet, repère `X-Plex-Token=xxxxx`
   et copie uniquement cette valeur
4. Dans un terminal :
   ```bash
   echo 'TON_TOKEN_ICI' > ~/.plex_token
   chmod 600 ~/.plex_token
   ```

## En cas de souci

- **Le scan Plex a l'air planté / rien de nouveau détecté** : vérifie que le
  fichier est bien dans `/mnt/kdrive/film:serie/MARVEL/` (films) ou dans son
  propre dossier de série (`/mnt/kdrive/film:serie/NomDeLaSerie/`), attends
  une minute, relance `./scripts/update_plex_and_push.sh`.
- **Un titre Marvel apparaît en `??` (pas de correspondance) dans la sortie
  du script** : soit ce film/série n'existe pas encore comme fiche sur le
  site (à ajouter dans `js/data.js` d'abord), soit le titre Plex est trop
  différent du titre du site pour matcher automatiquement — regarde la liste
  `PLEX_LIBRARY` dans `js/plex.js` et ajoute la ligne à la main si besoin :
  ```js
  'id-de-la-fiche': 123,   // 123 = le ratingKey Plex du film
  ```
  (le `ratingKey` est visible dans l'URL "Obtenir des infos → Afficher XML"
  du film concerné, ou dans la sortie du script `sync_plex_library.py`)
- **Juste relier un seul titre, sans tout rescanner** : lance directement
  ```bash
  python3 scripts/sync_plex_library.py --apply
  ```
  (saute les étapes de rafraîchissement kDrive/Plex — utile si tu sais que
  Plex a déjà bien vu le fichier)
- **Le bouton "Regarder sur Plex" ne marche pas** : normal si tu n'es pas
  sur le réseau Wi-Fi de la maison — l'accès distant Plex n'est pas encore
  configuré (port forwarding ou Plex Relay, à faire un jour).
