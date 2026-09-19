// ============================================================================
// WATCH_PROVIDERS — liens « où regarder » pour les titres absents du serveur
// Plex (82 fiches sur 125). Les URL sont construites à la volée à partir du
// titre : il n'y a rien à maintenir fiche par fiche.
//
// Fichier écrit à la main : contrairement à js/plex.js, il n'est PAS régénéré
// par scripts/sync_plex_library.py, donc rien n'est écrasé au prochain sync.
//
// /!\ Movix change régulièrement de domaine pour contourner les blocages
// (movix.zip, .world, .run, .sbs, .cfd, .surf, .it.com...). Quand le bouton ne
// répond plus, il suffit de corriger la ligne `url` ci-dessous, rien d'autre.
// Format de recherche vérifié le 19/09/2026 : /search/<titre encodé>.
// Le domaine peut aussi être filtré par le DNS du FAI : c'est pour ça que
// JustWatch (légal, domaine stable) est le bouton principal.
// ============================================================================

// Passer à false pour ne garder les liens que sur les fiches, sans les badges
// sur les vignettes du catalogue ni dans la chronologie.
const SHOW_WATCH_BADGES = true;

const WATCH_PROVIDERS = [
  { key: 'justwatch', label: '🔎 Où regarder ?', url: 'https://www.justwatch.com/fr/recherche?q={q}' },
  { key: 'movix',     label: '▶ Movix',          url: 'https://movix.zip/search/{q}' },
];

// "Daredevil (Saison 1)" -> "Daredevil" : le suffixe entre parenthèses fausse
// la recherche sur les deux sites (même nettoyage que pour les noms d'acteurs).
function watchQuery(item) {
  return encodeURIComponent(item.title.replace(/\s*\([^)]*\)\s*$/, '').trim());
}

// Liens de repli pour un titre. Vide si le titre est déjà sur Plex (le bouton
// Plex prime, pas de doublon) ou s'il n'est pas encore sorti.
function watchLinksFor(item) {
  if (!item || item.upcoming) return [];
  if (typeof plexLinkFor === 'function' && plexLinkFor(item.id)) return [];
  const q = watchQuery(item);
  return WATCH_PROVIDERS.map(p => ({ key: p.key, label: p.label, href: p.url.replace('{q}', q) }));
}

function hasWatchLinks(item) {
  return SHOW_WATCH_BADGES && watchLinksFor(item).length > 0;
}
