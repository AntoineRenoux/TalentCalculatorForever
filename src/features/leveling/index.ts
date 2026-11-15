/** Traits raciaux, progression niveau par niveau (sorts + points de talent) et grimoire au niveau choisi. */
import { levelingConfig } from '../../../config/leveling.config.ts';
import { talentsConfig } from '../../../config/talents.config.ts';
import { leveling, type ClassSpell } from '../../data/index.ts';
import { byId, el, esc, normalize } from '../../shared/dom.ts';
import { t, tDynamic } from '../../shared/i18n.ts';
import { iconName, iconUrl } from '../../shared/icons.ts';
import { cleanDescription } from '../../shared/sanitize.ts';
import { bindTooltip } from '../../shared/tooltip.ts';
import { setRace } from '../talents/calculator.ts';
import { onChange, state, talentIndex } from '../talents/state.ts';

const { minLevel, maxLevel } = talentsConfig.rules;
const ids = {
  raceSelect: 'raceSelect', racials: 'racials', schoolChips: 'schoolChips', timeline: 'timeline',
  spellSearch: 'spellSearch', foreverOnly: 'foreverOnly', untilLevel: 'untilLevel',
  bookTabs: 'bookTabs', bookLevel: 'bookLevel', book: 'book', allRanks: 'allRanks',
} as const;

const ui = {
  classKey: null as string | null,
  /** Écoles cochées dans la progression (vide = toutes). */
  schools: new Set<number>(),
  /** Onglet du grimoire (null = toutes les écoles). */
  bookSchool: null as number | null,
};

interface Spell { id: number; name: string; rank: string; icon: string; desc: string }

function spell(id: number): Spell {
  const [name = '', rank = '', icon = '', desc = ''] = leveling.spells[id] ?? [];
  return { id, name, rank, icon: iconName(icon), desc };
}
function school(id: number): { name: string; icon: string } {
  const s = leveling.schools[id];
  return { name: s?.name ?? '', icon: iconName(s?.icon) };
}
const checked = (id: string): boolean => byId<HTMLInputElement>(id).checked;
const currentClass = () => (ui.classKey ? leveling.classes[ui.classKey] : undefined);
const classSpells = (): ClassSpell[] => (currentClass()?.spells ?? []).filter((e) => !e.race || e.race === state.race);
const changeBadge = (e: ClassSpell): string => {
  if (!e.ch) return '';
  const c = levelingConfig.changes[e.ch];
  return `<span class="tag ${c.className}">${esc(tDynamic(c.labelKey))}</span>`;
};

function spellTooltip(e: ClassSpell): string {
  const s = spell(e.id);
  let html = `<div class="tt-name">${esc(s.name)}</div>`;
  if (s.rank) html += `<div class="tt-rank">${esc(s.rank)}</div>`;
  html += `<div class="tt-rank">${esc(t('leveling.tooltip.schoolAndLevel', { school: school(e.s).name, level: e.l }))}</div>`;
  if (e.ch) html += `<div class="tt-forever">${esc(tDynamic(levelingConfig.changes[e.ch].labelKey))}</div>`;
  if (s.desc) html += `<div class="tt-desc">${cleanDescription(s.desc)}</div>`;
  return html;
}

// ---------- Traits raciaux ----------
function renderRaces(): void {
  const select = byId<HTMLSelectElement>(ids.raceSelect);
  const races = currentClass()?.races ?? [];
  select.innerHTML = races.map((r) => `<option value="${r}">${esc(leveling.races[r]?.name ?? '')}</option>`).join('');
  select.value = String(state.race);

  const box = byId(ids.racials);
  box.innerHTML = '';
  (currentClass()?.racials[String(state.race)] ?? []).forEach((id) => {
    const s = spell(id);
    const card = el('article', 'racial');
    card.innerHTML = `<img src="${iconUrl(s.icon, 'medium')}" alt=""><div><h4>${esc(s.name)}</h4><p>${cleanDescription(s.desc)}</p></div>`;
    box.append(card);
  });
}

// ---------- Progression par niveau ----------
function renderSchoolChips(): void {
  const wrap = byId(ids.schoolChips);
  wrap.innerHTML = '';
  (currentClass()?.schools ?? []).forEach((sid) => {
    const sc = school(sid);
    const chip = el('button', 'chip', { type: 'button' });
    chip.innerHTML = `<img src="${iconUrl(sc.icon, 'small')}" alt="">${esc(sc.name)}`;
    chip.addEventListener('click', () => {
      if (ui.schools.has(sid)) ui.schools.delete(sid); else ui.schools.add(sid);
      chip.classList.toggle('on', ui.schools.has(sid));
      renderTimeline();
    });
    wrap.append(chip);
  });
}

function talentRow(id: number | undefined, level: number): HTMLElement {
  const row = el('div', 'row talent-pt');
  const ref = id === undefined ? undefined : talentIndex.get(id);
  if (!ref || id === undefined) {
    row.innerHTML = `<span class="pt-dot">${esc(t('leveling.timeline.talentPointBadge'))}</span><span class="muted">${esc(t('leveling.timeline.talentPointFree'))}</span>`;
    return row;
  }
  const n = state.order.slice(0, level - minLevel + 1).filter((x) => x === id).length;
  row.innerHTML = `<img src="${iconUrl(ref.talent.icon, 'small')}" alt="">
    <div class="row-main"><b>${esc(ref.talent.name)}</b> <span class="muted">${esc(t('leveling.timeline.talentPointRank', { rank: n, max: ref.talent.max, tree: ref.tree.name }))}</span></div>
    <span class="tag tag-talent">${esc(t('leveling.timeline.talentTag'))}</span>`;
  return row;
}

function spellRow(e: ClassSpell): HTMLElement {
  const s = spell(e.id);
  const row = el('div', 'row', { tabindex: '0' });
  row.innerHTML = `<img src="${iconUrl(s.icon, 'small')}" alt="">
    <div class="row-main">
      <div><b>${esc(s.name)}</b>${s.rank ? ` <span class="muted">${esc(s.rank)}</span>` : ''}
        <span class="tag school">${esc(school(e.s).name)}</span>${changeBadge(e)}</div>
      ${s.desc ? `<p class="desc">${cleanDescription(s.desc)}</p>` : ''}
    </div>`;
  return row;
}

function renderTimeline(): void {
  const list = byId(ids.timeline);
  const q = normalize(byId<HTMLInputElement>(ids.spellSearch).value.trim());
  const onlyForever = checked(ids.foreverOnly);
  const lastLevel = checked(ids.untilLevel) ? state.level : maxLevel;

  const byLevel = new Map<number, ClassSpell[]>();
  classSpells().forEach((e) => {
    if (ui.schools.size && !ui.schools.has(e.s)) return;
    if (onlyForever && !e.ch) return;
    if (q) {
      const s = spell(e.id);
      if (!normalize(s.name).includes(q) && !normalize(s.desc).includes(q)) return;
    }
    byLevel.set(e.l, [...(byLevel.get(e.l) ?? []), e]);
  });

  const filtering = !!q || onlyForever || ui.schools.size > 0;
  list.innerHTML = '';
  for (let level = 1; level <= lastLevel; level++) {
    const spells = byLevel.get(level) ?? [];
    const talentSlot = !filtering && level >= minLevel;
    if (!spells.length && !talentSlot) continue;
    const li = el('li', ['lvl', level > state.level ? 'future' : '', level === state.level ? 'current' : ''].filter(Boolean).join(' '));
    li.innerHTML = `<div class="lvl-num"><span>${esc(t('leveling.timeline.levelShort'))}</span>${level}</div>`;
    const body = el('div', 'lvl-body');
    if (talentSlot) body.append(talentRow(state.order[level - minLevel], level));
    spells.forEach((e) => body.append(spellRow(e)));
    li.append(body);
    list.append(li);
  }
  if (!list.children.length) list.innerHTML = `<li class="empty">${esc(t('leveling.timeline.noMatch'))}</li>`;
}

// ---------- Grimoire : plus haut rang connu de chaque sort ----------
function renderBookTabs(): void {
  const wrap = byId(ids.bookTabs);
  wrap.innerHTML = '';
  const tab = (sid: number | null, label: string, icon?: string) => {
    const chip = el('button', `chip${ui.bookSchool === sid ? ' on' : ''}`, { type: 'button' });
    chip.innerHTML = (icon ? `<img src="${iconUrl(icon, 'small')}" alt="">` : '') + esc(label);
    chip.addEventListener('click', () => { ui.bookSchool = sid; renderBookTabs(); renderBook(); });
    wrap.append(chip);
  };
  tab(null, t('leveling.book.all'));
  (currentClass()?.schools ?? []).forEach((sid) => tab(sid, school(sid).name, school(sid).icon));
}

function renderBook(): void {
  byId(ids.bookLevel).textContent = String(state.level);
  const box = byId(ids.book);
  const known = classSpells().filter((e) => e.l <= state.level && (ui.bookSchool === null || e.s === ui.bookSchool));
  let list = known;
  if (!checked(ids.allRanks)) {
    const best = new Map<string, ClassSpell>(); // nom + école → entrée du plus haut niveau
    known.forEach((e) => {
      const key = `${spell(e.id).name}|${e.s}`;
      const cur = best.get(key);
      if (!cur || e.l >= cur.l) best.set(key, e);
    });
    list = [...best.values()];
  }
  box.innerHTML = '';
  (currentClass()?.schools ?? []).filter((sid) => ui.bookSchool === null || sid === ui.bookSchool).forEach((sid) => {
    const items = list.filter((e) => e.s === sid).sort((a, b) => a.l - b.l || spell(a.id).name.localeCompare(spell(b.id).name));
    if (!items.length) return;
    const section = el('section', 'book-school');
    section.innerHTML = `<h4><img src="${iconUrl(school(sid).icon, 'small')}" alt="">${esc(school(sid).name)} <span class="muted">${esc(t('leveling.book.spellCount', { count: items.length }))}</span></h4>`;
    const grid = el('div', 'book-grid');
    items.forEach((e) => {
      const s = spell(e.id);
      const card = el('div', `book-item${e.ch ? ' forever' : ''}`, { tabindex: '0' });
      const meta = s.rank ? t('leveling.book.rankAndLevel', { rank: s.rank, level: e.l }) : t('leveling.book.level', { level: e.l });
      card.innerHTML = `<img src="${iconUrl(s.icon, 'medium')}" alt=""><div><b>${esc(s.name)}</b><span class="muted">${esc(meta)}</span></div>`;
      bindTooltip(card, () => spellTooltip(e));
      grid.append(card);
    });
    section.append(grid);
    box.append(section);
  });
  if (!box.children.length) box.innerHTML = `<p class="empty">${esc(t('leveling.book.empty'))}</p>`;
}

function refresh(): void {
  if (!state.cls) return;
  if (ui.classKey !== state.cls.key) {
    ui.classKey = state.cls.key;
    ui.schools.clear();
    ui.bookSchool = null;
    renderSchoolChips();
    renderBookTabs();
  }
  renderRaces();
  renderTimeline();
  renderBook();
}

export function initLeveling(): void {
  const { defaults } = levelingConfig;
  byId<HTMLInputElement>(ids.foreverOnly).checked = defaults.foreverOnly;
  byId<HTMLInputElement>(ids.untilLevel).checked = defaults.untilLevel;
  byId<HTMLInputElement>(ids.allRanks).checked = defaults.allRanks;
  byId<HTMLSelectElement>(ids.raceSelect).addEventListener('change', (e) => setRace(Number((e.target as HTMLSelectElement).value)));
  [ids.foreverOnly, ids.untilLevel].forEach((id) => byId(id).addEventListener('change', renderTimeline));
  byId(ids.spellSearch).addEventListener('input', renderTimeline);
  byId(ids.allRanks).addEventListener('change', renderBook);
  onChange(refresh);
}
