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
  'ant-man': 209,
  'ant-man-wasp': 239,
  'avengers-ultron': 241,
  'black-panther': 280,
  'black-widow': 307,
  'captain-america-first-avenger': 321,
  'captain-america-winter-soldier': 324,
  'captain-marvel': 327,
  'civil-war': 314,
  'doctor-strange': 333,
  'doctor-strange-multiverse': 334,
  'endgame': 274,
  'eternals': 341,
  'eyes-of-wakanda': 463,
  'falcon-winter-soldier': 438,
  'guardians-galaxy': 368,
  'guardians-galaxy-2': 365,
  'incredible-hulk': 361,
  'infinity-war': 278,
  'iron-man': 344,
  'iron-man-2': 353,
  'iron-man-3': 355,
  'loki-s1': 409,
  'no-way-home': 382,
  'oneshot-agent-carter': 208,
  'oneshot-funny-thing-thor-hammer': 369,
  'punisher-s1': 449,
  'punisher-s2': 390,
  'shang-chi': 370,
  'spiderman-far-from-home': 375,
  'spiderman-homecoming': 378,
  'thor': 388,
  'thor-ragnarok': 385,
  'wandavision': 427,
  'what-if-s1': 417,
};

function plexLinkFor(itemId) {
  const ratingKey = PLEX_LIBRARY[itemId];
  if (!ratingKey) return null;
  return `${PLEX_SERVER.baseUrl}/web/index.html#!/server/${PLEX_SERVER.machineIdentifier}/details?key=%2Flibrary%2Fmetadata%2F${ratingKey}`;
}
