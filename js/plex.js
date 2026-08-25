// ============================================================================
// PLEX_SERVER / PLEX_LIBRARY — intégration avec le serveur Plex local d'Evan.
// L'accès distant Plex n'est pas encore configuré : ces liens ne fonctionnent
// que depuis le réseau Wi-Fi de la maison (adresse LAN 192.168.86.24).
// machineIdentifier n'est pas une donnée sensible (pas un token d'accès).
// PLEX_LIBRARY : id de fiche (MARVEL_DATA) -> ratingKey Plex. Mis à jour à la
// main après chaque ajout de film/série sur le serveur — pas de synchro auto.
// ============================================================================

const PLEX_SERVER = {
  baseUrl: 'http://192.168.86.24:32400',
  machineIdentifier: '4303e078458e22fa43242dbfaafeb5ea5a21ceb8',
};

const PLEX_LIBRARY = {
  'oneshot-agent-carter': 9,
  'ant-man': 10,
  'ant-man-wasp': 133,
  'endgame': 134,
  'infinity-war': 139,
  'avengers-ultron': 40,
  'black-panther': 141,
  'black-widow': 168,
  'civil-war': 175,
  'captain-america-first-avenger': 41,
  'captain-america-winter-soldier': 76,
  'captain-marvel': 79,
  'doctor-strange': 182,
  'doctor-strange-multiverse': 185,
  'iron-man': 85,
  'iron-man-2': 94,
  'iron-man-3': 96,
  'incredible-hulk': 102,
  'eternals': 190,
  'guardians-galaxy': 109,
  'guardians-galaxy-2': 106,
  'shang-chi': 193,
  'spiderman-far-from-home': 111,
  'spiderman-homecoming': 194,
  'no-way-home': 202,
  'thor': 114,
  'thor-ragnarok': 205,
  'oneshot-funny-thing-thor-hammer': 110,
  'eyes-of-wakanda': 119,
};

function plexLinkFor(itemId) {
  const ratingKey = PLEX_LIBRARY[itemId];
  if (!ratingKey) return null;
  return `${PLEX_SERVER.baseUrl}/web/index.html#!/server/${PLEX_SERVER.machineIdentifier}/details?key=%2Flibrary%2Fmetadata%2F${ratingKey}`;
}
