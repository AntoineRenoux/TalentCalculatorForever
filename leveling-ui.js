/* Sections « leveling » : traits raciaux, progression par niveau (sorts + points de talent)
 * et grimoire au niveau choisi. Lit l'état du calculateur via window.TC. */
(() => {
  'use strict';

  const LV = window.LEVELING_DATA;
  const TC = window.TC;
  if (!LV || !TC) return;

  const $ = (id) => document.getElementById(id);
  const { ICON, esc, cleanDesc, state } = TC;
  const FALLBACK_ICON = 'inv_misc_questionmark';
  const CHANGE_LABEL = {
    introduced: ['Nouveau (Forever)', 'new'],
    nowTrainable: ['Désormais chez le maître', 'train'],
    changedLevels: ['Niveau modifié (Forever)', 'moved'],
  };

  const ui = {
    clsKey: null,
    schools: new Set(),   // écoles cochées dans la progression (vide = toutes)
    bookSchool: null,     // onglet du grimoire (null = toutes)
  };

  const spell = (id) => {
    const s = LV.spells[id];
    return { id, name: s[0], rank: s[1], icon: s[2] && s[2] !== 'temp' ? s[2] : FALLBACK_ICON, desc: s[3] };
  };
  const school = (id) => {
    const s = LV.schools[id];
    return { name: s.name, icon: s.icon && s.icon !== 'temp' ? s.icon : FALLBACK_ICON };
  };
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function classSpells() {
    const c = LV.classes[ui.clsKey];
    return c.spells.filter((e) => !e.race || e.race === state.race);
  }

  function spellTooltip(e) {
    const s = spell(e.id);
    let h = `<div class="tt-name">${esc(s.name)}</div>`;
    if (s.rank) h += `<div class="tt-rank">${esc(s.rank)}</div>`;
    h += `<div class="tt-rank">${esc(school(e.s).name)} · Niveau ${e.l}</div>`;
    if (e.ch) h += `<div class="tt-forever">${CHANGE_LABEL[e.ch][0]}</div>`;
    if (s.desc) h += `<div class="tt-desc">${cleanDesc(s.desc)}</div>`;
    return h;
  }
  function bindTip(node, html) {
    node.addEventListener('mouseenter', () => TC.positionTooltip(node, html()));
    node.addEventListener('mouseleave', TC.hideTooltip);
    node.addEventListener('focus', () => TC.positionTooltip(node, html()));
    node.addEventListener('blur', TC.hideTooltip);
  }

  // ---------- Traits raciaux ----------
  function renderRaceSelect() {
    const sel = $('raceSelect');
    const c = LV.classes[ui.clsKey];
    sel.innerHTML = c.races.map((r) => `<option value="${r}">${esc(LV.races[r].name)}</option>`).join('');
    sel.value = String(state.race);
  }
  function renderRacials() {
    const box = $('racials');
    const ids = LV.classes[ui.clsKey].racials[state.race] || [];
    box.innerHTML = '';
    ids.forEach((id) => {
      const s = spell(id);
      const card = document.createElement('article');
      card.className = 'racial';
      card.innerHTML = `<img src="${ICON(s.icon, 'medium')}" alt="">
        <div><h4>${esc(s.name)}</h4><p>${cleanDesc(s.desc)}</p></div>`;
      box.appendChild(card);
    });
  }

  // ---------- Progression par niveau ----------
  function renderSchoolChips() {
    const wrap = $('schoolChips');
    const c = LV.classes[ui.clsKey];
    wrap.innerHTML = '';
    c.schools.forEach((sid) => {
      const sc = school(sid);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.dataset.id = sid;
      b.innerHTML = `<img src="${ICON(sc.icon, 'small')}" alt="">${esc(sc.name)}`;
      b.addEventListener('click', () => {
        ui.schools.has(sid) ? ui.schools.delete(sid) : ui.schools.add(sid);
        b.classList.toggle('on', ui.schools.has(sid));
        renderTimeline();
      });
      wrap.appendChild(b);
    });
  }

  function renderTimeline() {
    const ol = $('timeline');
    const q = norm($('spellSearch').value.trim());
    const onlyForever = $('foreverOnly').checked;
    const maxLevel = $('untilLevel').checked ? state.level : 60;

    const byLevel = new Map();
    classSpells().forEach((e) => {
      if (ui.schools.size && !ui.schools.has(e.s)) return;
      if (onlyForever && !e.ch) return;
      if (q) {
        const s = spell(e.id);
        if (!norm(s.name).includes(q) && !norm(s.desc).includes(q)) return;
      }
      if (!byLevel.has(e.l)) byLevel.set(e.l, []);
      byLevel.get(e.l).push(e);
    });

    const filtering = q || onlyForever || ui.schools.size;
    ol.innerHTML = '';
    for (let lvl = 1; lvl <= maxLevel; lvl++) {
      const spells = byLevel.get(lvl) || [];
      const talentId = !filtering && lvl >= TC.MIN_LEVEL ? state.order[lvl - TC.MIN_LEVEL] : null;
      const talentSlot = !filtering && lvl >= TC.MIN_LEVEL;
      if (!spells.length && !talentSlot) continue;

      const li = document.createElement('li');
      li.className = 'lvl' + (lvl > state.level ? ' future' : '') + (lvl === state.level ? ' current' : '');
      li.innerHTML = `<div class="lvl-num"><span>Niv.</span>${lvl}</div>`;
      const body = document.createElement('div');
      body.className = 'lvl-body';

      if (talentSlot) body.appendChild(talentRow(talentId, lvl));
      spells.forEach((e) => body.appendChild(spellRow(e)));
      li.appendChild(body);
      ol.appendChild(li);
    }
    if (!ol.children.length) ol.innerHTML = '<li class="empty">Aucun sort ne correspond aux filtres.</li>';
  }

  function talentRow(id, lvl) {
    const row = document.createElement('div');
    row.className = 'row talent-pt';
    if (id == null) {
      row.innerHTML = `<span class="pt-dot">+1</span><span class="muted">Point de talent disponible</span>`;
      return row;
    }
    const { t, tree } = TC.index.get(id);
    const n = state.order.slice(0, lvl - TC.MIN_LEVEL + 1).filter((x) => x === id).length;
    row.innerHTML = `<img src="${ICON(t.icon, 'small')}" alt="">
      <div class="row-main"><b>${esc(t.name)}</b> <span class="muted">Rang ${n}/${t.max} · ${esc(tree.name)}</span></div>
      <span class="tag tag-talent">Talent</span>`;
    return row;
  }

  function spellRow(e) {
    const s = spell(e.id);
    const row = document.createElement('div');
    row.className = 'row';
    row.tabIndex = 0;
    const badge = e.ch ? `<span class="tag ${CHANGE_LABEL[e.ch][1]}">${CHANGE_LABEL[e.ch][0]}</span>` : '';
    row.innerHTML = `<img src="${ICON(s.icon, 'small')}" alt="">
      <div class="row-main">
        <div><b>${esc(s.name)}</b>${s.rank ? ` <span class="muted">${esc(s.rank)}</span>` : ''}
          <span class="tag school">${esc(school(e.s).name)}</span>${badge}</div>
        ${s.desc ? `<p class="desc">${cleanDesc(s.desc)}</p>` : ''}
      </div>`;
    return row;
  }

  // ---------- Grimoire : plus haut rang connu de chaque sort au niveau choisi ----------
  function renderBookTabs() {
    const wrap = $('bookTabs');
    const c = LV.classes[ui.clsKey];
    wrap.innerHTML = '';
    const mk = (sid, label, icon) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (ui.bookSchool === sid ? ' on' : '');
      b.innerHTML = (icon ? `<img src="${ICON(icon, 'small')}" alt="">` : '') + esc(label);
      b.addEventListener('click', () => { ui.bookSchool = sid; renderBookTabs(); renderBook(); });
      wrap.appendChild(b);
    };
    mk(null, 'Toutes');
    c.schools.forEach((sid) => mk(sid, school(sid).name, school(sid).icon));
  }

  function renderBook() {
    $('bookLevel').textContent = state.level;
    const box = $('book');
    const all = $('allRanks').checked;
    const known = classSpells().filter((e) => e.l <= state.level && (ui.bookSchool == null || e.s === ui.bookSchool));
    let list = known;
    if (!all) {
      const best = new Map(); // nom + école -> entrée de plus haut niveau
      known.forEach((e) => {
        const key = spell(e.id).name + '|' + e.s;
        const cur = best.get(key);
        if (!cur || e.l >= cur.l) best.set(key, e);
      });
      list = [...best.values()];
    }
    const schools = LV.classes[ui.clsKey].schools.filter((sid) => ui.bookSchool == null || sid === ui.bookSchool);
    box.innerHTML = '';
    schools.forEach((sid) => {
      const items = list.filter((e) => e.s === sid).sort((a, b) => a.l - b.l || spell(a.id).name.localeCompare(spell(b.id).name));
      if (!items.length) return;
      const sec = document.createElement('section');
      sec.className = 'book-school';
      sec.innerHTML = `<h4><img src="${ICON(school(sid).icon, 'small')}" alt="">${esc(school(sid).name)} <span class="muted">${items.length} sort${items.length > 1 ? 's' : ''}</span></h4>`;
      const grid = document.createElement('div');
      grid.className = 'book-grid';
      items.forEach((e) => {
        const s = spell(e.id);
        const card = document.createElement('div');
        card.className = 'book-item' + (e.ch ? ' forever' : '');
        card.tabIndex = 0;
        card.innerHTML = `<img src="${ICON(s.icon, 'medium')}" alt="">
          <div><b>${esc(s.name)}</b><span class="muted">${s.rank ? esc(s.rank) + ' · ' : ''}Niveau ${e.l}</span></div>`;
        bindTip(card, () => spellTooltip(e));
        grid.appendChild(card);
      });
      sec.appendChild(grid);
      box.appendChild(sec);
    });
    if (!box.children.length) box.innerHTML = '<p class="empty">Aucun sort connu à ce niveau.</p>';
  }

  // ---------- Synchronisation avec le calculateur ----------
  function refresh() {
    if (!state.cls) return;
    if (ui.clsKey !== state.cls.key) {
      ui.clsKey = state.cls.key;
      ui.schools.clear();
      ui.bookSchool = null;
      renderSchoolChips();
      renderBookTabs();
    }
    renderRaceSelect();
    renderRacials();
    renderTimeline();
    renderBook();
  }

  $('raceSelect').addEventListener('change', (e) => TC.setRace(+e.target.value));
  ['foreverOnly', 'untilLevel'].forEach((id) => $(id).addEventListener('change', renderTimeline));
  $('spellSearch').addEventListener('input', renderTimeline);
  $('allRanks').addEventListener('change', renderBook);
  document.addEventListener('tc:update', refresh);
  refresh();
})();
