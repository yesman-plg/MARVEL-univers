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

// -------------------------------------------------------- NAVIGATION RETOUR ---
// Mémorise la page-liste (catalogue / chronologie) d'où l'on part, et le
// titre précis sur lequel on a cliqué, pour pouvoir y revenir exactement au
// bon endroit (scroll + surbrillance) via le lien "Retour".
function rememberListRoute() { sessionStorage.setItem('marvelsite_lastListRoute', location.hash); }
function getLastListRoute() { return sessionStorage.getItem('marvelsite_lastListRoute') || '#/catalogue'; }
function rememberScrollTarget(id) { sessionStorage.setItem('marvelsite_scrollTarget', id); }
function consumeScrollTarget() {
  const id = sessionStorage.getItem('marvelsite_scrollTarget');
  sessionStorage.removeItem('marvelsite_scrollTarget');
  return id;
}
function restoreScrollTarget(selectorPrefix) {
  const id = consumeScrollTarget();
  if (!id) return;
  const el = document.querySelector(`${selectorPrefix}[data-id="${id}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: 'auto', block: 'center' });
  el.classList.add('flash-highlight');
  setTimeout(() => el.classList.remove('flash-highlight'), 1800);
}

// ------------------------------------------------------------ MON AVIS ---
// Stockage 100% local au navigateur (localStorage) : vu / note / commentaire
// par fiche. Rien n'est envoyé nulle part, ni partagé avec les autres
// visiteurs du site — c'est un suivi personnel propre à cet appareil.
const USER_DATA_KEY = 'marvelsite_userdata_v1';
function loadUserData() {
  try { return JSON.parse(localStorage.getItem(USER_DATA_KEY)) || {}; }
  catch { return {}; }
}
function saveUserData(data) {
  try { localStorage.setItem(USER_DATA_KEY, JSON.stringify(data)); } catch {}
}
function getUserEntry(id) {
  const data = loadUserData();
  return data[id] || { watched: false, rating: 0, comment: '' };
}
function setUserEntry(id, patch) {
  const data = loadUserData();
  data[id] = Object.assign({ watched: false, rating: 0, comment: '' }, data[id], patch);
  saveUserData(data);
  return data[id];
}

function render() {
  const { route, param } = parseHash();
  document.querySelectorAll('.mainnav a').forEach(a => a.classList.remove('active'));
  const navRoute = route === 'personnage' ? 'personnages' : route;
  const activeLink = document.querySelector(`.mainnav a[href="#/${navRoute}"]`) ||
                      (route === 'fiche' ? null : document.querySelector('.mainnav a[href="#/accueil"]'));
  if (activeLink) activeLink.classList.add('active');

  window.scrollTo(0, 0);

  if (route === 'catalogue') return renderCatalogue();
  if (route === 'fiche') return renderFiche(param);
  if (route === 'chronologie') return renderChronologie(param || 'mcu');
  if (route === 'personnages') return renderPersonnages();
  if (route === 'personnage') return renderPersonnage(param);
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
function mountPoster(wrapEl, item, badgeText, showPlexBadge = true) {
  const badge = item.upcoming ? 'À venir' : badgeText;
  const watchedBadge = getUserEntry(item.id).watched ? '<span class="watched-badge">Vu</span>' : '';
  const plexBadge = (showPlexBadge && typeof plexLinkFor === 'function' && plexLinkFor(item.id)) ? '<span class="plex-badge">▶ Plex</span>' : '';
  const watchBadge = (showPlexBadge && !plexBadge && typeof hasWatchLinks === 'function' && hasWatchLinks(item)) ? '<span class="watch-badge">Où voir</span>' : '';
  wrapEl.innerHTML = `${badge ? `<span class="badge">${badge}</span>` : ''}${watchedBadge}${plexBadge}${watchBadge}<div class="poster-fallback">${initials(item.title)}</div>`;

  const showImage = (src, onFail) => {
    const img = new Image();
    img.alt = item.title;
    img.onload = () => {
      const kept = Array.from(wrapEl.querySelectorAll('.badge, .watched-badge, .plex-badge, .watch-badge'));
      wrapEl.innerHTML = '';
      kept.forEach(el => wrapEl.appendChild(el));
      wrapEl.appendChild(img);
    };
    img.onerror = () => { if (onFail) onFail(); }; // sinon la vignette stylée déjà affichée reste
    img.src = src;
  };

  const fetchLive = () => {
    fetchPosterUrl(item.wikiTitle).then(src => { if (src) showImage(src, null); });
  };

  // Priorité : affiche stockée localement dans le dépôt ; sinon fetch live
  // Wikipédia ; sinon la vignette stylée (déjà affichée ci-dessus) reste.
  if (item.poster) {
    showImage(item.poster, fetchLive);
  } else {
    fetchLive();
  }
}

// Portrait de personnage : uniquement les images stockées localement dans le
// dépôt (pas de fetch live pour ceux-ci) ; sinon la vignette initiales reste.
function mountPortrait(wrapEl, character) {
  wrapEl.innerHTML = `<div class="poster-fallback">${initials(character.name)}</div>`;
  if (!character.portrait) return;
  const img = new Image();
  img.alt = character.name;
  img.onload = () => { wrapEl.innerHTML = ''; wrapEl.appendChild(img); };
  img.onerror = () => {}; // garde le fallback
  img.src = character.portrait;
}

// ------------------------------------------------------------- ACCUEIL ---
function renderAccueil() {
  app.innerHTML = `
    <section class="hero">
      <h1>L'univers Marvel</h1>
    </section>

    <div class="timeline-block">
      <div class="era">Aux origines · Avant l'humanité</div>
      <h2>Les Célestes, le Big Bang et la naissance d'Asgard</h2>
      <p>Bien avant l'apparition de l'humanité, les <strong>Célestes</strong> façonnent des mondes et sèment la vie,
      créant au passage les <strong>Eternels</strong> pour protéger les civilisations naissantes des Déviants.
      À la même époque se forment les <strong>Pierres d'Infinité</strong>, six fragments de puissance née avant le
      Big Bang, et le royaume d'<strong>Asgard</strong>, où Odin unifie les Neuf Royaumes après avoir vaincu les
      Géants des Glaces en 965.</p>
    </div>

    <div class="timeline-block">
      <div class="era">Antiquité – XIXe siècle</div>
      <h2>Ego, les premiers Gardiens et les racines d'Hydra</h2>
      <p>Sur Terre, l'entité cosmique <strong>Ego</strong> tente pendant des millénaires de coloniser d'autres mondes.
      En 1901, dans les montagnes d'Autriche, l'organisation occulte <strong>Hydra</strong> découvre un <strong>Tesseract</strong>
      contenant la Pierre de l'Espace, posant les bases du conflit qui ressurgira quarante ans plus tard.</p>
    </div>

    <div class="timeline-block">
      <div class="era">1940 – 1945 · La Seconde Guerre mondiale</div>
      <h2>Le Captain America original et la chute d'Hydra</h2>
      <p>Steve Rogers, chétif volontaire, devient <strong>Captain America</strong> grâce au sérum du Dr Erskine.
      Avec les Howling Commandos, il affronte <strong>Johann Schmidt / Crâne Rouge</strong>, à la tête d'une Hydra
      infiltrée dans les rangs nazis. En 1945, Rogers s'écrase dans l'Arctique avec un avion chargé d'armes de
      destruction et reste figé dans la glace pendant près de 70 ans.</p>
    </div>

    <div class="timeline-block">
      <div class="era">1949 – 1995 · La Guerre froide et Captain Marvel</div>
      <h2>Le S.H.I.E.L.D., Howard Stark et Carol Danvers</h2>
      <p>Peggy Carter et Howard Stark fondent le <strong>S.H.I.E.L.D.</strong> en 1949, sans savoir qu'Hydra continue
      d'y survivre en secret. En 1995, l'agente de l'US Air Force <strong>Carol Danvers</strong> devient
      <strong>Captain Marvel</strong> après un accident impliquant le moteur d'un vaisseau kree, et Nick Fury,
      encore jeune agent, découvre l'existence des extraterrestres.</p>
    </div>

    <div class="timeline-block">
      <div class="era">2008 – 2012 · L'émergence des super-héros</div>
      <h2>Iron Man, Hulk, Thor et l'Incident de New York</h2>
      <p>Tony Stark endosse l'armure d'<strong>Iron Man</strong> en 2010, tandis que Bruce Banner fuit le monde en tant
      que <strong>Hulk</strong> et que <strong>Thor</strong> est banni sur Terre par Odin. Nick Fury lance
      l'<strong>Initiative Avengers</strong>. En 2012, <strong>Loki</strong> ouvre un portail au-dessus de Manhattan
      avec le sceptre contenant la Pierre de l'Esprit : c'est la <strong>Bataille de New York</strong>, première
      sortie officielle des <strong>Avengers</strong> réunis et révélation du monde des super-héros au grand public.</p>
    </div>

    <div class="timeline-block">
      <div class="era">2012 – 2016 · Ultron et la fracture des Avengers</div>
      <h2>L'IA d'Ultron, les Accords de Sokovie et Civil War</h2>
      <p>En 2015, Tony Stark et Bruce Banner créent accidentellement <strong>Ultron</strong>, une intelligence
      artificielle qui manque de provoquer l'extinction de l'humanité ; les Avengers l'arrêtent à Sokovie et créent
      <strong>Vision</strong>. Les dégâts collatéraux répétés mènent aux <strong>Accords de Sokovie</strong> en 2016,
      qui divisent l'équipe entre partisans de Tony Stark et de <strong>Captain America</strong>, désormais fugitif
      aux côtés de son ami d'enfance <strong>Bucky Barnes</strong>.</p>
    </div>

    <div class="timeline-block">
      <div class="era">2018 – 2023 · Thanos, le Snap et le Blip</div>
      <h2>La Saga de l'Infini : Infinity War et Endgame</h2>
      <p>Le Titan <strong>Thanos</strong> réunit les six <strong>Pierres d'Infinité</strong> et, d'un claquement de
      doigts en 2018, efface la moitié de toute vie dans l'univers — le <strong>Snap</strong>. Les survivants,
      dont il ne reste qu'une poignée d'Avengers, vivent cinq années de deuil (le <strong>Blip</strong>) avant de
      voyager dans le temps pour récupérer les Pierres et annuler le Snap en 2023. Tony Stark meurt en sacrifiant
      sa vie pour vaincre définitivement Thanos.</p>
    </div>

    <div class="timeline-block">
      <div class="era">2023 – aujourd'hui · La Saga du Multivers</div>
      <h2>Variants, incursions et l'ouverture du multivers</h2>
      <p>Une variante de <strong>Loki</strong> ayant survécu à sa propre mort révèle l'existence de la
      <strong>TVA (Autorité de Variance Temporelle)</strong> et d'un multivers jusque-là contenu par
      <strong>Celui qui Demeure</strong>. Sa disparition libère d'innombrables branches temporelles, permettant à des
      versions d'autres univers (dont <strong>Spider-Man</strong> et les <strong>X-Men</strong> d'univers parallèles)
      de croiser le MCU. En toile de fond se profile désormais la menace de <strong>Kang</strong> et de ses variants,
      point de départ de la prochaine grande guerre multiversique.</p>
    </div>

    <div class="timeline-block">
      <div class="era">Pour la suite</div>
      <h2>Suivre le fil de l'histoire</h2>
      <p>Cette chronologie couvre les grands événements du <strong>MCU</strong> tels qu'ils se déroulent dans la fiction.
      Pour voir dans quel ordre regarder chaque film et série qui les racontent, direction la page
      <a href="#/chronologie">ordre chronologique</a>, ou le <a href="#/catalogue">catalogue</a> pour parcourir
      toutes les fiches, y compris celles des univers X-Men (Fox), Spider-Man (Sony) et des séries Netflix.</p>
    </div>
  `;
}

// ------------------------------------------------------------ CATALOGUE ---
let catalogueState = { franchise: 'all', type: 'all', search: '' };

function renderCatalogue() {
  rememberListRoute();
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
        <div class="meta">${it.year} · ${it.type}${it.animated ? ' · Animation' : ''}</div>
      </div>
    </div>
  `).join('');

  items.forEach(it => {
    const wrap = document.getElementById(`poster-${it.id}`);
    mountPoster(wrap, it, FRANCHISE_LABELS[it.franchise]);
  });

  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      rememberScrollTarget(card.dataset.id);
      location.hash = `#/fiche/${card.dataset.id}`;
    });
  });

  restoreScrollTarget('.card');
}

// ---------------------------------------------------------------- FICHE ---
function renderFiche(id) {
  const item = MARVEL_DATA.find(it => it.id === id);
  const backHref = getLastListRoute();
  const backLabel = backHref.startsWith('#/chronologie') ? 'Retour à l\'ordre chronologique' : 'Retour au catalogue';
  if (!item) {
    app.innerHTML = `<a class="back-link" href="${backHref}">&larr; ${backLabel}</a><div class="empty-msg">Fiche introuvable.</div>`;
    return;
  }

  app.innerHTML = `
    <a class="back-link" href="${backHref}">&larr; ${backLabel}</a>
    <div class="fiche">
      <div class="fiche-poster" id="fiche-poster"></div>
      <div class="fiche-body">
        <h1>${item.title}</h1>
        <div class="fiche-tags">
          <span class="tag">${FRANCHISE_LABELS[item.franchise]}</span>
          <span class="tag">${item.type}</span>
          ${item.animated ? '<span class="tag">Animation</span>' : ''}
          ${item.upcoming ? '<span class="tag">À venir</span>' : ''}
        </div>
        ${(() => {
          const plexUrl = (typeof plexLinkFor === 'function') ? plexLinkFor(item.id) : null;
          if (plexUrl) {
            return `
            <a class="plex-watch-btn" href="${plexUrl}" target="_blank" rel="noopener">▶ Regarder sur Plex</a>
            <div class="plex-watch-note">Accessible uniquement sur le réseau Wi-Fi maison</div>`;
          }
          // Pas sur le serveur : liens de recherche vers les sites externes.
          const links = (typeof watchLinksFor === 'function') ? watchLinksFor(item) : [];
          if (!links.length) return '';
          return `
            <div class="watch-btn-row">
              ${links.map(l => `<a class="watch-btn watch-btn-${l.key}" href="${l.href}" target="_blank" rel="noopener">${l.label}</a>`).join('')}
            </div>
            <div class="plex-watch-note">Pas sur le serveur Plex — recherche du titre sur ces sites</div>`;
        })()}
        <dl class="fiche-facts">
          <dt>Sous-série</dt><dd>${item.saga}</dd>
          <dt>Année</dt><dd>${item.year}</dd>
          <dt>Réalisateur</dt><dd>${item.director}</dd>
          <dt>Durée</dt><dd>${item.duration}</dd>
          <dt>Situé en</dt><dd>${item.chronoNote}</dd>
        </dl>
        <div class="fiche-synopsis">
          <h2>Synopsis</h2>
          <p>${item.synopsis}</p>
        </div>
        <div class="fiche-synopsis">
          <h2>Casting</h2>
          <div class="cast-grid">
            ${item.cast.map(raw => {
              const clean = raw.replace(/\s*\([^)]*\)\s*$/, '').trim();
              const c = (typeof MARVEL_CHARACTERS !== 'undefined' ? MARVEL_CHARACTERS : [])
                .find(ch => ch.appearances.includes(item.id) && ch.actor.includes(clean));
              const photo = (typeof ACTOR_PHOTOS !== 'undefined') ? ACTOR_PHOTOS[clean] : null;
              const others = c
                ? c.appearances.filter(fid => fid !== item.id).map(fid => MARVEL_DATA.find(f => f.id === fid)).filter(Boolean)
                : [];
              return `
                <div class="cast-card">
                  <div class="cast-photo">${photo
                    ? `<img src="${photo}" alt="${clean}" data-fallback="${initials(clean)}">`
                    : `<div class="poster-fallback">${initials(clean)}</div>`}
                  </div>
                  <div class="cast-info">
                    <div class="cast-actor">${raw}</div>
                    ${c ? `<a class="cast-role" href="#/personnage/${c.id}">${c.name}</a>` : '<span class="cast-role cast-role-none">Rôle non recensé</span>'}
                    ${others.length ? `
                      <div class="cast-appears">
                        <div class="cast-appears-label">Apparaît aussi dans</div>
                        ${others.slice(0, 3).map(f => `<a class="cast-appears-link" href="#/fiche/${f.id}">${f.title}</a>`).join('')}
                        ${others.length > 3 ? `<a class="cast-appears-more" href="#/personnage/${c.id}">+${others.length - 3} autre${others.length - 3 > 1 ? 's' : ''} (voir tout)</a>` : ''}
                      </div>` : ''}
                  </div>
                </div>`;
            }).join('')}
          </div>
        </div>
        <div class="user-section">
          <h2>Mon avis</h2>
          <button id="watched-btn" class="watched-btn"></button>
          <div class="star-rating">
            <div class="stars" id="star-rating"></div>
            <span class="rating-label" id="rating-label"></span>
          </div>
          <textarea id="user-comment" class="user-comment" placeholder="Ton avis, tes notes sur ce film/cette série...">${escapeHtml(getUserEntry(item.id).comment)}</textarea>
          <span class="save-indicator" id="save-indicator">Enregistré ✓</span>
        </div>
      </div>
    </div>
  `;

  mountPoster(document.getElementById('fiche-poster'), item, null, false);

  document.querySelectorAll('.cast-photo img[data-fallback]').forEach(img => {
    img.addEventListener('error', () => {
      const div = document.createElement('div');
      div.className = 'poster-fallback';
      div.textContent = img.dataset.fallback;
      img.replaceWith(div);
    });
  });
  mountUserSection(item.id);
}

function escapeHtml(str) {
  return (str || '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

function mountUserSection(id) {
  let entry = getUserEntry(id);

  const watchedBtn = document.getElementById('watched-btn');
  const starsEl = document.getElementById('star-rating');
  const ratingLabel = document.getElementById('rating-label');
  const commentEl = document.getElementById('user-comment');
  const saveIndicator = document.getElementById('save-indicator');

  function renderWatchedBtn() {
    watchedBtn.textContent = entry.watched ? '✓ Vu' : 'Marquer comme vu';
    watchedBtn.classList.toggle('active', entry.watched);
  }
  function renderStars() {
    starsEl.innerHTML = [1, 2, 3, 4, 5].map(n =>
      `<span class="star${n <= entry.rating ? ' filled' : ''}" data-n="${n}">★</span>`
    ).join('');
    ratingLabel.textContent = entry.rating > 0 ? `${entry.rating}/5` : 'Pas encore noté';
  }
  function flashSaved() {
    saveIndicator.classList.add('show');
    clearTimeout(flashSaved._t);
    flashSaved._t = setTimeout(() => saveIndicator.classList.remove('show'), 1500);
  }

  renderWatchedBtn();
  renderStars();

  watchedBtn.addEventListener('click', () => {
    entry = setUserEntry(id, { watched: !entry.watched });
    renderWatchedBtn();
    flashSaved();
  });

  starsEl.addEventListener('click', (e) => {
    const star = e.target.closest('.star');
    if (!star) return;
    const n = Number(star.dataset.n);
    const newRating = entry.rating === n ? 0 : n; // recliquer sur la même étoile réinitialise
    entry = setUserEntry(id, { rating: newRating });
    renderStars();
    flashSaved();
  });

  let commentTimer;
  commentEl.addEventListener('input', () => {
    clearTimeout(commentTimer);
    commentTimer = setTimeout(() => {
      entry = setUserEntry(id, { comment: commentEl.value });
      flashSaved();
    }, 500);
  });
}

// ---------------------------------------------------------- CHRONOLOGIE ---
function renderChronologie(activeFranchise) {
  const franchises = Object.keys(FRANCHISE_LABELS);
  if (!franchises.includes(activeFranchise)) activeFranchise = 'mcu';
  rememberListRoute();

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
  list.innerHTML = items.map((it, i) => {
    const watched = getUserEntry(it.id).watched;
    const onPlex = (typeof plexLinkFor === 'function' && plexLinkFor(it.id));
    const onWatch = !onPlex && (typeof hasWatchLinks === 'function' && hasWatchLinks(it));
    return `
    <div class="chrono-item${watched ? ' chrono-watched' : ''}" data-id="${it.id}">
      <div class="chrono-num">${i + 1}</div>
      <div class="chrono-main">
        <h4>${it.title}${it.franchise !== activeFranchise ? ` <small style="color:var(--gold); font-weight:700;">[${FRANCHISE_LABELS[it.franchise]}]</small>` : ''}${watched ? ' <span class="chrono-watched-badge">Vu</span>' : ''}${onPlex ? ' <span class="chrono-plex-badge">▶ Plex</span>' : ''}${onWatch ? ' <span class="chrono-watch-badge">Où voir</span>' : ''}</h4>
        <span>${it.type} · ${it.year} · ${it.saga}</span>
      </div>
      <div class="chrono-when">${it.chronoNote}</div>
    </div>
  `;
  }).join('');

  list.querySelectorAll('.chrono-item').forEach(el => {
    el.addEventListener('click', () => {
      rememberScrollTarget(el.dataset.id);
      location.hash = `#/fiche/${el.dataset.id}`;
    });
  });

  restoreScrollTarget('.chrono-item');
}

// ------------------------------------------------------------ PERSONNAGES ---
let personnagesSearch = '';

function renderPersonnages() {
  app.innerHTML = `
    <div class="filters">
      <input type="search" id="perso-search" placeholder="Rechercher un personnage..." value="${personnagesSearch}">
    </div>
    <div class="grid" id="perso-grid"></div>
  `;
  document.getElementById('perso-search').addEventListener('input', (e) => {
    personnagesSearch = e.target.value;
    renderPersoGrid();
  });
  renderPersoGrid();
}

function renderPersoGrid() {
  const grid = document.getElementById('perso-grid');
  const q = personnagesSearch.trim().toLowerCase();
  const chars = MARVEL_CHARACTERS
    .filter(c => !q || c.name.toLowerCase().includes(q) || (c.realName || '').toLowerCase().includes(q))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  if (chars.length === 0) {
    grid.innerHTML = `<div class="empty-msg">Aucun résultat.</div>`;
    return;
  }

  grid.innerHTML = chars.map(c => `
    <div class="card" data-id="${c.id}">
      <div class="poster-wrap" id="perso-poster-${c.id}"></div>
      <div class="card-info">
        <h3>${c.name}</h3>
        <div class="meta">${c.actor}</div>
      </div>
    </div>
  `).join('');

  chars.forEach(c => {
    const wrap = document.getElementById(`perso-poster-${c.id}`);
    mountPortrait(wrap, c);
  });

  grid.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => { location.hash = `#/personnage/${card.dataset.id}`; });
  });
}

function renderPersonnage(id) {
  const c = MARVEL_CHARACTERS.find(x => x.id === id);
  if (!c) {
    app.innerHTML = `<a class="back-link" href="#/personnages">&larr; Retour aux personnages</a><div class="empty-msg">Personnage introuvable.</div>`;
    return;
  }

  const appearanceItems = c.appearances
    .map(fid => MARVEL_DATA.find(f => f.id === fid))
    .filter(Boolean)
    .sort((a, b) => a.year - b.year);

  app.innerHTML = `
    <a class="back-link" href="#/personnages">&larr; Retour aux personnages</a>
    <div class="fiche">
      <div class="fiche-poster" id="perso-fiche-poster"></div>
      <div class="fiche-body">
        <h1>${c.name}</h1>
        ${c.realName && c.realName !== c.name ? `<p style="color:var(--text-dim); margin:-6px 0 14px;">${c.realName}</p>` : ''}
        <div class="fiche-tags">
          <span class="tag">Personnage</span>
        </div>
        <dl class="fiche-facts">
          <dt>Interprété par</dt><dd>${c.actor}</dd>
          <dt>Naissance</dt><dd>${c.birth || 'Non précisée'}</dd>
          <dt>Origine</dt><dd>${c.origin}</dd>
          <dt>Affiliation</dt><dd>${c.affiliation}</dd>
          <dt>Pouvoirs</dt><dd>${c.powers}</dd>
        </dl>
        <div class="fiche-synopsis">
          <h2>Histoire</h2>
          <p>${c.history}</p>
        </div>

        <div class="user-section">
          <h2>Apparaît dans</h2>
          <div class="appearances-list">
            ${appearanceItems.map(f => `<a class="appearance-chip" href="#/fiche/${f.id}">${f.title} <span>(${f.year})</span></a>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  mountPortrait(document.getElementById('perso-fiche-poster'), c);
}
