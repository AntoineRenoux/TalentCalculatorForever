/* Armurerie de la guilde : liste des membres et fiche personnage (via /api, voir server/).
 * Routage : #armory (liste) et #armory/<slug> (fiche). Les autres hash sont ceux du calculateur. */
(() => {
  'use strict';

  const TC = window.TC;
  const TALENTS = window.TALENT_DATA;
  const LV = window.LEVELING_DATA;
  const API = 'api';
  const $ = (id) => document.getElementById(id);
  const { esc, ICON } = TC;

  const RANK_LABEL = (r) => (r === 0 ? 'Maître de guilde' : `Rang ${r}`);
  const QUALITY = ['POOR', 'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'ARTIFACT', 'HEIRLOOM'];
  const SLOTS_LEFT = ['HEAD', 'NECK', 'SHOULDER', 'BACK', 'CHEST', 'SHIRT', 'TABARD', 'WRIST'];
  const SLOTS_RIGHT = ['HANDS', 'WAIST', 'LEGS', 'FEET', 'FINGER_1', 'FINGER_2', 'TRINKET_1', 'TRINKET_2'];
  const SLOTS_BOTTOM = ['MAIN_HAND', 'OFF_HAND', 'RANGED'];
  const SLOT_NAMES = {
    HEAD: 'Tête', NECK: 'Cou', SHOULDER: 'Épaules', BACK: 'Dos', CHEST: 'Torse', SHIRT: 'Chemise', TABARD: 'Tabard',
    WRIST: 'Poignets', HANDS: 'Mains', WAIST: 'Taille', LEGS: 'Jambes', FEET: 'Pieds', FINGER_1: 'Doigt', FINGER_2: 'Doigt',
    TRINKET_1: 'Bijou', TRINKET_2: 'Bijou', MAIN_HAND: 'Main droite', OFF_HAND: 'Main gauche', RANGED: 'À distance',
  };

  const classOf = (key) => TALENTS.find((c) => c.key === key);
  const raceName = (id) => LV?.races[id]?.name || '';

  let guildPromise = null;
  const filters = { cls: null, q: '' };
  let pendingLevel = null; // niveau à appliquer après « Ouvrir dans le calculateur »

  async function api(path) {
    const r = await fetch(`${API}${path}`);
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j.error || `Erreur ${r.status}`), { status: r.status });
    return j;
  }
  const loadGuild = () => (guildPromise ||= api('/guild').catch((e) => { guildPromise = null; throw e; }));

  // ---------- Routage entre calculateur et armurerie ----------
  function route() {
    const [key, slug] = location.hash.slice(1).split('/');
    const inArmory = key === 'armory';
    $('armory').hidden = !inArmory;
    document.querySelector('.toolbar').hidden = inArmory;
    $('calc').hidden = inArmory || !TC.state.cls;
    $('welcome').hidden = inArmory || !!TC.state.cls;
    document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('on', (t.dataset.tab === 'armory') === inArmory));
    TC.hideTooltip();

    if (!inArmory) {
      $('tabCalc').href = location.hash || '#';
      if (pendingLevel) { TC.setLevel(pendingLevel); pendingLevel = null; }
      return;
    }
    document.title = 'Armurerie — Calculateur de talents';
    slug ? showCharacter(decodeURIComponent(slug)) : showList();
  }

  // ---------- Liste des membres ----------
  async function showList() {
    $('armoryList').hidden = false;
    $('armorySheet').hidden = true;
    const box = $('memberList');
    if (!box.dataset.loaded) box.innerHTML = '<p class="empty">Chargement de la guilde…</p>';
    let g;
    try { g = await loadGuild(); } catch (e) {
      box.innerHTML = `<p class="error">Impossible de charger la guilde : ${esc(e.message)}</p>`;
      return;
    }
    box.dataset.loaded = '1';
    $('guildName').textContent = g.name;
    $('guildMeta').textContent = [g.faction, g.ruleset && `Règles : ${g.ruleset}`, `${g.memberCount} membres`].filter(Boolean).join(' · ');
    renderClassFilter(g);
    renderMembers(g);
  }

  function renderClassFilter(g) {
    const wrap = $('memberClasses');
    if (wrap.childElementCount) return;
    const present = [...new Set(g.members.map((m) => m.classKey).filter(Boolean))];
    const mk = (key, label, icon) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (filters.cls === key ? ' on' : '');
      b.innerHTML = (icon ? `<img src="${ICON(icon, 'small')}" alt="">` : '') + esc(label);
      b.addEventListener('click', () => {
        filters.cls = key;
        wrap.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c === b));
        renderMembers(g);
      });
      wrap.appendChild(b);
    };
    mk(null, 'Toutes');
    TALENTS.filter((c) => present.includes(c.key)).forEach((c) => mk(c.key, c.name, 'classicon_' + c.key));
  }

  function renderMembers(g) {
    const q = filters.q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    const list = g.members.filter((m) => (!filters.cls || m.classKey === filters.cls)
      && (!q || `${m.name} ${m.surname}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)));
    const box = $('memberList');
    if (!list.length) { box.innerHTML = '<p class="empty">Aucun membre ne correspond.</p>'; return; }
    box.innerHTML = list.map((m) => {
      const c = classOf(m.classKey);
      return `<a class="member" href="#armory/${encodeURIComponent(m.slug)}" style="--c:${c?.color || '#999'}">
        <img src="${ICON('classicon_' + (m.classKey || 'warrior'), 'medium')}" alt="">
        <span class="m-name">${esc(m.name)} <span class="muted">${esc(m.surname)}</span></span>
        <span class="m-info">Niv. ${m.level} · ${esc(raceName(m.raceId))} ${esc(c?.name || '')}</span>
        <span class="m-rank">${esc(RANK_LABEL(m.rank))}</span>
      </a>`;
    }).join('');
  }

  // ---------- Fiche personnage ----------
  async function showCharacter(slug) {
    $('armoryList').hidden = true;
    const sheet = $('armorySheet');
    sheet.hidden = false;
    sheet.innerHTML = '<p class="empty">Chargement du personnage…</p>';
    let ch;
    try { ch = await api(`/character/${encodeURIComponent(slug)}`); } catch (e) {
      sheet.innerHTML = `<a class="back" href="#armory">← Retour à la guilde</a><p class="error">${esc(e.message)}</p>`;
      return;
    }
    const [key, current = ''] = location.hash.slice(1).split('/');
    if (key !== 'armory' || decodeURIComponent(current) !== slug) return; // l'utilisateur a navigué pendant le chargement
    const c = classOf(ch.classKey);
    document.title = `${ch.name} ${ch.surname} — Armurerie`;
    const bySlot = Object.fromEntries(ch.items.map((it) => [it.slot, it]));

    sheet.innerHTML = `
      <a class="back" href="#armory">← Retour à la guilde</a>
      <header class="char-head" style="--c:${c?.color || '#999'}">
        ${ch.avatar ? `<img class="avatar" src="${esc(ch.avatar)}" alt="">` : `<img class="avatar" src="${ICON('classicon_' + ch.classKey, 'large')}" alt="">`}
        <div>
          <h2>${esc(ch.name)} <span class="muted">${esc(ch.surname)}</span></h2>
          <p>Niveau ${ch.level} · ${esc(ch.race || '')} · <b style="color:${c?.color}">${esc(ch.className || '')}</b></p>
          <p class="muted">${esc(RANK_LABEL(ch.rank))} de ${esc(ch.guild)}</p>
        </div>
      </header>
      <div class="char-body">
        <div class="doll">
          <div class="slots">${SLOTS_LEFT.map((s) => slotHTML(s, bySlot[s])).join('')}</div>
          <div class="render">${ch.render ? `<img src="${esc(ch.render)}" alt="Rendu de ${esc(ch.name)}" onerror="this.remove()">` : ''}</div>
          <div class="slots">${SLOTS_RIGHT.map((s) => slotHTML(s, bySlot[s])).join('')}</div>
          <div class="slots bottom">${SLOTS_BOTTOM.map((s) => slotHTML(s, bySlot[s])).join('')}</div>
        </div>
        <aside class="char-side">
          ${talentsHTML(ch)}
          ${statsHTML(ch.stats)}
        </aside>
      </div>
      <p class="muted small">Données de l’API Blizzard, mises à jour à la déconnexion du personnage.</p>`;

    sheet.querySelectorAll('.slot[data-slot]').forEach((n) => {
      const it = bySlot[n.dataset.slot];
      if (!it) return;
      const html = () => itemTooltip(it);
      n.addEventListener('mouseenter', () => TC.positionTooltip(n, html()));
      n.addEventListener('mouseleave', TC.hideTooltip);
      n.addEventListener('focus', () => TC.positionTooltip(n, html()));
      n.addEventListener('blur', TC.hideTooltip);
    });
    const btn = sheet.querySelector('#openInCalc');
    if (btn) btn.addEventListener('click', () => {
      pendingLevel = ch.level;
      location.hash = btn.dataset.hash;
    });
  }

  const qClass = (q) => (QUALITY.includes(q) ? `q-${q.toLowerCase()}` : '');

  function slotHTML(slot, it) {
    if (!it) return `<div class="slot empty-slot"><span class="ico"></span><span class="s-name muted">${SLOT_NAMES[slot]}</span></div>`;
    return `<div class="slot" data-slot="${slot}" tabindex="0">
      <span class="ico ${qClass(it.quality)}"><img src="${it.icon ? esc(it.icon) : ICON('inv_misc_questionmark', 'medium')}" alt=""></span>
      <span class="s-name"><b class="${qClass(it.quality)}">${esc(it.name)}</b><span class="muted">${esc(it.slotName || SLOT_NAMES[slot])}</span></span>
    </div>`;
  }

  function itemTooltip(it) {
    let h = `<div class="tt-name ${qClass(it.quality)}">${esc(it.name)}</div>`;
    it.lines.forEach((l) => { h += `<div class="tt-line ${esc(l.cls || '')}">${esc(l.text)}</div>`; });
    return h;
  }

  // Convertit les talents du perso (ids « définition ») en hash du calculateur.
  function talentHash(ch) {
    const cls = classOf(ch.classKey);
    // L'API marque parfois actif un groupe vide (double spé) : on prend alors celui qui a le plus de points.
    const pts = (g) => g.talents.reduce((s, [, r]) => s + r, 0);
    const active = ch.talentGroups.find((g) => g.active);
    const group = active && pts(active) ? active : [...ch.talentGroups].sort((a, b) => pts(b) - pts(a))[0];
    if (!cls || !group) return null;
    const ranks = new Map(group.talents);
    const points = cls.trees.map((tr) => tr.talents.reduce((s, t) => s + (ranks.get(t.def) || 0), 0));
    const enc = cls.trees.map((tr) => tr.talents.map((t) => Math.min(ranks.get(t.def) || 0, t.max)).join('').replace(/0+$/, ''));
    while (enc.length && !enc[enc.length - 1]) enc.pop();
    const race = LV?.classes[cls.key]?.races.includes(ch.raceId) ? `/r${ch.raceId}` : '';
    return { hash: `#${cls.key}${enc.length ? '/' + enc.join('-') : ''}${race}`, points, cls };
  }

  function talentsHTML(ch) {
    const t = talentHash(ch);
    if (!t) return '<section class="side-box"><h3>Talents</h3><p class="muted">Talents indisponibles.</p></section>';
    const total = t.points.reduce((a, b) => a + b, 0);
    return `<section class="side-box">
      <h3>Talents <span class="muted">${t.points.join(' / ')}</span></h3>
      <ul class="spread">${t.cls.trees.map((tr, i) => `<li><img src="${ICON(tr.icon, 'small')}" alt="">${esc(tr.name)}<b>${t.points[i]}</b></li>`).join('')}</ul>
      <button type="button" class="primary" id="openInCalc" data-hash="${esc(t.hash)}" ${total ? '' : 'disabled'}>Ouvrir dans le calculateur</button>
    </section>`;
  }

  function statsHTML(s) {
    if (!s) return '';
    const pct = (v) => (v == null ? null : `${(+v).toFixed(2)} %`);
    const rows = [
      ['Points de vie', s.health], [s.powerType || 'Ressource', s.power],
      ['Force', s.strength], ['Agilité', s.agility], ['Endurance', s.stamina], ['Intelligence', s.intellect], ['Esprit', s.spirit],
      ['Armure', s.armor], ['Défense', s.defense],
      ['Puissance d’attaque', s.attackPower], ['PA à distance', s.rangedAttackPower], ['Puissance des sorts', s.spellPower || null],
      ['Critique (mêlée)', pct(s.meleeCrit)], ['Critique (distance)', pct(s.rangedCrit)], ['Critique (sorts)', s.spellCrit ? pct(s.spellCrit) : null],
      ['Esquive', pct(s.dodge)], ['Parade', s.parry ? pct(s.parry) : null], ['Blocage', s.block ? pct(s.block) : null],
    ].filter(([, v]) => v != null && v !== '');
    return `<section class="side-box"><h3>Caractéristiques</h3>
      <dl class="stats">${rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(String(v))}</dd>`).join('')}</dl></section>`;
  }

  $('memberSearch').addEventListener('input', async (e) => {
    filters.q = e.target.value.trim();
    try { renderMembers(await loadGuild()); } catch {}
  });
  addEventListener('hashchange', route);
  route();
})();
