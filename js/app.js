/* Calculateur de talents — WoW Forever / Classic+
 * Règles : 1 point par niveau à partir du 10 (51 points au niveau 60),
 * chaque rangée d'un arbre demande 5 points de plus dans cet arbre,
 * certains talents exigent un autre talent au rang maximum (flèches). */
(() => {
  'use strict';

  const DATA = window.TALENT_DATA;
  const ICON = (name, size = 'large') => `https://wow.zamimg.com/images/wow/icons/${size}/${name}.jpg`;
  const MIN_LEVEL = 10, MAX_LEVEL = 60, ROWS = 7, PTS_PER_ROW = 5;

  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, attrs = {}) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };

  // ---------- État ----------
  const state = {
    cls: null,          // objet classe courant
    ranks: new Map(),   // id talent -> rang
    order: [],          // ids talents dans l'ordre où les points ont été mis
    level: MAX_LEVEL,
    removeMode: false,
    race: null,         // id de race (traits raciaux et sorts propres à une race)
  };
  const index = new Map(); // id talent -> { t, tree, treeIdx }
  const nodes = new Map(); // id talent -> bouton DOM

  // ---------- Calculs ----------
  const rank = (id) => state.ranks.get(id) || 0;
  const treePoints = (tree) => tree.talents.reduce((s, t) => s + rank(t.id), 0);
  const spent = () => state.cls ? state.cls.trees.reduce((s, tr) => s + treePoints(tr), 0) : 0;
  const available = () => state.level - MIN_LEVEL + 1;
  const remaining = () => available() - spent();
  const requiredLevel = () => (spent() ? spent() + MIN_LEVEL - 1 : null);

  function prereqsMet(t) {
    return t.req.every(([id, qty]) => rank(id) >= qty);
  }
  function tierMet(t, tree) {
    return treePoints(tree) >= t.r * PTS_PER_ROW;
  }
  function canAdd(t, tree) {
    return remaining() > 0 && rank(t.id) < t.max && tierMet(t, tree) && prereqsMet(t);
  }
  // Un arbre est valide si chaque talent investi respecte les points
  // dépensés dans les rangées au-dessus de lui, et ses prérequis.
  function treeValid(tree) {
    for (const t of tree.talents) {
      if (!rank(t.id)) continue;
      const above = tree.talents.reduce((s, o) => s + (o.r < t.r ? rank(o.id) : 0), 0);
      if (above < t.r * PTS_PER_ROW || !prereqsMet(t)) return false;
    }
    return true;
  }
  function canRemove(t, tree) {
    const r = rank(t.id);
    if (!r) return false;
    state.ranks.set(t.id, r - 1);
    const ok = treeValid(tree);
    state.ranks.set(t.id, r);
    return ok;
  }

  function addPoint(t, tree) {
    if (!canAdd(t, tree)) return false;
    state.ranks.set(t.id, rank(t.id) + 1);
    state.order.push(t.id);
    return true;
  }
  function removePoint(t, tree) {
    if (!canRemove(t, tree)) return false;
    const r = rank(t.id) - 1;
    if (r) state.ranks.set(t.id, r); else state.ranks.delete(t.id);
    const i = state.order.lastIndexOf(t.id);
    if (i >= 0) state.order.splice(i, 1);
    return true;
  }
  function resetTree(tree) {
    const ids = new Set(tree.talents.map((t) => t.id));
    ids.forEach((id) => state.ranks.delete(id));
    state.order = state.order.filter((id) => !ids.has(id));
  }

  // ---------- Texte des infobulles ----------
  // Les descriptions viennent d'une source externe : on ne garde que <br> et
  // les couleurs de <span>, tout le reste est échappé.
  function cleanDesc(html) {
    const noComments = html.replace(/<!--[\s\S]*?-->/g, '');
    const parts = noComments.split(/(<[^>]+>)/g);
    return parts.map((p) => {
      if (!p.startsWith('<')) return p.replace(/&(?!(?:[a-z]+|#\d+);)/gi, '&amp;');
      if (/^<br\s*\/?>$/i.test(p)) return '<br>';
      if (/^<\/span>$/i.test(p)) return '</span>';
      const m = p.match(/^<span[^>]*color:\s*(#[0-9a-f]{3,8})/i);
      if (m) return `<span style="color:${m[1]}">`;
      if (/^<span/i.test(p)) return '<span>';
      if (/^<\/?(tr|table)/i.test(p)) return '<br>';
      if (/^<td/i.test(p)) return ' ';
      return '';
    }).join('');
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function tooltipHTML(t, tree) {
    const r = rank(t.id);
    let h = `<div class="tt-name">${esc(t.name)}</div><div class="tt-rank">Rang ${r}/${t.max}</div>`;
    if (!tierMet(t, tree) && r === 0) {
      h += `<div class="tt-req">Nécessite ${t.r * PTS_PER_ROW} points en ${esc(tree.name)}</div>`;
    }
    for (const [id, qty] of t.req) {
      if (rank(id) < qty) {
        const p = index.get(id).t;
        h += `<div class="tt-req">Nécessite ${qty} point${qty > 1 ? 's' : ''} en ${esc(p.name)}</div>`;
      }
    }
    if (r > 0) h += `<div class="tt-desc">${cleanDesc(t.desc[r - 1])}</div>`;
    if (r < t.max) {
      if (r > 0) h += `<div class="tt-next">Rang suivant :</div>`;
      h += `<div class="tt-desc">${cleanDesc(t.desc[r])}</div>`;
    }
    if (canAdd(t, tree)) h += `<div class="tt-hint add">Cliquez pour apprendre</div>`;
    if (canRemove(t, tree)) h += `<div class="tt-hint rem">Clic droit pour désapprendre</div>`;
    return h;
  }

  // ---------- Rendu ----------
  function buildClassBar() {
    const bar = $('classBar');
    DATA.forEach((c) => {
      const b = el('button', 'class-btn', { type: 'button', title: c.name, 'aria-label': c.name, 'data-key': c.key });
      b.style.backgroundImage = `url(${ICON('classicon_' + c.key, 'medium')})`;
      b.style.setProperty('--c', c.color);
      b.addEventListener('click', () => selectClass(c.key));
      bar.appendChild(b);
    });
  }

  function cellPos(r, c) {
    const cs = getComputedStyle(document.documentElement);
    const cell = parseFloat(cs.getPropertyValue('--cell'));
    const icon = parseFloat(cs.getPropertyValue('--icon'));
    const off = (cell - icon) / 2;
    return { x: c * cell + off, y: r * cell + off, size: icon, cx: c * cell + cell / 2, cy: r * cell + cell / 2 };
  }

  // Dessine une flèche du prérequis vers le talent.
  function drawArrow(grid, from, to, id, reqId) {
    const a = cellPos(from.r, from.c), b = cellPos(to.r, to.c);
    const segs = [];
    const T = 6; // épaisseur
    if (from.r === to.r) {
      const right = to.c > from.c;
      const x1 = right ? a.x + a.size : b.x + b.size + 10;
      const x2 = right ? b.x - 10 : a.x;
      segs.push({ cls: `h ${right ? 'right' : 'left'}`, l: x1, t: a.cy - T / 2, w: x2 - x1, h: T });
    } else if (from.c === to.c) {
      segs.push({ cls: 'v', l: a.cx - T / 2, t: a.y + a.size, w: T, h: b.y - (a.y + a.size) - 10 });
    } else {
      // coude : horizontal depuis la source, puis vers le bas jusqu'à la cible
      const right = to.c > from.c;
      const x1 = right ? a.x + a.size : b.cx - T / 2;
      const x2 = right ? b.cx + T / 2 : a.x;
      segs.push({ cls: 'h', l: x1, t: a.cy - T / 2, w: x2 - x1, h: T });
      segs.push({ cls: 'v', l: b.cx - T / 2, t: a.cy + T / 2, w: T, h: b.y - a.cy - T / 2 - 10 });
    }
    return segs.map((s) => {
      const d = el('div', `arrow ${s.cls}`);
      Object.assign(d.style, { left: s.l + 'px', top: s.t + 'px', width: s.w + 'px', height: s.h + 'px' });
      d.dataset.to = id;
      d.dataset.from = reqId;
      grid.appendChild(d);
      return d;
    });
  }

  function renderTrees() {
    const wrap = $('trees');
    wrap.innerHTML = '';
    nodes.clear();
    const c = state.cls;
    c.trees.forEach((tree, ti) => {
      const box = el('section', 'tree');
      box.style.setProperty('--c', c.color);

      const head = el('header', 'tree-head');
      const img = el('img', '', { src: ICON(tree.icon, 'medium'), alt: '' });
      const name = el('span', 'name'); name.textContent = tree.name;
      const pts = el('span', 'pts'); pts.id = `pts-${ti}`;
      head.append(img, name, pts);

      const body = el('div', 'tree-body');
      const grid = el('div', 'grid');
      body.appendChild(grid);

      tree.talents.forEach((t) => {
        t.req.forEach(([reqId]) => drawArrow(grid, index.get(reqId).t, t, t.id, reqId));
      });

      tree.talents.forEach((t) => {
        const p = cellPos(t.r, t.c);
        const b = el('button', 'talent', { type: 'button', 'aria-label': t.name });
        b.style.left = p.x + 'px';
        b.style.top = p.y + 'px';
        b.style.backgroundImage = `url(${ICON(t.icon)})`;
        const rk = el('span', 'rank');
        b.appendChild(rk);
        bindTalent(b, t, tree);
        nodes.set(t.id, b);
        grid.appendChild(b);
      });

      const foot = el('footer', 'tree-foot');
      const reset = el('button', '', { type: 'button' });
      reset.textContent = '✕ Réinitialiser';
      reset.addEventListener('click', () => { resetTree(tree); update(); });
      foot.appendChild(reset);

      box.append(head, body, foot);
      wrap.appendChild(box);
    });
  }

  function bindTalent(b, t, tree) {
    const act = (remove) => {
      const ok = remove ? removePoint(t, tree) : addPoint(t, tree);
      if (!ok) { b.classList.remove('flash'); void b.offsetWidth; b.classList.add('flash'); }
      update();
      showTooltip(b, t, tree);
    };
    b.addEventListener('click', (e) => act(e.shiftKey || state.removeMode));
    b.addEventListener('contextmenu', (e) => { e.preventDefault(); act(true); });
    b.addEventListener('mouseenter', () => showTooltip(b, t, tree));
    b.addEventListener('mouseleave', hideTooltip);
    b.addEventListener('focus', () => showTooltip(b, t, tree));
    b.addEventListener('blur', hideTooltip);
  }

  let ttTimer = 0;
  function showTooltip(anchor, t, tree) {
    positionTooltip(anchor, tooltipHTML(t, tree));
  }
  function positionTooltip(anchor, html) {
    const tt = $('tooltip');
    tt.innerHTML = html;
    tt.hidden = false;
    const r = anchor.getBoundingClientRect();
    const w = tt.offsetWidth, h = tt.offsetHeight;
    let x = r.right + 10, y = r.top - 4;
    if (x + w > innerWidth - 8) x = Math.max(8, r.left - w - 10);
    if (y + h > innerHeight - 8) y = Math.max(8, innerHeight - h - 8);
    tt.style.left = x + 'px';
    tt.style.top = y + 'px';
    clearTimeout(ttTimer);
    if (matchMedia('(hover: none)').matches) ttTimer = setTimeout(hideTooltip, 3500);
  }
  function hideTooltip() { $('tooltip').hidden = true; }

  function update() {
    const c = state.cls;
    if (!c) return;
    c.trees.forEach((tree, ti) => {
      const p = treePoints(tree);
      const ptsEl = $(`pts-${ti}`);
      ptsEl.textContent = `${p} / ${available()}`;
      ptsEl.classList.toggle('has', p > 0);
      tree.talents.forEach((t) => {
        const b = nodes.get(t.id);
        const r = rank(t.id);
        const open = r > 0 || canAdd(t, tree);
        b.classList.toggle('locked', !open);
        b.classList.toggle('avail', open && r === 0);
        b.classList.toggle('partial', r > 0 && r < t.max);
        b.classList.toggle('max', r === t.max);
        b.firstChild.textContent = `${r}/${t.max}`;
      });
    });
    document.querySelectorAll('.arrow').forEach((a) => {
      const to = index.get(+a.dataset.to).t;
      const from = index.get(+a.dataset.from).t;
      const qty = to.req.find(([id]) => id === from.id)[1];
      a.classList.toggle('ok', rank(from.id) >= qty && tierMet(to, index.get(to.id).tree));
    });

    $('spread').textContent = c.trees.map(treePoints).join(' / ');
    $('remaining').textContent = remaining();
    $('reqLevel').textContent = requiredLevel() ?? '—';
    renderOrder();
    applySearch();
    writeHash();
    document.dispatchEvent(new CustomEvent('tc:update'));
  }

  function renderOrder() {
    const ol = $('order');
    ol.innerHTML = '';
    const seen = new Map();
    state.order.forEach((id, i) => {
      const { t } = index.get(id);
      const n = (seen.get(id) || 0) + 1;
      seen.set(id, n);
      const li = el('li');
      li.innerHTML = `<span class="lv">${i + MIN_LEVEL}</span>`;
      const img = el('img', '', { src: ICON(t.icon, 'small'), alt: '' });
      const nm = el('span'); nm.textContent = t.name;
      const rk = el('span', 'rk'); rk.textContent = `${n}/${t.max}`;
      li.append(img, nm, rk);
      ol.appendChild(li);
    });
    $('orderEmpty').hidden = state.order.length > 0;
  }

  function applySearch() {
    const q = norm($('search').value.trim());
    nodes.forEach((b, id) => {
      const { t } = index.get(id);
      const hit = q && (norm(t.name).includes(q) || t.desc.some((d) => norm(d).includes(q)));
      b.classList.toggle('match', !!hit);
      b.classList.toggle('dim', !!q && !hit);
    });
  }
  const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // ---------- URL partageable : #classe[/rangs-arbre1-arbre2-arbre3][/r<race>] ----------
  function writeHash() {
    const enc = state.cls.trees.map((tr) => tr.talents.map((t) => rank(t.id)).join('').replace(/0+$/, ''));
    while (enc.length && !enc[enc.length - 1]) enc.pop();
    let h = `#${state.cls.key}${enc.length ? '/' + enc.join('-') : ''}`;
    if (state.race) h += `/r${state.race}`;
    if (location.hash !== h) history.replaceState(null, '', h); // ne déclenche pas hashchange
  }
  function readHash() {
    const [key, ...rest] = location.hash.slice(1).split('/');
    const c = DATA.find((x) => x.key === key);
    if (!c) return false;
    const raceSeg = rest.find((s) => /^r\d+$/.test(s));
    const build = rest.find((s) => !/^r\d+$/.test(s)) || '';
    selectClass(c.key, true);
    if (raceSeg && allowedRaces(c).includes(+raceSeg.slice(1))) state.race = +raceSeg.slice(1);
    build.split('-').forEach((s, ti) => {
      const tree = c.trees[ti];
      if (!tree) return;
      [...s].forEach((ch, i) => {
        const t = tree.talents[i];
        const n = Math.min(+ch || 0, t ? t.max : 0);
        for (let k = 0; k < n; k++) addPoint(t, tree); // respecte les règles
      });
    });
    update();
    return true;
  }

  // ---------- Actions globales ----------
  function selectClass(key, silent) {
    const c = DATA.find((x) => x.key === key);
    if (!c) return;
    state.cls = c;
    state.ranks.clear();
    state.order = [];
    const races = allowedRaces(c);
    if (!races.includes(state.race)) state.race = races[0] ?? null;
    document.querySelectorAll('.class-btn').forEach((b) => b.classList.toggle('active', b.dataset.key === key));
    $('className').textContent = `Talents — ${c.name}`;
    $('className').style.setProperty('--c', c.color);
    $('className').classList.add('cls-text');
    $('calc').hidden = false;
    $('welcome').hidden = true;
    document.title = `Calculateur de talents — ${c.name}`;
    renderTrees();
    if (!silent) update();
  }

  function setLevel(v) {
    v = Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, Math.round(+v) || MAX_LEVEL));
    const need = requiredLevel() ?? MIN_LEVEL;
    if (v < need) { toast(`Ce build demande au moins le niveau ${need}.`); v = need; }
    state.level = v;
    $('level').value = v;
    update();
  }

  let toastTimer = 0;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
  }

  function init() {
    DATA.forEach((c) => c.trees.forEach((tree, treeIdx) => tree.talents.forEach((t) => index.set(t.id, { t, tree, treeIdx }))));
    buildClassBar();

    $('lvlDown').addEventListener('click', () => setLevel(state.level - 1));
    $('lvlUp').addEventListener('click', () => setLevel(state.level + 1));
    $('level').addEventListener('change', (e) => setLevel(e.target.value));
    $('resetAll').addEventListener('click', () => {
      if (!state.cls) return;
      state.ranks.clear(); state.order = []; update();
    });
    $('removeMode').addEventListener('click', (e) => {
      state.removeMode = !state.removeMode;
      e.currentTarget.classList.toggle('on', state.removeMode);
      toast(state.removeMode ? 'Mode retrait activé' : 'Mode ajout activé');
    });
    $('copyLink').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(location.href); toast('Lien copié !'); }
      catch { toast(location.href); }
    });
    $('search').addEventListener('input', applySearch);
    addEventListener('hashchange', readHash);
    addEventListener('scroll', hideTooltip, { passive: true });

    if (!readHash()) {
      $('calc').hidden = true;
    }
  }

  function allowedRaces(c) {
    const lv = window.LEVELING_DATA;
    return lv && lv.classes[c.key] ? lv.classes[c.key].races : [];
  }

  // API lue par leveling-ui.js
  window.TC = {
    state, index, ICON, MIN_LEVEL, cleanDesc, esc,
    positionTooltip, hideTooltip,
    setRace(r) { state.race = r; update(); },
    setLevel,
  };

  init();
})();
