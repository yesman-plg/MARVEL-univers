// ============================================================================
// PLEX_SERVER / PLEX_LIBRARY — intégration avec le serveur Plex local d'Evan.
// Généré automatiquement par scripts/sync_plex_library.py --apply.
// L'accès distant Plex n'est pas encore configuré : ces liens ne fonctionnent
// que depuis le réseau Wi-Fi de la maison (adresse LAN 192.168.86.24).
// machineIdentifier n'est pas une donnée sensible (pas un token d'accès).
// ============================================================================

const PLEX_SERVER = {
  baseUrl: 'http://192.168.86.24:32400',
  machineIdentifier: '4303e078458e22fa43242dbfaafeb5ea5a21ceb8',
};

const PLEX_LIBRARY = {
  'ant-man': 10,
  'ant-man-wasp': 133,
  'avengers-ultron': 40,
  'black-panther': 141,
  'black-widow': 168,
  'captain-america-first-avenger': 41,
  'captain-america-winter-soldier': 76,
  'captain-marvel': 79,
  'civil-war': 175,
  'doctor-strange': 182,
  'doctor-strange-multiverse': 185,
  'endgame': 134,
  'eternals': 190,
  'eyes-of-wakanda': 119,
  'guardians-galaxy': 109,
  'guardians-galaxy-2': 106,
  'incredible-hulk': 102,
  'infinity-war': 139,
  'iron-man': 85,
  'iron-man-2': 94,
  'iron-man-3': 96,
  'no-way-home': 202,
  'oneshot-agent-carter': 9,
  'oneshot-funny-thing-thor-hammer': 110,
  'shang-chi': 193,
  'spiderman-far-from-home': 111,
  'spiderman-homecoming': 194,
  'thor': 114,
  'thor-ragnarok': 205,
};

function plexLinkFor(itemId) {
  const ratingKey = PLEX_LIBRARY[itemId];
  if (!ratingKey) return null;
  return `${PLEX_SERVER.baseUrl}/web/index.html#!/server/${PLEX_SERVER.machineIdentifier}/details?key=%2Flibrary%2Fmetadata%2F${ratingKey}`;
}
