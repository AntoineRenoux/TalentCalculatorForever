/** Calculateur : barre d'outils, choix de classe, résumé, ordre des talents, recherche et lien partagé. */
import { talentsConfig } from '../../../config/talents.config.ts';
import { classes } from '../../data/index.ts';
import { byId, el, normalize } from '../../shared/dom.ts';
import { t } from '../../shared/i18n.ts';
import { classIconUrl, iconUrl } from '../../shared/icons.ts';
import { toast } from '../../shared/toast.ts';
import { hideTooltip } from '../../shared/tooltip.ts';
import { observeReveal } from '../../shared/motion.ts';
import { encodeBuild, parseBuild } from './hash.ts';
import { renderTrees, talentNodes } from './render.ts';
import {
  addPoint, allowedRaces, available, canAdd, clampLevel, findClass, notify, onChange, rankOf, remaining,
  requiredLevel, resetAll, state, talentIndex, tierMet, treePoints,
} from './state.ts';

const { rules, cssVars } = talentsConfig;
const ids = {
  classBar: 'classBar', level: 'level', levelDown: 'lvlDown', levelUp: 'lvlUp', removeMode: 'removeMode',
  resetAll: 'resetAll', copyLink: 'copyLink', calc: 'calc', welcome: 'welcome', heading: 'className',
  search: 'search', spread: 'spread', remaining: 'remaining', requiredLevel: 'reqLevel', trees: 'trees',
  order: 'order', orderEmpty: 'orderEmpty', picker: 'classPicker',
} as const;

// ---------- Mise à jour de l'affichage ----------
function paintTrees(): void {
  const cls = state.cls;
  if (!cls) return;
  cls.trees.forEach((tree, ti) => {
    const pts = treePoints(tree);
    const label = document.getElementById(`pts-${ti}`);
    if (label) {
      label.textContent = t('talents.tree.points', { spent: pts, available: available() });
      label.classList.toggle('has', pts > 0);
    }
    tree.talents.forEach((talent) => {
      const button = talentNodes.get(talent.id);
      if (!button) return;
      const r = rankOf(talent.id);
      const open = r > 0 || canAdd(talent, tree);
      button.classList.toggle('locked', !open);
      button.classList.toggle('avail', open && r === 0);
      button.classList.toggle('partial', r > 0 && r < talent.max);
      button.classList.toggle('max', r === talent.max);
      const rankLabel = button.firstElementChild;
      if (rankLabel) rankLabel.textContent = t('talents.talentRank', { rank: r, max: talent.max });
    });
  });
  document.querySelectorAll<HTMLElement>('.arrow').forEach((arrow) => {
    const to = talentIndex.get(Number(arrow.dataset.to));
    const fromId = Number(arrow.dataset.from);
    const qty = to?.talent.req.find(([id]) => id === fromId)?.[1] ?? 0;
    arrow.classList.toggle('ok', !!to && rankOf(fromId) >= qty && tierMet(to.talent, to.tree));
  });
}

function paintSummary(): void {
  const cls = state.cls;
  if (!cls) return;
  byId(ids.spread).textContent = cls.trees.map(treePoints).join(t('talents.summary.spreadSeparator'));
  byId(ids.remaining).textContent = String(remaining());
  byId(ids.requiredLevel).textContent = String(requiredLevel() ?? t('talents.summary.requiredLevelNone'));
}

function paintOrder(): void {
  const list = byId(ids.order);
  list.innerHTML = '';
  const seen = new Map<number, number>();
  state.order.forEach((id, i) => {
    const ref = talentIndex.get(id);
    if (!ref) return;
    const n = (seen.get(id) ?? 0) + 1;
    seen.set(id, n);
    const li = el('li');
    const lv = el('span', 'lv');
    lv.textContent = String(i + rules.minLevel);
    const name = el('span');
    name.textContent = ref.talent.name;
    const rk = el('span', 'rk');
    rk.textContent = t('talents.order.rank', { rank: n, max: ref.talent.max });
    li.append(lv, el('img', '', { src: iconUrl(ref.talent.icon, 'small'), alt: '' }), name, rk);
    list.append(li);
  });
  byId(ids.orderEmpty).hidden = state.order.length > 0;
}

function applySearch(): void {
  const q = normalize(byId<HTMLInputElement>(ids.search).value.trim());
  talentNodes.forEach((button, id) => {
    const ref = talentIndex.get(id);
    const hit = !!q && !!ref && (normalize(ref.talent.name).includes(q) || ref.talent.desc.some((d) => normalize(d).includes(q)));
    button.classList.toggle('match', hit);
    button.classList.toggle('dim', !!q && !hit);
  });
}

function writeHash(): void {
  if (!state.cls) return;
  const hash = encodeBuild(state.cls, rankOf, state.race);
  if (location.hash !== hash) history.replaceState(null, '', hash); // ne déclenche pas hashchange
}

// ---------- Actions ----------
export function selectClass(key: string, silent = false): void {
  const cls = findClass(key);
  if (!cls) return;
  state.cls = cls;
  resetAll();
  const races = allowedRaces(cls);
  if (state.race === null || !races.includes(state.race)) state.race = races[0] ?? null;
  document.querySelectorAll<HTMLElement>('.class-btn').forEach((b) => b.classList.toggle('active', b.dataset.key === key));
  const heading = byId(ids.heading);
  heading.textContent = t('talents.heading', { className: cls.name });
  heading.style.setProperty(cssVars.classColor, cls.color);
  heading.classList.add('cls-text');
  byId(ids.calc).hidden = false;
  byId(ids.welcome).hidden = true;
  document.title = t('talents.documentTitle', { className: cls.name });
  renderTrees(byId(ids.trees));
  if (!silent) notify();
}

export function setLevel(value: number): void {
  let level = clampLevel(Math.round(value) || rules.maxLevel);
  const need = requiredLevel() ?? rules.minLevel;
  if (level < need) {
    toast(t('talents.toast.levelTooLow', { level: need }));
    level = need;
  }
  state.level = level;
  byId<HTMLInputElement>(ids.level).value = String(level);
  notify();
}

export function setRace(race: number): void {
  state.race = race;
  notify();
}

/** Applique un lien de build ; renvoie false si le hash ne désigne pas une classe. */
export function readHash(): boolean {
  const parsed = parseBuild(location.hash);
  const cls = findClass(parsed.classKey);
  if (!cls) return false;
  selectClass(cls.key, true);
  if (parsed.race !== null && allowedRaces(cls).includes(parsed.race)) state.race = parsed.race;
  parsed.trees.forEach((ranks, ti) => {
    const tree = cls.trees[ti];
    if (!tree) return;
    ranks.forEach((wanted, i) => {
      const talent = tree.talents[i];
      if (!talent) return;
      for (let k = 0; k < Math.min(wanted, talent.max); k++) addPoint(talent, tree); // rejoue les règles
    });
  });
  notify();
  return true;
}

/** Écran d'accueil : les classes en grands écus (un clic ouvre la classe). */
function buildClassPicker(): void {
  const list = document.getElementById(ids.picker);
  if (!list) return;
  classes.forEach((c) => {
    const li = el('li');
    const button = el('button', 'choix-classe', { type: 'button', 'data-key': c.key });
    button.style.setProperty(cssVars.classColor, c.color);
    const frame = el('span', 'ecu-cadre choix-classe-ecu');
    frame.append(el('img', '', { src: classIconUrl(c.key, 'large'), alt: '', width: String(talentsConfig.picker.iconSize), height: String(talentsConfig.picker.iconSize) }));
    const name = el('span', 'choix-classe-nom');
    name.textContent = c.name;
    button.append(frame, name);
    button.addEventListener('click', () => selectClass(c.key));
    li.append(button);
    list.append(li);
  });
  observeReveal(list.parentElement ?? document);
}

function buildClassBar(): void {
  const bar = byId(ids.classBar);
  classes.forEach((c) => {
    const button = el('button', 'class-btn', { type: 'button', title: c.name, 'aria-label': c.name, 'data-key': c.key });
    button.style.backgroundImage = `url(${classIconUrl(c.key)})`;
    button.style.setProperty(cssVars.classColor, c.color);
    button.addEventListener('click', () => selectClass(c.key));
    bar.append(button);
  });
}

export function initCalculator(): void {
  buildClassBar();
  buildClassPicker();
  const levelInput = byId<HTMLInputElement>(ids.level);
  levelInput.min = String(rules.minLevel);
  levelInput.max = String(rules.maxLevel);
  levelInput.value = String(state.level);

  byId(ids.levelDown).addEventListener('click', () => setLevel(state.level - 1));
  byId(ids.levelUp).addEventListener('click', () => setLevel(state.level + 1));
  levelInput.addEventListener('change', () => setLevel(Number(levelInput.value)));
  byId(ids.resetAll).addEventListener('click', () => { if (state.cls) { resetAll(); notify(); } });
  byId(ids.removeMode).addEventListener('click', (e) => {
    state.removeMode = !state.removeMode;
    (e.currentTarget as HTMLElement).classList.toggle('on', state.removeMode);
    toast(state.removeMode ? t('talents.toast.removeOn') : t('talents.toast.removeOff'));
  });
  byId(ids.copyLink).addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(location.href); toast(t('talents.toast.linkCopied')); }
    catch { toast(location.href); }
  });
  byId(ids.search).addEventListener('input', applySearch);
  addEventListener('scroll', hideTooltip, { passive: true });

  onChange(() => {
    if (!state.cls) return;
    paintTrees();
    paintSummary();
    paintOrder();
    applySearch();
    writeHash();
  });
}
