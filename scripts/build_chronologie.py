#!/usr/bin/env python3
"""
Construit le fichier de données de la chronologie à partir du texte relu
(contenu/chronologie-histoire.md).

    python3 scripts/build_chronologie.py [sortie.js]

Sortie par défaut : propositions/chronologie-data.js, qui définit
`const CHRONO = { chapters: [...] }`.

Pour chaque événement, le script ajoute :
  - les affiches des films cités dans « À voir » (titres retrouvés dans js/data.js) ;
  - les portraits des personnages cités dans « Qui » (js/characters.js) ;
  - un lieu géographique (lat/lon) ou cosmique, défini dans PLACES ci-dessous.
"""
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'contenu' / 'chronologie-histoire.md'
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'propositions' / 'chronologie-data.js'

# --- Lieux : clé = début du titre de l'événement -------------------------------
# Terre : (lat, lon, libellé) ; ailleurs : (None, None, libellé)
PLACES = {
    "Les six Pierres": (None, None, "L'univers naissant"),
    "La météorite du Wakanda": (1.5, 36.0, "Wakanda, Afrique de l'Est"),
    "L'arrivée des Éternels": (32.5, 44.4, "Mésopotamie"),
    "Les Elfes Noirs": (None, None, "Svartalfheim"),
    "Odin, Hela": (None, None, "Asgard"),
    "Les Dix Anneaux": (34.3, 108.9, "Asie"),
    "La guerre contre les Géants": (59.27, 10.41, "Tønsberg, Norvège"),
    "Crâne Rouge s'empare": (59.27, 10.41, "Tønsberg, Norvège"),
    "Steve Rogers devient": (40.71, -74.0, "New York"),
    "La chute de Bucky": (46.5, 10.5, "Les Alpes"),
    "Le sacrifice de Captain": (78.0, -40.0, "Arctique"),
    "La fondation du S.H.I.E.L.D.": (38.9, -77.04, "Washington"),
    "Les missions du Soldat": (40.85, -73.2, "Long Island, New York"),
    "Ant-Man et la Guêpe disparaissent": (37.77, -122.42, "San Francisco"),
    "Carol Danvers devient": (34.05, -118.24, "Los Angeles"),
    "Le secret du roi": (37.8, -122.27, "Oakland"),
    "Tony Stark se fait": (46.95, 7.45, "Berne, Suisse"),
    "Tony Stark devient Iron Man": (34.5, 69.2, "Afghanistan"),
    "Hulk en fuite": (-22.9, -43.2, "Rio de Janeiro"),
    "Iron Man 2": (43.73, 7.42, "Monaco"),
    "Thor banni": (34.5, -106.0, "Nouveau-Mexique"),
    "Captain America sort": (78.0, -40.0, "Arctique"),
    "La Bataille de New York": (40.75, -73.98, "Manhattan, New York"),
    "Le faux Mandarin": (34.03, -118.78, "Malibu"),
    "Le Monde des ténèbres": (51.5, -0.12, "Londres"),
    "Hydra sort de l'ombre": (38.9, -77.04, "Washington"),
    "Les Gardiens de la Galaxie": (None, None, "Xandar"),
    "Ultron et la chute": (46.0, 21.0, "Sokovie, Europe de l'Est"),
    "Ant-Man": (37.77, -122.42, "San Francisco"),
    "Les Accords de Sokovie": (51.34, 12.37, "Leipzig, Allemagne"),
    "Black Widow règle": (47.5, 19.04, "Budapest"),
    "Doctor Strange": (27.7, 85.3, "Katmandou, Népal"),
    "Spider-Man : Homecoming": (40.73, -73.8, "Queens, New York"),
    "Black Panther, le Wakanda": (1.5, 36.0, "Wakanda"),
    "Ragnarok": (None, None, "Asgard"),
    "Ant-Man et la Guêpe": (37.77, -122.42, "San Francisco"),
    "Thanos réunit": (None, None, "Titan, Vormir, Wakanda"),
    "Le Snap": (1.5, 36.0, "Wakanda — l'univers entier"),
    "Cinq ans de deuil": (59.5, 10.2, "New Asgard, Norvège"),
    "Le casse temporel": (None, None, "Royaume Quantique"),
    "La bataille finale": (41.5, -74.0, "QG des Avengers, New York"),
    "WandaVision": (40.9, -74.5, "Westview, New Jersey"),
    "Sam Wilson devient": (38.9, -77.04, "Washington"),
    "Shang-Chi": (22.2, 113.55, "Macao"),
    "L'Émergence": (-10.0, 75.0, "Océan Indien"),
    "Spider-Man : Far From Home": (40.71, -74.0, "New York"),
    "Hawkeye passe": (40.76, -73.98, "New York"),
    "Wanda contre le multivers": (None, None, "Le multivers"),
    "La mort du roi": (1.5, 36.0, "Wakanda"),
    "Thor, Love and Thunder": (None, None, "Omnipotence City"),
    "Captain Marvel, Ms. Marvel": (40.72, -74.07, "Jersey City"),
    "Loki et la TVA": (None, None, "La fin des temps"),
    "Kang le Conquérant": (None, None, "Royaume Quantique"),
    "La fin des Gardiens": (None, None, "Contre-Terre"),
    "Le président Ross": (38.9, -77.04, "Washington"),
    "Thunderbolts": (40.75, -73.98, "New York"),
    "D'autres univers": (None, None, "Terre-828 et ailleurs"),
    "Avengers : Doomsday": (None, None, "Le multivers"),
}

# --- Personnages : id de js/characters.js -> noms tels qu'écrits dans le texte --
CHAR_ALIASES = {
    'tony-stark': ['Tony Stark', 'Iron Man'], 'steve-rogers': ['Steve Rogers', 'Captain America'],
    'thor': ['Thor'], 'bruce-banner': ['Bruce Banner', 'Hulk'], 'natasha-romanoff': ['Natasha Romanoff', 'Black Widow'],
    'clint-barton': ['Clint Barton', 'Hawkeye'], 'nick-fury': ['Nick Fury'], 'loki': ['Loki'],
    'peter-parker': ['Peter Parker', 'Spider-Man'], 'stephen-strange': ['Stephen Strange', 'Doctor Strange'],
    'tchalla': ["T'Challa"], 'carol-danvers': ['Carol Danvers'], 'wanda-maximoff': ['Wanda'], 'vision': ['Vision'],
    'scott-lang': ['Scott Lang', 'Ant-Man'], 'hope-van-dyne': ['Hope'], 'peter-quill': ['Peter Quill'],
    'gamora': ['Gamora'], 'drax': ['Drax'], 'rocket': ['Rocket'], 'groot': ['Groot'], 'nebula': ['Nebula'],
    'sam-wilson': ['Sam Wilson'], 'bucky-barnes': ['Bucky'], 'james-rhodes': ['James Rhodes', 'War Machine'],
    'shuri': ['Shuri'], 'okoye': ['Okoye'], 'wong': ['Wong'], 'kate-bishop': ['Kate Bishop'],
    'kamala-khan': ['Kamala Khan'], 'shang-chi': ['Shang-Chi'], 'yelena-belova': ['Yelena'],
    'valentina-de-fontaine': ['Valentina'], 'agatha-harkness': ['Agatha'], 'wilson-fisk': ['Wilson Fisk'],
    'riri-williams': ['Riri Williams'], 'thanos': ['Thanos'], 'ultron': ['Ultron'], 'erik-killmonger': ['Killmonger', 'le jeune Erik'],
    'hela': ['Hela'], 'kang': ['Kang', 'Celui qui Demeure'], 'mysterio': ['Mysterio'], 'adrian-toomes': ['Adrian Toomes'],
    'ronan': ['Ronan'], 'johann-schmidt': ['Johann Schmidt', 'Crâne Rouge'], 'valkyrie': ['Valkyrie'],
}

# Titres écrits dans le texte -> id dans js/data.js, quand la correspondance automatique échoue
FILM_ALIASES = {
    'one-shot : agent carter': 'oneshot-agent-carter',
    'loki': 'loki-s1', 'what if…?': 'what-if-s1', 'les 4 fantastiques : premiers pas': 'fantastic-four-first-steps',
    'she-hulk': 'she-hulk', 'daredevil : born again': 'daredevil-born-again',
}


def norm(s):
    s = unicodedata.normalize('NFD', s.lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]', '', s)


def load_js_data():
    js = (ROOT / 'js' / 'data.js').read_text() + (ROOT / 'js' / 'characters.js').read_text()
    code = js + '\nprocess.stdout.write(JSON.stringify({films: MARVEL_DATA, chars: MARVEL_CHARACTERS}));'
    out = subprocess.run(['node'], input=code, capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def inline(md):
    md = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', md)
    md = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<em>\1</em>', md)
    return md.replace('\\*', '*')


def main():
    db = load_js_data()
    films_by_norm = {norm(f['title']): f for f in db['films']}
    films_by_id = {f['id']: f for f in db['films']}
    chars_by_id = {c['id']: c for c in db['chars']}

    def find_film(title):
        t = title.strip()
        if t.lower() in FILM_ALIASES:
            return films_by_id.get(FILM_ALIASES[t.lower()])
        n = norm(t)
        if n in films_by_norm:
            return films_by_norm[n]
        for k, f in films_by_norm.items():           # « Loki saisons 1 et 2 » -> « Loki (Saison 1) »…
            if k.startswith(n) and f.get('franchise') == 'mcu':
                return f
        return None

    chapters, ch, ev = [], None, None
    missing = []
    for raw in SRC.read_text().splitlines():
        line = raw.rstrip()
        m = re.match(r'^## Chapitre (\d+) — (.+?) \((.+)\)$', line)
        if m:
            ch = {'n': int(m[1]), 'title': m[2], 'period': m[3], 'intro': '', 'events': []}
            chapters.append(ch); ev = None
            continue
        if line.startswith('## '):                    # « Points à vérifier » : fin du contenu
            ch = None; ev = None
            continue
        if ch is None:
            continue
        if line.startswith('> '):
            ch['intro'] = inline(line[2:]); continue
        m = re.match(r'^### (.+?) · (.+)$', line)
        if m:
            ev = {'date': m[1], 'title': m[2], 'where': '', 'who': '', 'story': '', 'consequence': '', 'watch': '', 'list': []}
            ch['events'].append(ev); continue
        if ev is None:
            continue
        m = re.match(r'^- \*\*(.+?) :\*\* (.+)$', line)
        if m:
            key = {'Où': 'where', 'Qui': 'who', 'Récit': 'story', 'Conséquence': 'consequence', 'À voir': 'watch'}.get(m[1])
            if key:
                ev[key] = m[2]
                continue
        if line.startswith('- '):
            ev['list'].append(line[2:])

    for ch in chapters:
        for ev in ch['events']:
            # films cités (*Titre* (année)) dans « À voir » et dans les listes
            src = (ev['watch'] + ' ' + ' '.join(ev['list'])).replace('\\*', '\u204e')   # astérisque échappé (Thunderbolts*)
            cited = [(t.replace('\u204e', '*'), y) for t, y in re.findall(r'\*([^*]+?)\*[^*(]*\((\d{4})', src)]
            films = []
            for t, y in cited:
                f = find_film(t)
                if f and f['id'] not in [x['id'] for x in films]:
                    films.append({'id': f['id'], 'title': f['title'], 'year': f['year'], 'poster': f.get('poster')})
                elif not f:
                    missing.append(t)
            ev['films'] = films
            ev['image'] = next((f['poster'] for f in films if f.get('poster')), None)
            # personnages
            text = ev['who'] + ' ' + ev['story']
            chars = []
            for cid, names in CHAR_ALIASES.items():
                if any(re.search(r'(?<![\w-])' + re.escape(n) + r'(?![\w-])', ev['who']) for n in names):
                    c = chars_by_id.get(cid)
                    if c and c.get('portrait'):
                        chars.append({'id': cid, 'name': next(n for n in names if n in ev['who']), 'img': c['portrait']})
            ev['chars'] = chars
            # lieu
            place = next((v for k, v in PLACES.items() if ev['title'].startswith(k)), None)
            if place is None:
                missing.append('LIEU: ' + ev['title'])
                place = (None, None, ev['where'])
            ev['geo'] = {'lat': place[0], 'lon': place[1], 'label': place[2]}
            for k in ('where', 'who', 'story', 'consequence', 'watch'):
                ev[k] = inline(ev[k])
            ev['list'] = [inline(x) for x in ev['list']]

    OUT.parent.mkdir(parents=True, exist_ok=True)
    data = {'chapters': chapters}
    OUT.write_text('// Généré par scripts/build_chronologie.py depuis contenu/chronologie-histoire.md — ne pas modifier à la main.\n'
                   'const CHRONO = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    n = sum(len(c['events']) for c in chapters)
    print(f'{len(chapters)} chapitres, {n} événements -> {OUT.relative_to(ROOT)}')
    if missing:
        print('Non retrouvés :', sorted(set(missing)))


if __name__ == '__main__':
    main()
