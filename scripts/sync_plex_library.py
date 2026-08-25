#!/usr/bin/env python3
"""
Scanne la bibliothèque Plex (Films + Séries TV), fait correspondre chaque
titre trouvé aux fiches du site (js/data.js), et régénère js/plex.js.

Usage :
    python3 scripts/sync_plex_library.py [--apply]

Sans --apply : affiche juste ce qui serait fait (dry-run).
Avec --apply : réécrit réellement js/plex.js.

Le token Plex est lu depuis ~/.plex_token (jamais commité sur le dépôt).
"""
import json
import re
import subprocess
import sys
import unicodedata
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET
from difflib import SequenceMatcher
from pathlib import Path

REPO_DIR = Path(__file__).resolve().parent.parent
PLEX_BASE = "http://192.168.86.24:32400"
MACHINE_IDENTIFIER = "4303e078458e22fa43242dbfaafeb5ea5a21ceb8"
TOKEN_FILE = Path.home() / ".plex_token"
MOVIE_SECTION = 2
SHOW_SECTION = 3

# Sections/dossiers non-Marvel connus dans la bibliothèque Séries, à ignorer
# d'office même s'ils matchaient par erreur.
IGNORE_SHOW_TITLES = {"fire force", "coldwater"}


def normalize(s):
    if not s:
        return ""
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode("ascii")
    s = s.lower()
    s = re.sub(r"[':,.!?&]", "", s)
    s = re.sub(r"\bthe\b|\ble\b|\bla\b|\bles\b|\bl\b", "", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s


def load_marvel_data():
    node_script = """
const fs = require("fs");
const code = fs.readFileSync("js/data.js", "utf8") + "\\nmodule.exports = {MARVEL_DATA};";
const Module = require("module");
const m = new Module("data");
m._compile(code, "data.js");
console.log(JSON.stringify(m.exports.MARVEL_DATA.map(x => ({id: x.id, title: x.title, wikiTitle: x.wikiTitle, year: x.year, type: x.type}))));
"""
    result = subprocess.run(["node", "-e", node_script], cwd=REPO_DIR, capture_output=True, text=True, check=True)
    return json.loads(result.stdout)


def load_token():
    if not TOKEN_FILE.exists():
        sys.exit(f"Token Plex introuvable : {TOKEN_FILE} (crée-le avec ton token dedans, chmod 600).")
    return TOKEN_FILE.read_text().strip()


def fetch_section(section_id, token):
    url = f"{PLEX_BASE}/library/sections/{section_id}/all?X-Plex-Token={urllib.parse.quote(token)}"
    with urllib.request.urlopen(url, timeout=15) as resp:
        xml = resp.read().decode("utf-8")
    root = ET.fromstring(xml)
    items = []
    tag = "Video" if section_id == MOVIE_SECTION else "Directory"
    for el in root.findall(tag):
        items.append({
            "ratingKey": el.get("ratingKey"),
            "title": el.get("title", ""),
            "originalTitle": el.get("originalTitle", ""),
            "slug": el.get("slug", ""),
            "year": el.get("year"),
        })
    return items


def best_match(plex_item, marvel_data, used_ids):
    candidates = [normalize(plex_item["title"]), normalize(plex_item["originalTitle"]),
                  normalize((plex_item["slug"] or "").replace("-", " "))]
    candidates = [c for c in candidates if c]
    py = plex_item["year"]

    best = None
    best_score = 0.0
    for entry in marvel_data:
        if entry["id"] in used_ids:
            continue
        if py and abs(int(py) - int(entry["year"])) > 1:
            continue
        entry_candidates = [normalize(entry["title"]), normalize(entry["wikiTitle"])]
        for pc in candidates:
            for ec in entry_candidates:
                if not pc or not ec:
                    continue
                if pc == ec:
                    return entry, 1.0
                score = SequenceMatcher(None, pc, ec).ratio()
                if score > best_score:
                    best_score = score
                    best = entry
    if best_score >= 0.82:
        return best, best_score
    return None, best_score


def main():
    apply_changes = "--apply" in sys.argv

    marvel_data = load_marvel_data()
    token = load_token()

    movies = fetch_section(MOVIE_SECTION, token)
    shows = fetch_section(SHOW_SECTION, token)
    shows = [s for s in shows if normalize(s["title"]) not in {normalize(t) for t in IGNORE_SHOW_TITLES}]

    plex_items = movies + shows
    print(f"Bibliothèque Plex : {len(movies)} films, {len(shows)} séries (hors non-Marvel) -> {len(plex_items)} à matcher\n")

    library = {}
    used_ids = set()
    unmatched = []

    for item in plex_items:
        entry, score = best_match(item, marvel_data, used_ids)
        if entry:
            library[entry["id"]] = int(item["ratingKey"])
            used_ids.add(entry["id"])
            flag = "" if score == 1.0 else f"  (fuzzy match, confiance {score:.2f})"
            print(f"  OK  {item['title']!r} (Plex #{item['ratingKey']}) -> {entry['id']}{flag}")
        else:
            unmatched.append(item)
            print(f"  ??  {item['title']!r} (Plex #{item['ratingKey']}, {item['year']}) — aucune fiche correspondante trouvée")

    print(f"\n{len(library)}/{len(plex_items)} titres reliés.")
    if unmatched:
        print(f"{len(unmatched)} titres Plex sans correspondance (pas grave si ce ne sont pas des films/séries Marvel du site) :")
        for u in unmatched:
            print(f"   - {u['title']} ({u['year']})")

    if not apply_changes:
        print("\n(dry-run — relance avec --apply pour écrire js/plex.js)")
        return

    lines = [
        "// ============================================================================",
        "// PLEX_SERVER / PLEX_LIBRARY — intégration avec le serveur Plex local d'Evan.",
        "// Généré automatiquement par scripts/sync_plex_library.py --apply.",
        "// L'accès distant Plex n'est pas encore configuré : ces liens ne fonctionnent",
        "// que depuis le réseau Wi-Fi de la maison (adresse LAN 192.168.86.24).",
        "// machineIdentifier n'est pas une donnée sensible (pas un token d'accès).",
        "// ============================================================================",
        "",
        "const PLEX_SERVER = {",
        "  baseUrl: 'http://192.168.86.24:32400',",
        f"  machineIdentifier: '{MACHINE_IDENTIFIER}',",
        "};",
        "",
        "const PLEX_LIBRARY = {",
    ]
    for _id, key in sorted(library.items()):
        lines.append(f"  '{_id}': {key},")
    lines.append("};")
    lines.append("")
    lines.append("function plexLinkFor(itemId) {")
    lines.append("  const ratingKey = PLEX_LIBRARY[itemId];")
    lines.append("  if (!ratingKey) return null;")
    lines.append("  return `${PLEX_SERVER.baseUrl}/web/index.html#!/server/${PLEX_SERVER.machineIdentifier}/details?key=%2Flibrary%2Fmetadata%2F${ratingKey}`;")
    lines.append("}")

    out_path = REPO_DIR / "js" / "plex.js"
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\n✓ {out_path} régénéré ({len(library)} entrées).")


if __name__ == "__main__":
    main()
