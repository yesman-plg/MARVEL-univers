// ============================================================================
// Fonctions communes aux propositions : liste à plat des événements, rendu
// d'une entrée (avec sa partie dépliable) et formatage des coordonnées.
// Dépend de chronologie-data.js (const CHRONO).
// ============================================================================
const Chrono = (() => {
  // Lien vers la fiche d'un film sur le site ; mis à null dans une copie en ligne.
  const FICHE = (typeof window.CHRONO_FICHE !== 'undefined') ? window.CHRONO_FICHE : '../index.html#/fiche/';
  const IMG = (typeof window.CHRONO_IMG !== 'undefined') ? window.CHRONO_IMG : '../';
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  const flat = [];
  CHRONO.chapters.forEach((ch, ci) => ch.events.forEach((ev, ei) => flat.push(Object.assign(ev, { ci, ei, gi: flat.length }))));

  const img = p => p ? IMG + p : '';

  function coords(geo) {
    if (geo.lat === null) return geo.label;
    const f = v => Math.abs(v).toFixed(2).replace('.', ',');
    return `${geo.label} · ${f(geo.lat)}° ${geo.lat >= 0 ? 'N' : 'S'}, ${f(geo.lon)}° ${geo.lon >= 0 ? 'E' : 'O'}`;
  }

  function entryHTML(ev, opts = {}) {
    const story = ev.list.length ? `<ul class="entry-list">${ev.list.map(l => `<li>${l}</li>`).join('')}</ul>` : `<p class="entry-story">${ev.story}</p>`;
    const who = ev.chars.length
      ? `<div class="who-list">${ev.chars.map(c => `<span class="who-chip"><img src="${img(c.img)}" alt="" loading="lazy">${c.name}</span>`).join('')}</div>`
      : '';
    const whoText = ev.who ? `<p class="who-text">${ev.who}</p>` : '';
    const watch = ev.films.map(f => `<a class="watch-item" ${FICHE ? `href="${FICHE}${f.id}"` : ''}><div class="p" style="background-image:url('${img(f.poster)}')"></div>${f.title}<small>${f.year}</small></a>`).join('');
    const hasMore = ev.consequence || who || whoText || watch;
    return `
      <article class="entry" data-gi="${ev.gi}" id="ev-${ev.gi}">
        ${opts.before || ''}
        <div class="entry-meta"><span class="entry-date">${ev.date}</span><span class="entry-place">${coords(ev.geo)}</span></div>
        <h3>${ev.title}</h3>
        ${story}
        ${hasMore ? `
        <button class="entry-toggle" aria-expanded="false" aria-controls="more-${ev.gi}"><span class="plus" aria-hidden="true"></span><span class="t">Ce que ça change, qui, où le voir</span></button>
        <div class="entry-more" id="more-${ev.gi}"><div class="inner"><div class="pad">
          ${ev.consequence ? `<div class="conseq"><span class="lbl">Ce que ça change</span><p>${ev.consequence}</p></div>` : ''}
          ${who || whoText ? `<div><span class="lbl">Personnages</span>${who}${!who ? whoText : ''}</div>` : ''}
          ${watch ? `<div><span class="lbl">À voir</span><div class="watch-list">${watch}</div></div>` : ''}
        </div></div></div>` : ''}
      </article>`;
  }

  function chapterHeadHTML(ch, ci) {
    return `<header class="chapter-head" data-ci="${ci}" id="ch-${ci}">
      <span class="num">${ROMAN[ci]}</span>
      <span class="eyebrow">Chapitre ${ci + 1} · ${ch.period}</span>
      <h2>${ch.title}</h2>
      <p class="intro">${ch.intro}</p>
    </header>`;
  }

  // Dépliage : un clic sur le bouton ouvre/ferme l'entrée.
  function bindExpand(root, onToggle) {
    root.addEventListener('click', e => {
      const b = e.target.closest('.entry-toggle');
      if (!b) return;
      const entry = b.closest('.entry');
      const open = !entry.classList.contains('open');
      entry.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open);
      b.querySelector('.t').textContent = open ? 'Refermer' : 'Ce que ça change, qui, où le voir';
      if (onToggle) onToggle(entry, open);
    });
  }

  // Événement « actif » : celui dont le haut a passé une ligne de lecture.
  function activeIndex(entries, line = innerHeight * 0.45) {
    let a = 0;
    for (let i = 0; i < entries.length; i++) { if (entries[i].getBoundingClientRect().top < line) a = i; else break; }
    return a;
  }

  return { flat, ROMAN, img, coords, entryHTML, chapterHeadHTML, bindExpand, activeIndex };
})();
