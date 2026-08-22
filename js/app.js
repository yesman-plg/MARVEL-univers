// ============================================================================
// app.js — routeur + rendu du site (aucune dépendance externe)
// ============================================================================

const app = document.getElementById('app');

// ---------------------------------------------------------------- ROUTER ---
window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => {
  if (!location.hash) location.hash = '#/accueil';
  render();
});

function parseHash() {
  const raw = (location.hash || '#/accueil').replace(/^#\//, '');
  const parts = raw.split('/');
  return { route: parts[0] || 'accueil', param: parts[1] ? decodeURIComponent(parts[1]) : null };
}

function render() {
  const { route, param } = parseHash();
  document.querySelectorAll('.mainnav a').forEach(a => a.classList.remove('active'));
  const activeLink = document.querySelector(`.mainnav a[href="#/${route}"]`) ||
                      (route === 'fiche' ? null : document.querySelector('.mainnav a[href="#/accueil"]'));
  if (activeLink) activeLink.classList.add('active');

  window.scrollTo(0, 0);

  if (route === 'catalogue') return renderCatalogue();
  if (route === 'fiche') return renderFiche(param);
  if (route === 'chronologie') return renderChronologie(param || 'mcu');
  return renderAccueil();
}

// -------------------------------------------------------------- AFFICHES ---
// Récupère l'affiche via l'API publique Wikipédia (anglais), avec cache
// localStorage pour éviter de re-fetcher à chaque navigation.
const POSTER_CACHE_KEY = 'marvelsite_poster_cache_v1';
function loadPosterCache() {
  try { return JSON.parse(localStorage.getItem(POSTER_CACHE_KEY)) || {}; }
  catch { return {}; }
}
function savePosterCache(cache) {
  try { localStorage.setItem(POSTER_CACHE_KEY, JSON.stringify(cache)); } catch {}
}
const posterCache = loadPosterCache();

async function fetchPosterUrl(wikiTitle) {
  if (posterCache[wikiTitle] !== undefined) return posterCache[wikiTitle];
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('not ok');
    const data = await res.json();
    const img = (data.thumbnail && data.thumbnail.source) || (data.originalimage && data.originalimage.source) || null;
    posterCache[wikiTitle] = img;
    savePosterCache(posterCache);
    return img;
  } catch {
    posterCache[wikiTitle] = null;
    savePosterCache(posterCache);
    return null;
  }
}

function initials(title) {
  return title.split(' ').filter(w => /^[A-ZÀ-Ý0-9]/.test(w)).slice(0, 3).map(w => w[0]).join('');
}

// Construit une vignette d'affiche : place un fallback stylé immédiatement,
// puis remplace par la vraie image dès qu'elle est chargée (si dispo).
function mountPoster(wrapEl, item, badgeText) {
  const badge = item.upcoming ? 'À venir' : badgeText;
  wrapEl.innerHTML = `${badge ? `<span class="badge">${badge}</span>` : ''}<div class="poster-fallback">${initials(item.title)}</div>`;
  fetchPosterUrl(item.wikiTitle).then(src => {
    if (!src) return;
    const img = new Image();
    img.alt = item.title;
    img.onload = () => {
      const badge = wrapEl.querySelector('.badge');
      wrapEl.innerHTML = '';
      if (badge) wrapEl.appendChild(badge);
      wrapEl.appendChild(img);
    };
    img.onerror = () => {}; // garde le fallback
    img.src = src;
  });
}

// ------------------------------------------------------------- ACCUEIL ---
function renderAccueil() {
  app.innerHTML = `
    <section class="hero">
      <h1>L'univers Marvel</h1>
      <p>De ses origines en petit éditeur de comics à la plus grande machine à franchises du cinéma mondial :
      voici l'histoire de Marvel, en résumé, et un guide de tout ce qu'il y a à regarder.</p>
    </section>

    <div class="timeline-block">
      <div class="era">1939 – 1961 · Les débuts (Timely / Atlas Comics)</div>
      <h2>Naissance d'un éditeur</h2>
      <p>Marvel naît en 1939 sous le nom de <strong>Timely Comics</strong>, fondé par Martin Goodman. On y voit apparaître
      les premières versions de la Torche Humaine et de Namor. Après-guerre, l'éditeur devient <strong>Atlas Comics</strong>
      dans les années 1950 et publie surtout des comics d'horreur, de western et de romance, le genre super-héros
      étant tombé en désuétude.</p>
    </div>

    <div class="timeline-block">
      <div class="era">1961 – 1970 · L'Ère d'argent</div>
      <h2>Stan Lee, Jack Kirby et la naissance des Quatre Fantastiques</h2>
      <p>En 1961, Stan Lee, Jack Kirby et Steve Ditko révolutionnent le genre avec des héros faillibles et humains :
      les <strong>Fantastic Four</strong> (1961), <strong>Hulk</strong>, <strong>Thor</strong>, <strong>Spider-Man</strong>,
      <strong>Iron Man</strong>, les <strong>X-Men</strong> et les <strong>Avengers</strong> voient tous le jour entre 1961
      et 1963. L'éditeur prend officiellement le nom de <strong>Marvel Comics</strong> en 1963.</p>
    </div>

    <div class="timeline-block">
      <div class="era">1990 – 2005 · Crise et ventes de droits</div>
      <h2>La quasi-faillite et la naissance des franchises séparées</h2>
      <p>Marvel frôle la faillite en 1996 et, pour survivre, vend les droits cinéma de plusieurs de ses personnages phares :
      les <strong>X-Men</strong> et <strong>Fantastic Four</strong> à la 20th Century Fox, <strong>Spider-Man</strong> à
      Sony Pictures, <strong>Hulk</strong> à Universal. C'est cette dispersion des droits qui explique pourquoi ces héros
      ont longtemps vécu dans des films totalement séparés de « l'univers Marvel » du cinéma.</p>
    </div>

    <div class="timeline-block">
      <div class="era">2005 – 2009 · Marvel Studios voit le jour</div>
      <h2>Le pari du studio indépendant</h2>
      <p>En 2005, Marvel crée son propre studio de production et hypothèque ses personnages restants pour financer
      ses films en indépendant. <strong>Iron Man</strong> sort en 2008, marquant la naissance officielle du
      <strong>Marvel Cinematic Universe (MCU)</strong>. En 2009, <strong>Disney rachète Marvel Entertainment</strong>
      pour 4 milliards de dollars.</p>
    </div>

    <div class="timeline-block">
      <div class="era">2013 – 2019 · Netflix, Sony et l'expansion</div>
      <h2>Multiplication des univers</h2>
      <p>Marvel Television lance un univers de séries sombres sur Netflix (<strong>Daredevil</strong>, <strong>Jessica Jones</strong>,
      <strong>Luke Cage</strong>, <strong>Iron Fist</strong>) culminant avec le crossover <strong>The Defenders</strong> (2017).
      De son côté, Sony continue seule avec Spider-Man puis lance son propre « <strong>Sony's Spider-Man Universe</strong> »
      centré sur <strong>Venom</strong>, sans lien direct avec le MCU.</p>
    </div>

    <div class="timeline-block">
      <div class="era">2019 – aujourd'hui · Réunification</div>
      <h2>Disney rachète la Fox, le multivers ouvre toutes les portes</h2>
      <p>En 2019, <strong>Disney rachète 21st Century Fox</strong>, récupérant les droits des <strong>X-Men</strong> et des
      <strong>Fantastic Four</strong>. Le MCU explore alors le concept de <strong>multivers</strong>
      (Loki, Spider-Man: No Way Home, Doctor Strange 2) pour finalement réunir officiellement l'ancien univers X-Men
      Fox et le MCU dans <strong>Deadpool & Wolverine</strong> (2024), avant l'arrivée des Quatre Fantastiques
      dans le MCU en 2025.</p>
    </div>

    <div class="timeline-block">
      <div class="era">Pour la suite</div>
      <h2>Quatre univers, un même site</h2>
      <p>Ce site recense quatre grandes continuités : le <strong>MCU</strong> officiel, la saga <strong>X-Men</strong>
      de la Fox, l'univers <strong>Spider-Man</strong> de Sony (trilogies Raimi/Amazing + Venom), et les
      <strong>séries Netflix</strong>. Direction le <a href="#/catalogue">catalogue</a> pour parcourir chaque fiche,
      ou la page <a href="#/chronologie">ordre chronologique</a> pour savoir dans quel ordre tout regarder.</p>
    </div>
  `;
}

// ------------------------------------------------------------ CATALOGUE ---
let catalogueState = { franchise: 'all', type: 'all', search: '' };

function renderCatalogue() {
  const franchises = Object.keys(FRANCHISE_LABELS);

  app.innerHTML = `
    <div class="filters" id="filters">
      <button data-f="all" class="${catalogueState.franchise === 'all' ? 'active' : ''}">Tous les univers</button>
      ${franchises.map(f => `<button data-f="${f}" class="${catalogueState.franchise === f ? 'active' : ''}">${FRANCHISE_LABELS[f]}</button>`).join('')}
      <button data-t="all" class="type-btn ${catalogueState.type === 'all' ? 'active' : ''}">Tout type</button>
      <button data-t="Film" class="type-btn ${catalogueState.type === 'Film' ? 'active' : ''}">Films</button>
      <button data-t="Série" class="type-btn ${catalogueState.type === 'Série' ? 'active' : ''}">Séries</button>
      <input type="search" id="search-input" placeholder="Rechercher un titre..." value="${catalogueState.search}">
    </div>
    <div class="grid" id="grid"></div>
  `;

  document.querySelectorAll('#filters button[data-f]').forEach(btn => {
    btn.addEventListener('click', () => { catalogueState.franchise = btn.dataset.f; renderCatalogue(); });
  });
  document.querySelectorAll('#filters button.type-btn').forEach(btn => {
    btn.addEventListener('click', () => { catalogueState.type = btn.dataset.t; renderCatalogue(); });
  });
  document.getElementById('search-input').addEventListener('input', (e) => {
    catalogueState.search = e.target.value;
    renderGrid();
  });

  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('grid');
  const q = catalogueState.search.trim().toLowerCase();
  const items = MARVEL_DATA.filter(it => {
    if (catalogueState.franchise !== 'all' && it.franchise !== catalogueState.franchise) return false;
    if (catalogueState.type !== 'all' && it.type !== catalogueState.type) return false;
    if (q && !it.title.toLowerCase().includes(q)) return false;
    return true;
  }).sort((a, b) => a.year - b.year || a.releaseOrder - b.releaseOrder);

  if (items.length === 0) {
    grid.innerHTML = `<div class="empty-msg">Aucun résultat.</div>`;
    return;
  }

  grid.innerHTML = items.map(it => `
    <div class="card" data-id="${it.id}">
      <div class="poster-wrap" id="poster-${it.id}"></div>
      <div class="card-info">
        <h3>${it.title}</h3>
        <div class="meta">${it.year} · ${it.type}</div>
      </div>
    </div>
  `).join('');

  items.forEach(it => {
    const wrap = document.getElementById(`poster-${it.id}`);
    mountPoster(wrap, it, FRANCHISE_LABELS[it.franchise]);
  });

  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => { location.hash = `#/fiche/${card.dataset.id}`; });
  });
}

// ---------------------------------------------------------------- FICHE ---
function renderFiche(id) {
  const item = MARVEL_DATA.find(it => it.id === id);
  if (!item) {
    app.innerHTML = `<a class="back-link" href="#/catalogue">&larr; Retour au catalogue</a><div class="empty-msg">Fiche introuvable.</div>`;
    return;
  }

  app.innerHTML = `
    <a class="back-link" href="#/catalogue">&larr; Retour au catalogue</a>
    <div class="fiche">
      <div class="fiche-poster" id="fiche-poster"></div>
      <div class="fiche-body">
        <h1>${item.title}</h1>
        <div class="fiche-tags">
          <span class="tag">${FRANCHISE_LABELS[item.franchise]}</span>
          <span class="tag">${item.type}</span>
          <span class="tag">${item.saga}</span>
          ${item.upcoming ? '<span class="tag">À venir</span>' : ''}
        </div>
        <dl class="fiche-facts">
          <dt>Année</dt><dd>${item.year}</dd>
          <dt>Réalisateur</dt><dd>${item.director}</dd>
          <dt>Casting</dt><dd>${item.cast.join(', ')}</dd>
          <dt>Durée</dt><dd>${item.duration}</dd>
          <dt>Situé en</dt><dd>${item.chronoNote}</dd>
        </dl>
        <div class="fiche-synopsis">
          <h2>Synopsis</h2>
          <p>${item.synopsis}</p>
        </div>
        <a class="wiki-link" target="_blank" rel="noopener" href="https://en.wikipedia.org/wiki/${encodeURIComponent(item.wikiTitle.replace(/ /g, '_'))}">Voir la page Wikipédia (EN) &rarr;</a>
      </div>
    </div>
  `;

  mountPoster(document.getElementById('fiche-poster'), item, null);
}

// ---------------------------------------------------------- CHRONOLOGIE ---
function renderChronologie(activeFranchise) {
  const franchises = Object.keys(FRANCHISE_LABELS);
  if (!franchises.includes(activeFranchise)) activeFranchise = 'mcu';

  app.innerHTML = `
    <div class="chrono-tabs" id="chrono-tabs">
      ${franchises.map(f => `<button data-f="${f}" class="${f === activeFranchise ? 'active' : ''}">${FRANCHISE_LABELS[f]}</button>`).join('')}
    </div>
    <div class="chrono-note">${FRANCHISE_NOTES[activeFranchise]}</div>
    <div class="chrono-list" id="chrono-list"></div>
  `;

  document.querySelectorAll('#chrono-tabs button').forEach(btn => {
    btn.addEventListener('click', () => { location.hash = `#/chronologie/${btn.dataset.f}`; });
  });

  const groupFranchises = (typeof CHRONO_GROUPS !== 'undefined' && CHRONO_GROUPS[activeFranchise]) || [activeFranchise];
  const items = MARVEL_DATA
    .filter(it => groupFranchises.includes(it.franchise))
    .sort((a, b) => a.chronoOrder - b.chronoOrder);

  const list = document.getElementById('chrono-list');
  list.innerHTML = items.map((it, i) => `
    <div class="chrono-item" data-id="${it.id}">
      <div class="chrono-num">${i + 1}</div>
      <div class="chrono-main">
        <h4>${it.title}${it.franchise !== activeFranchise ? ` <small style="color:var(--gold); font-weight:700;">[${FRANCHISE_LABELS[it.franchise]}]</small>` : ''}</h4>
        <span>${it.type} · ${it.year} · ${it.saga}</span>
      </div>
      <div class="chrono-when">${it.chronoNote}</div>
    </div>
  `).join('');

  list.querySelectorAll('.chrono-item').forEach(el => {
    el.addEventListener('click', () => { location.hash = `#/fiche/${el.dataset.id}`; });
  });
}
