// ============================================================================
// Carte déployable commune à toutes les maquettes.
// Detail.open(index, elementCliqué) : la carte s'agrandit depuis l'élément
// cliqué jusqu'à un grand panneau (animation FLIP), avec texte long, chiffres
// clés, personnages et films à voir. Échap / clic sur le fond / ✕ pour fermer,
// ← → pour passer d'une époque à l'autre.
// ============================================================================
(function () {
  const css = `
  .dt-back { position:fixed; inset:0; z-index:1000; background:#000c; backdrop-filter:blur(6px); opacity:0; transition:opacity .35s; }
  .dt-back.on { opacity:1; }
  .dt-panel { position:fixed; z-index:1001; overflow:hidden; background:#121215; border:1px solid var(--dc); border-radius:18px;
              box-shadow:0 40px 120px -20px #000, 0 0 80px -30px var(--dc); color:#eee; font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
              transition:left .55s cubic-bezier(.2,.85,.25,1), top .55s cubic-bezier(.2,.85,.25,1), width .55s cubic-bezier(.2,.85,.25,1), height .55s cubic-bezier(.2,.85,.25,1), border-radius .55s; }
  .dt-scroll { position:absolute; inset:0; overflow-y:auto; overscroll-behavior:contain; }
  .dt-hero { position:relative; height:300px; overflow:hidden; }
  .dt-hero .bg { position:absolute; inset:-30px; background-size:cover; background-position:center 25%; filter:blur(2px) saturate(1.2); transform:scale(1.25); transition:transform 1.2s cubic-bezier(.2,.85,.25,1); }
  .dt-panel.open .dt-hero .bg { transform:scale(1.05); }
  .dt-hero::after { content:''; position:absolute; inset:0; background:linear-gradient(0deg,#121215 4%,#12121599 45%,#0000 100%); }
  .dt-hero .head { position:absolute; left:32px; right:32px; bottom:22px; z-index:2; display:flex; gap:24px; align-items:flex-end; }
  .dt-hero .poster { width:120px; aspect-ratio:2/3; flex:none; border-radius:10px; background-size:cover; background-position:center; box-shadow:0 20px 40px #000; border:2px solid var(--dc); }
  .dt-era { color:var(--dc); font-weight:800; font-size:.75rem; letter-spacing:2.5px; text-transform:uppercase; }
  .dt-title { font-size:clamp(1.5rem,3.6vw,2.5rem); margin:6px 0 0; line-height:1.1; text-wrap:balance; }
  .dt-year { position:absolute; right:26px; top:14px; z-index:2; font-size:4.5rem; font-weight:900; color:transparent; -webkit-text-stroke:1.5px #ffffff55; }
  .dt-body { padding:8px 32px 34px; display:grid; gap:28px; }
  .dt-body > * { opacity:0; transform:translateY(18px); transition:opacity .5s, transform .5s; }
  .dt-panel.open .dt-body > * { opacity:1; transform:none; }
  .dt-panel.open .dt-body > *:nth-child(2) { transition-delay:.08s } .dt-panel.open .dt-body > *:nth-child(3) { transition-delay:.16s } .dt-panel.open .dt-body > *:nth-child(4) { transition-delay:.24s }
  .dt-long { color:#d4d4da; line-height:1.7; font-size:1.02rem; margin:0; max-width:68ch; }
  .dt-h { font-size:.72rem; letter-spacing:2.5px; text-transform:uppercase; color:#a3a3ab; margin:0 0 12px; font-weight:700; }
  .dt-facts { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:10px; }
  .dt-fact { background:#1b1b20; border:1px solid #2c2c31; border-radius:10px; padding:12px 14px; }
  .dt-fact b { display:block; font-size:1.15rem; color:#fff; font-variant-numeric:tabular-nums; }
  .dt-fact span { font-size:.75rem; color:#a3a3ab; }
  .dt-chars { display:flex; flex-wrap:wrap; gap:16px; }
  .dt-char { width:84px; text-align:center; font-size:.75rem; color:#cfcfd4; }
  .dt-char img { width:72px; height:72px; border-radius:50%; object-fit:cover; border:2px solid var(--dc); display:block; margin:0 auto 6px; transition:transform .25s; }
  .dt-char:hover img { transform:scale(1.08); }
  .dt-films { display:flex; gap:14px; overflow-x:auto; padding-bottom:6px; }
  .dt-film { flex:none; width:128px; color:#eee; text-decoration:none; font-size:.78rem; }
  .dt-film .p { aspect-ratio:2/3; border-radius:8px; background-size:cover; background-position:center; margin-bottom:6px; border:1px solid #2c2c31; transition:transform .25s, box-shadow .25s; }
  .dt-film:hover .p { transform:translateY(-4px); box-shadow:0 14px 30px -10px var(--dc); border-color:var(--dc); }
  .dt-film small { color:#a3a3ab; }
  .dt-close, .dt-nav button { position:absolute; z-index:5; width:40px; height:40px; border-radius:50%; border:1px solid #ffffff33; background:#000a; color:#fff; font-size:1.1rem; cursor:pointer; }
  .dt-close { top:14px; left:14px; }
  .dt-nav { display:flex; justify-content:space-between; align-items:center; border-top:1px solid #2c2c31; padding-top:18px; }
  .dt-nav button { position:static; width:auto; border-radius:20px; padding:0 16px; font-size:.85rem; }
  .dt-nav button:disabled { opacity:.3; cursor:default; }
  .dt-close:focus-visible, .dt-nav button:focus-visible, .dt-film:focus-visible { outline:2px solid #d4af37; outline-offset:2px; }
  .dt-hint { position:fixed; z-index:1002; bottom:14px; left:50%; transform:translateX(-50%); color:#a3a3ab; font-size:.72rem; letter-spacing:1px; opacity:0; transition:opacity .4s; pointer-events:none; }
  .dt-back.on + .dt-panel + .dt-hint { opacity:1; }
  @media (max-width:700px) {
    .dt-hero { height:250px; } .dt-hero .poster { width:80px; } .dt-hero .head { left:18px; right:18px; gap:14px; }
    .dt-body { padding:8px 18px 28px; } .dt-year { font-size:3rem; } .dt-hint { display:none; }
  }
  @media (prefers-reduced-motion:reduce) { .dt-panel, .dt-body > *, .dt-hero .bg { transition:none !important; } }
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  let back, panel, hint, current = -1, origin = null, lastFocus = null;

  function target() {
    const m = innerWidth < 700;
    const w = m ? innerWidth : Math.min(980, innerWidth - 80);
    const h = m ? innerHeight : Math.min(innerHeight - 60, 860);
    return { left: (innerWidth - w) / 2, top: (innerHeight - h) / 2, width: w, height: h, r: m ? 0 : 18 };
  }
  function place(r, radius) {
    Object.assign(panel.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', borderRadius: (radius ?? 14) + 'px' });
  }
  function fill(i) {
    const ev = TIMELINE[i];
    panel.style.setProperty('--dc', ev.color);
    const link = f => (typeof SITE_FICHE === 'string' && SITE_FICHE) ? `href="${SITE_FICHE}${f.id}"` : '';
    panel.innerHTML = `
      <button class="dt-close" aria-label="Fermer">✕</button>
      <div class="dt-scroll">
        <div class="dt-hero">
          <div class="bg" style="background-image:url('${ev.image}')"></div>
          <div class="dt-year">${ev.year}</div>
          <div class="head">
            <div class="poster" style="background-image:url('${ev.image}')"></div>
            <div><div class="dt-era">${ev.era} · ${ev.date}</div><h2 class="dt-title">${ev.title}</h2></div>
          </div>
        </div>
        <div class="dt-body">
          <p class="dt-long">${ev.long || ev.text}</p>
          <div><h3 class="dt-h">Repères</h3><div class="dt-facts">${(ev.facts || []).map(([l, v]) => `<div class="dt-fact"><b>${v}</b><span>${l}</span></div>`).join('')}</div></div>
          <div><h3 class="dt-h">Personnages clés</h3><div class="dt-chars">${(ev.chars || []).map(c => `<div class="dt-char"><img src="${c.img}" alt="">${c.name}</div>`).join('')}</div></div>
          <div><h3 class="dt-h">À regarder pour cette époque</h3><div class="dt-films">${(ev.films || []).map(f => `<a class="dt-film" ${link(f)}><div class="p" style="background-image:url('${f.poster}')"></div>${f.title}<br><small>${f.year}</small></a>`).join('')}</div></div>
          <div class="dt-nav">
            <button data-go="-1" ${i === 0 ? 'disabled' : ''}>← ${i > 0 ? TIMELINE[i - 1].date : ''}</button>
            <span style="color:#a3a3ab;font-size:.8rem">${i + 1} / ${TIMELINE.length}</span>
            <button data-go="1" ${i === TIMELINE.length - 1 ? 'disabled' : ''}>${i < TIMELINE.length - 1 ? TIMELINE[i + 1].date : ''} →</button>
          </div>
        </div>
      </div>`;
    panel.querySelector('.dt-close').onclick = close;
    panel.querySelectorAll('[data-go]').forEach(b => b.onclick = () => go(+b.dataset.go));
  }
  function go(d) {
    const n = current + d;
    if (n < 0 || n >= TIMELINE.length) return;
    panel.classList.remove('open');
    setTimeout(() => { current = n; fill(n); requestAnimationFrame(() => panel.classList.add('open')); }, 200);
    if (window.onDetailNavigate) window.onDetailNavigate(n);
  }

  function open(i, fromEl) {
    if (current >= 0) return;
    current = i; lastFocus = document.activeElement;
    origin = fromEl && fromEl.getBoundingClientRect ? fromEl : null;
    const r = origin ? origin.getBoundingClientRect() : { left: innerWidth / 2 - 100, top: innerHeight / 2 - 100, width: 200, height: 200 };
    back = document.createElement('div'); back.className = 'dt-back'; back.onclick = close;
    panel = document.createElement('div'); panel.className = 'dt-panel'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true');
    hint = document.createElement('div'); hint.className = 'dt-hint'; hint.textContent = 'Échap pour fermer · ← → pour changer d\'époque';
    document.body.append(back, panel, hint);
    fill(i);
    panel.style.transition = 'none'; place(r);
    panel.offsetWidth;                                   // force le reflow avant l'animation
    panel.style.transition = '';
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      back.classList.add('on');
      const t = target(); place(t, t.r);
      setTimeout(() => { panel.classList.add('open'); panel.querySelector('.dt-close').focus({ preventScroll: true }); }, 260);
    });
  }
  function close() {
    if (current < 0) return;
    panel.classList.remove('open');
    back.classList.remove('on');
    if (origin && document.body.contains(origin)) { const r = origin.getBoundingClientRect(); place(r); }
    panel.style.opacity = '0'; panel.style.transition += ', opacity .45s .1s';
    const p = panel, b = back, h = hint;
    setTimeout(() => { p.remove(); b.remove(); h.remove(); }, 560);
    document.documentElement.style.overflow = '';
    current = -1;
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  addEventListener('keydown', e => {
    if (current < 0) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });
  addEventListener('resize', () => { if (current >= 0) { const t = target(); place(t, t.r); } });
  window.Detail = { open, close, isOpen: () => current >= 0 };
})();
